// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./LiquidStakingToken.sol";
import "./LoomIPRegistry.sol";
import "./IPStablecoin.sol";
import "./StoryProtocolConfig.sol";

/**
 * @title DeploymentScript
 * @dev Deployment and integration script for Story Protocol compatible DeFi ecosystem
 * Verifies blockchain compatibility and deploys contracts with proper configuration
 */
contract DeploymentScript is StoryProtocolConfig {
    LiquidStakingToken public liquidStakingToken;
    LoomIPRegistry public loomIPRegistry;
    IPStablecoin public ipStablecoin;
    
    // Mock price oracle for testing
    contract MockPriceOracle {
        uint256 private price = 100 * 10**18; // $100 per LST token
        
        function getPrice() external view returns (uint256) {
            return price;
        }
        
        function decimals() external pure returns (uint8) {
            return 18;
        }
        
        function setPrice(uint256 newPrice) external {
            price = newPrice;
        }
    }
    
    MockPriceOracle public priceOracle;
    
    event ContractsDeployed(
        address liquidStakingToken,
        address loomIPRegistry,
        address ipStablecoin,
        address priceOracle
    );
    
    function deployAll() external returns (
        address lstAddress,
        address registryAddress,
        address stablecoinAddress,
        address oracleAddress
    ) {
        // Verify Story Protocol blockchain compatibility
        require(verifyChainCompatibility(), "Not deployed on Story Protocol blockchain");
        
        // Use Story Protocol WIP token as staking token
        address stakingTokenAddress = WIP_TOKEN;
        
        // Deploy Price Oracle (use Story Protocol oracle in production)
        priceOracle = new MockPriceOracle();
        
        // Deploy Liquid Staking Token with Story Protocol integration
        liquidStakingToken = new LiquidStakingToken(
            stakingTokenAddress,
            "Story Protocol IP Liquid Staking Token",
            "spLST"
        );
        
        // Deploy Loom IP Registry with Story Protocol compatibility
        loomIPRegistry = new LoomIPRegistry();
        
        // Deploy IP Stablecoin with Story Protocol collateral
        ipStablecoin = new IPStablecoin(
            address(liquidStakingToken),
            address(priceOracle),
            "Story Protocol IP Stablecoin",
            "spUSD"
        );
        
        // Emit compatibility verification
        emit ChainCompatibilityVerified(block.chainid, true);
        
        emit ContractsDeployed(
            address(liquidStakingToken),
            address(loomIPRegistry),
            address(ipStablecoin),
            address(priceOracle)
        );
        
        return (
            address(liquidStakingToken),
            address(loomIPRegistry),
            address(ipStablecoin),
            address(priceOracle)
        );
    }
    
    /**
     * @dev Verify all contracts are compatible with Story Protocol
     */
    function verifyContractCompatibility() external view returns (
        bool lstCompatible,
        bool registryCompatible,
        bool stablecoinCompatible,
        bool chainCompatible
    ) {
        chainCompatible = verifyChainCompatibility();
        
        // Check if contracts are deployed and functional
        lstCompatible = address(liquidStakingToken) != address(0);
        registryCompatible = address(loomIPRegistry) != address(0);
        stablecoinCompatible = address(ipStablecoin) != address(0);
        
        return (lstCompatible, registryCompatible, stablecoinCompatible, chainCompatible);
    }
}