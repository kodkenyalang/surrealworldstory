// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @title IPStablecoin
 * @dev ERC20 stablecoin compatible with Story Protocol blockchain
 * Allows borrowing up to 90% of staked token value from Story Protocol IP assets
 * Collateralized by liquid staking tokens (LST) from indigenous IP assets
 * Integrates with Story Protocol price oracles and governance systems
 */
contract IPStablecoin is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // Borrowing parameters
    uint256 public constant COLLATERAL_RATIO = 9000; // 90% LTV (9000 basis points)
    uint256 public constant LIQUIDATION_THRESHOLD = 9500; // 95% liquidation threshold
    uint256 public constant LIQUIDATION_PENALTY = 500; // 5% liquidation penalty
    uint256 public constant INTEREST_RATE = 300; // 3% annual interest rate
    uint256 public constant MIN_BORROW_AMOUNT = 100 * 10**18; // 100 stablecoin minimum
    
    // Collateral token (Liquid Staking Token)
    IERC20 public immutable collateralToken;
    
    // Price oracle interface
    interface IPriceOracle {
        function getPrice() external view returns (uint256);
        function decimals() external view returns (uint8);
    }
    
    IPriceOracle public priceOracle;
    
    // Loan positions
    struct LoanPosition {
        uint256 collateralAmount;      // Amount of LST deposited as collateral
        uint256 borrowedAmount;        // Amount of stablecoin borrowed
        uint256 borrowTimestamp;       // When the loan was taken
        uint256 accruedInterest;       // Interest accrued so far
        uint256 lastInterestUpdate;    // Last time interest was calculated
        bool isActive;                 // Whether the loan is active
    }
    
    mapping(address => LoanPosition) public loanPositions;
    
    // Protocol statistics
    uint256 public totalCollateralDeposited;
    uint256 public totalStablecoinMinted;
    uint256 public totalInterestAccrued;
    
    // Liquidation settings
    mapping(address => bool) public liquidators;
    uint256 public liquidatorReward = 200; // 2% reward for liquidators
    
    // Emergency settings
    bool public emergencyShutdown = false;
    
    // Events
    event CollateralDeposited(address indexed user, uint256 amount);
    event StablecoinBorrowed(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 principal, uint256 interest);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event PositionLiquidated(
        address indexed borrower,
        address indexed liquidator,
        uint256 collateralLiquidated,
        uint256 debtRepaid
    );
    event InterestUpdated(address indexed user, uint256 newInterest);
    event PriceOracleUpdated(address indexed newOracle);
    
    constructor(
        address _collateralToken,
        address _priceOracle,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        collateralToken = IERC20(_collateralToken);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    /**
     * @dev Deposit collateral (LST tokens)
     * @param amount Amount of LST tokens to deposit
     */
    function depositCollateral(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(!emergencyShutdown, "Emergency shutdown active");
        
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "Collateral transfer failed"
        );
        
        LoanPosition storage position = loanPositions[msg.sender];
        position.collateralAmount += amount;
        
        if (!position.isActive) {
            position.isActive = true;
            position.lastInterestUpdate = block.timestamp;
        }
        
        totalCollateralDeposited += amount;
        
        emit CollateralDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Borrow stablecoin against collateral
     * @param amount Amount of stablecoin to borrow
     */
    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_BORROW_AMOUNT, "Amount below minimum");
        require(!emergencyShutdown, "Emergency shutdown active");
        
        LoanPosition storage position = loanPositions[msg.sender];
        require(position.isActive, "No active position");
        
        // Update accrued interest before borrowing
        _updateInterest(msg.sender);
        
        // Calculate maximum borrowable amount
        uint256 collateralValue = _getCollateralValue(position.collateralAmount);
        uint256 maxBorrowable = (collateralValue * COLLATERAL_RATIO) / 10000;
        uint256 currentDebt = position.borrowedAmount + position.accruedInterest;
        
        require(currentDebt + amount <= maxBorrowable, "Exceeds borrowing capacity");
        
        position.borrowedAmount += amount;
        position.borrowTimestamp = block.timestamp;
        
        totalStablecoinMinted += amount;
        
        // Mint stablecoin to borrower
        _mint(msg.sender, amount);
        
        emit StablecoinBorrowed(msg.sender, amount);
    }
    
    /**
     * @dev Repay borrowed stablecoin
     * @param amount Amount to repay (0 = repay all)
     */
    function repay(uint256 amount) external nonReentrant {
        LoanPosition storage position = loanPositions[msg.sender];
        require(position.isActive, "No active position");
        
        // Update accrued interest
        _updateInterest(msg.sender);
        
        uint256 totalDebt = position.borrowedAmount + position.accruedInterest;
        
        if (amount == 0 || amount > totalDebt) {
            amount = totalDebt;
        }
        
        require(balanceOf(msg.sender) >= amount, "Insufficient stablecoin balance");
        
        // Calculate how much goes to principal vs interest
        uint256 interestPayment = amount > position.accruedInterest ? 
            position.accruedInterest : amount;
        uint256 principalPayment = amount - interestPayment;
        
        position.accruedInterest -= interestPayment;
        position.borrowedAmount -= principalPayment;
        
        totalInterestAccrued += interestPayment;
        totalStablecoinMinted -= principalPayment;
        
        // Burn repaid stablecoin
        _burn(msg.sender, amount);
        
        emit LoanRepaid(msg.sender, principalPayment, interestPayment);
        
        // If fully repaid, allow collateral withdrawal
        if (position.borrowedAmount == 0 && position.accruedInterest == 0) {
            // Position remains active for collateral withdrawal
        }
    }
    
    /**
     * @dev Withdraw collateral after repaying debt
     * @param amount Amount of collateral to withdraw (0 = withdraw all)
     */
    function withdrawCollateral(uint256 amount) external nonReentrant {
        LoanPosition storage position = loanPositions[msg.sender];
        require(position.isActive, "No active position");
        
        // Update interest
        _updateInterest(msg.sender);
        
        uint256 totalDebt = position.borrowedAmount + position.accruedInterest;
        
        if (totalDebt == 0) {
            // Full withdrawal allowed if no debt
            if (amount == 0 || amount > position.collateralAmount) {
                amount = position.collateralAmount;
            }
        } else {
            // Partial withdrawal allowed if maintains collateral ratio
            uint256 collateralValue = _getCollateralValue(position.collateralAmount);
            uint256 afterWithdrawalValue = _getCollateralValue(position.collateralAmount - amount);
            uint256 requiredCollateral = (totalDebt * 10000) / COLLATERAL_RATIO;
            
            require(afterWithdrawalValue >= requiredCollateral, "Would under-collateralize");
        }
        
        position.collateralAmount -= amount;
        totalCollateralDeposited -= amount;
        
        if (position.collateralAmount == 0 && totalDebt == 0) {
            position.isActive = false;
        }
        
        require(
            collateralToken.transfer(msg.sender, amount),
            "Collateral transfer failed"
        );
        
        emit CollateralWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Liquidate an under-collateralized position
     * @param borrower Address of the borrower to liquidate
     * @param repayAmount Amount of debt to repay
     */
    function liquidate(address borrower, uint256 repayAmount) external nonReentrant {
        require(liquidators[msg.sender] || msg.sender == owner(), "Not authorized liquidator");
        
        LoanPosition storage position = loanPositions[borrower];
        require(position.isActive, "No active position");
        
        // Update interest
        _updateInterest(borrower);
        
        uint256 totalDebt = position.borrowedAmount + position.accruedInterest;
        uint256 collateralValue = _getCollateralValue(position.collateralAmount);
        
        // Check if position is liquidatable
        require(
            (totalDebt * 10000) / collateralValue >= LIQUIDATION_THRESHOLD,
            "Position not liquidatable"
        );
        
        require(repayAmount <= totalDebt, "Repay amount exceeds debt");
        require(balanceOf(msg.sender) >= repayAmount, "Insufficient balance");
        
        // Calculate collateral to seize
        uint256 collateralToSeize = (repayAmount * 10000) / _getCollateralPrice();
        uint256 penalty = (collateralToSeize * LIQUIDATION_PENALTY) / 10000;
        uint256 liquidatorRewardAmount = (collateralToSeize * liquidatorReward) / 10000;
        
        // Update position
        if (repayAmount >= position.accruedInterest) {
            uint256 principalRepaid = repayAmount - position.accruedInterest;
            position.borrowedAmount -= principalRepaid;
            position.accruedInterest = 0;
        } else {
            position.accruedInterest -= repayAmount;
        }
        
        position.collateralAmount -= collateralToSeize;
        totalCollateralDeposited -= collateralToSeize;
        
        // Burn repaid stablecoin
        _burn(msg.sender, repayAmount);
        
        // Transfer collateral to liquidator
        uint256 liquidatorCollateral = collateralToSeize - penalty;
        require(
            collateralToken.transfer(msg.sender, liquidatorCollateral),
            "Liquidator transfer failed"
        );
        
        // Transfer penalty to protocol treasury
        require(
            collateralToken.transfer(owner(), penalty),
            "Penalty transfer failed"
        );
        
        emit PositionLiquidated(borrower, msg.sender, collateralToSeize, repayAmount);
    }
    
    /**
     * @dev Update accrued interest for a position
     * @param user User address
     */
    function _updateInterest(address user) internal {
        LoanPosition storage position = loanPositions[user];
        if (!position.isActive || position.borrowedAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
        uint256 annualInterest = (position.borrowedAmount * INTEREST_RATE) / 10000;
        uint256 newInterest = (annualInterest * timeElapsed) / 365 days;
        
        position.accruedInterest += newInterest;
        position.lastInterestUpdate = block.timestamp;
        
        emit InterestUpdated(user, position.accruedInterest);
    }
    
    /**
     * @dev Get collateral value in USD
     * @param amount Amount of collateral tokens
     */
    function _getCollateralValue(uint256 amount) internal view returns (uint256) {
        return (amount * _getCollateralPrice()) / 10**18;
    }
    
    /**
     * @dev Get collateral token price from oracle
     */
    function _getCollateralPrice() internal view returns (uint256) {
        return priceOracle.getPrice();
    }
    
    /**
     * @dev Get loan position details
     * @param user User address
     */
    function getLoanPosition(address user) external view returns (
        uint256 collateralAmount,
        uint256 borrowedAmount,
        uint256 accruedInterest,
        uint256 collateralValue,
        uint256 borrowingCapacity,
        uint256 healthFactor
    ) {
        LoanPosition memory position = loanPositions[user];
        
        // Calculate current interest
        if (position.isActive && position.borrowedAmount > 0) {
            uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
            uint256 annualInterest = (position.borrowedAmount * INTEREST_RATE) / 10000;
            uint256 currentInterest = position.accruedInterest + 
                (annualInterest * timeElapsed) / 365 days;
            accruedInterest = currentInterest;
        } else {
            accruedInterest = position.accruedInterest;
        }
        
        collateralAmount = position.collateralAmount;
        borrowedAmount = position.borrowedAmount;
        collateralValue = _getCollateralValue(collateralAmount);
        borrowingCapacity = (collateralValue * COLLATERAL_RATIO) / 10000;
        
        uint256 totalDebt = borrowedAmount + accruedInterest;
        if (totalDebt == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor = (collateralValue * LIQUIDATION_THRESHOLD) / (totalDebt * 100);
        }
    }
    
    /**
     * @dev Check if position is liquidatable
     * @param user User address
     */
    function isLiquidatable(address user) external view returns (bool) {
        LoanPosition memory position = loanPositions[user];
        if (!position.isActive) return false;
        
        // Calculate current debt with interest
        uint256 timeElapsed = block.timestamp - position.lastInterestUpdate;
        uint256 annualInterest = (position.borrowedAmount * INTEREST_RATE) / 10000;
        uint256 currentInterest = position.accruedInterest + 
            (annualInterest * timeElapsed) / 365 days;
        uint256 totalDebt = position.borrowedAmount + currentInterest;
        
        if (totalDebt == 0) return false;
        
        uint256 collateralValue = _getCollateralValue(position.collateralAmount);
        return (totalDebt * 10000) / collateralValue >= LIQUIDATION_THRESHOLD;
    }
    
    // Admin functions
    function setPriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        priceOracle = IPriceOracle(newOracle);
        emit PriceOracleUpdated(newOracle);
    }
    
    function addLiquidator(address liquidator) external onlyOwner {
        liquidators[liquidator] = true;
    }
    
    function removeLiquidator(address liquidator) external onlyOwner {
        liquidators[liquidator] = false;
    }
    
    function setLiquidatorReward(uint256 newReward) external onlyOwner {
        require(newReward <= 1000, "Reward too high"); // Max 10%
        liquidatorReward = newReward;
    }
    
    function emergencyStop() external onlyOwner {
        emergencyShutdown = true;
        _pause();
    }
    
    function emergencyResume() external onlyOwner {
        emergencyShutdown = false;
        _unpause();
    }
    
    function withdrawProtocolFees() external onlyOwner {
        uint256 fees = totalInterestAccrued;
        totalInterestAccrued = 0;
        _mint(owner(), fees);
    }
}