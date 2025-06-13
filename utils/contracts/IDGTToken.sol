// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract IDGTToken is ERC20, Ownable, ReentrancyGuard {
    // IDGT Token for Indigenous Digital Governance
    
    uint256 public constant REWARD_PER_IP_REGISTRATION = 100 * 10**18; // 100 IDGT
    uint256 public constant ROYALTY_RATE = 10; // 10% royalty rate
    uint256 public constant USAGE_FEE_RATE = 5; // 5% usage fee
    
    mapping(address => uint256) public ipRegistrations;
    mapping(address => uint256) public royaltiesEarned;
    mapping(address => uint256) public usageFeesPaid;
    mapping(string => address) public ipIdToOwner;
    mapping(string => uint256) public ipUsageCount;
    
    event IPRegistered(address indexed owner, string ipId, uint256 reward);
    event RoyaltyPaid(address indexed from, address indexed to, string ipId, uint256 amount);
    event UsageFeePaid(address indexed user, string ipId, uint256 fee);
    event TokensRewarded(address indexed recipient, uint256 amount, string reason);
    
    constructor() ERC20("Indigenous Digital Governance Token", "IDGT") {
        // Mint initial supply to contract deployer
        _mint(msg.sender, 1000000 * 10**18); // 1M IDGT initial supply
    }
    
    function registerIP(address owner, string memory ipId) external onlyOwner {
        require(ipIdToOwner[ipId] == address(0), "IP already registered");
        
        ipIdToOwner[ipId] = owner;
        ipRegistrations[owner]++;
        
        // Reward IP registration
        _mint(owner, REWARD_PER_IP_REGISTRATION);
        
        emit IPRegistered(owner, ipId, REWARD_PER_IP_REGISTRATION);
        emit TokensRewarded(owner, REWARD_PER_IP_REGISTRATION, "IP Registration");
    }
    
    function payRoyalty(string memory ipId, uint256 amount) external nonReentrant {
        address ipOwner = ipIdToOwner[ipId];
        require(ipOwner != address(0), "IP not registered");
        require(balanceOf(msg.sender) >= amount, "Insufficient IDGT balance");
        
        uint256 royaltyAmount = (amount * ROYALTY_RATE) / 100;
        
        // Transfer royalty to IP owner
        _transfer(msg.sender, ipOwner, royaltyAmount);
        royaltiesEarned[ipOwner] += royaltyAmount;
        
        emit RoyaltyPaid(msg.sender, ipOwner, ipId, royaltyAmount);
    }
    
    function payUsageFee(string memory ipId) external payable nonReentrant {
        address ipOwner = ipIdToOwner[ipId];
        require(ipOwner != address(0), "IP not registered");
        
        uint256 feeAmount = msg.value * USAGE_FEE_RATE / 100;
        require(msg.value >= feeAmount, "Insufficient payment");
        
        // Convert ETH to IDGT tokens (simplified conversion)
        uint256 idgtAmount = feeAmount * 1000; // 1 ETH = 1000 IDGT conversion rate
        
        // Charge usage fee from user's IDGT balance
        require(balanceOf(msg.sender) >= idgtAmount, "Insufficient IDGT for usage fee");
        _transfer(msg.sender, ipOwner, idgtAmount);
        
        ipUsageCount[ipId]++;
        usageFeesPaid[msg.sender] += idgtAmount;
        royaltiesEarned[ipOwner] += idgtAmount;
        
        // Return excess ETH
        if (msg.value > feeAmount) {
            payable(msg.sender).transfer(msg.value - feeAmount);
        }
        
        emit UsageFeePaid(msg.sender, ipId, idgtAmount);
        emit RoyaltyPaid(msg.sender, ipOwner, ipId, idgtAmount);
    }
    
    function getIPOwner(string memory ipId) external view returns (address) {
        return ipIdToOwner[ipId];
    }
    
    function getIPUsageCount(string memory ipId) external view returns (uint256) {
        return ipUsageCount[ipId];
    }
    
    function getUserRoyalties(address user) external view returns (uint256) {
        return royaltiesEarned[user];
    }
    
    function getUserUsageFees(address user) external view returns (uint256) {
        return usageFeesPaid[user];
    }
    
    function getUserIPCount(address user) external view returns (uint256) {
        return ipRegistrations[user];
    }
    
    // Emergency functions
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}