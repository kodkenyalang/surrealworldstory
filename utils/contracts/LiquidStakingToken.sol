// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title LiquidStakingToken (LST)
 * @dev ERC20 token representing liquid staking positions for Story Protocol IP tokens
 * Compatible with Story Protocol blockchain and IP ecosystem
 * Users can stake their Story Protocol IP tokens and receive LST tokens that maintain liquidity
 */
contract LiquidStakingToken is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // Staking configuration
    uint256 public constant STAKING_REWARD_RATE = 500; // 5% APY (500 basis points)
    uint256 public constant UNSTAKING_DELAY = 7 days;
    uint256 public constant MIN_STAKE_AMOUNT = 1 * 10**18; // 1 token minimum
    
    // Exchange rate: 1 staked token = exchange rate * LST tokens
    uint256 public exchangeRate = 1 * 10**18; // Initially 1:1
    uint256 public totalStaked;
    uint256 public totalRewards;
    
    // Underlying IP token being staked
    IERC20 public immutable stakingToken;
    
    // Staking positions
    struct StakePosition {
        uint256 amount;
        uint256 lstAmount;
        uint256 timestamp;
        uint256 rewards;
        bool isActive;
    }
    
    mapping(address => StakePosition) public stakePositions;
    mapping(address => uint256) public unstakeRequests;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lstMinted);
    event Unstaked(address indexed user, uint256 amount, uint256 lstBurned);
    event UnstakeRequested(address indexed user, uint256 amount, uint256 unlockTime);
    event RewardsDistributed(uint256 totalRewards, uint256 newExchangeRate);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(
        address _stakingToken,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        stakingToken = IERC20(_stakingToken);
    }
    
    /**
     * @dev Stake IP tokens and receive LST tokens
     * @param amount Amount of IP tokens to stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Calculate LST tokens to mint based on current exchange rate
        uint256 lstAmount = (amount * 10**18) / exchangeRate;
        
        // Update staking position
        StakePosition storage position = stakePositions[msg.sender];
        if (position.isActive) {
            // Update existing position
            position.amount += amount;
            position.lstAmount += lstAmount;
        } else {
            // Create new position
            position.amount = amount;
            position.lstAmount = lstAmount;
            position.timestamp = block.timestamp;
            position.isActive = true;
        }
        
        totalStaked += amount;
        _mint(msg.sender, lstAmount);
        
        emit Staked(msg.sender, amount, lstAmount);
    }
    
    /**
     * @dev Request unstaking of IP tokens (starts unstaking delay)
     * @param lstAmount Amount of LST tokens to unstake
     */
    function requestUnstake(uint256 lstAmount) external nonReentrant {
        require(balanceOf(msg.sender) >= lstAmount, "Insufficient LST balance");
        require(unstakeRequests[msg.sender] == 0, "Pending unstake request");
        
        unstakeRequests[msg.sender] = block.timestamp + UNSTAKING_DELAY;
        
        // Burn LST tokens immediately
        _burn(msg.sender, lstAmount);
        
        emit UnstakeRequested(msg.sender, lstAmount, unstakeRequests[msg.sender]);
    }
    
    /**
     * @dev Complete unstaking after delay period
     */
    function unstake() external nonReentrant {
        uint256 unlockTime = unstakeRequests[msg.sender];
        require(unlockTime > 0, "No unstake request");
        require(block.timestamp >= unlockTime, "Unstaking delay not met");
        
        StakePosition storage position = stakePositions[msg.sender];
        require(position.isActive, "No active stake position");
        
        // Calculate underlying tokens to return based on exchange rate
        uint256 tokensToReturn = (position.lstAmount * exchangeRate) / 10**18;
        
        // Update state
        totalStaked -= position.amount;
        position.isActive = false;
        unstakeRequests[msg.sender] = 0;
        
        // Transfer underlying tokens back
        require(stakingToken.transfer(msg.sender, tokensToReturn), "Transfer failed");
        
        emit Unstaked(msg.sender, tokensToReturn, position.lstAmount);
    }
    
    /**
     * @dev Distribute staking rewards and update exchange rate
     * @param rewardAmount Amount of rewards to distribute
     */
    function distributeRewards(uint256 rewardAmount) external onlyOwner {
        require(rewardAmount > 0, "No rewards to distribute");
        require(totalSupply() > 0, "No tokens staked");
        
        totalRewards += rewardAmount;
        
        // Update exchange rate: more underlying tokens per LST token
        exchangeRate = ((totalStaked + totalRewards) * 10**18) / totalSupply();
        
        emit RewardsDistributed(rewardAmount, exchangeRate);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user Address to check rewards for
     */
    function pendingRewards(address user) external view returns (uint256) {
        StakePosition memory position = stakePositions[user];
        if (!position.isActive) return 0;
        
        uint256 stakingDuration = block.timestamp - position.timestamp;
        uint256 annualReward = (position.amount * STAKING_REWARD_RATE) / 10000;
        
        return (annualReward * stakingDuration) / 365 days;
    }
    
    /**
     * @dev Get current exchange rate (underlying tokens per LST token)
     */
    function getCurrentExchangeRate() external view returns (uint256) {
        return exchangeRate;
    }
    
    /**
     * @dev Get total value locked in the contract
     */
    function getTotalValueLocked() external view returns (uint256) {
        return totalStaked + totalRewards;
    }
    
    /**
     * @dev Get user's staking position details
     */
    function getStakePosition(address user) external view returns (
        uint256 amount,
        uint256 lstAmount,
        uint256 timestamp,
        bool isActive,
        uint256 currentValue
    ) {
        StakePosition memory position = stakePositions[user];
        currentValue = (position.lstAmount * exchangeRate) / 10**18;
        
        return (
            position.amount,
            position.lstAmount,
            position.timestamp,
            position.isActive,
            currentValue
        );
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = stakingToken.balanceOf(address(this));
        stakingToken.transfer(owner(), balance);
    }
}