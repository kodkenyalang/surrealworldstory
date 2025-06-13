// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StoryProtocolConfig
 * @dev Configuration contract for Story Protocol blockchain integration
 * Contains addresses and constants for Story Protocol ecosystem
 */
contract StoryProtocolConfig {
    
    // Story Protocol Chain Information
    uint256 public constant STORY_CHAIN_ID = 1513; // Story Protocol Testnet
    
    // Story Protocol Core Addresses (Testnet)
    address public constant IP_ASSET_REGISTRY = 0x28E59E91C0467e89fd0f0438D47Ca839cDfEc095;
    address public constant LICENSING_MODULE = 0x5a7612fA7233476f88AE83f3b921cC94c90a157b;
    address public constant ROYALTY_MODULE = 0xEa6eD700b11DfF703665CCAF55887ca56134Ae3B;
    address public constant MODULE_REGISTRY = 0x9F18c8A3fE2b69e6237e8f22D75bb6BBE5508F07;
    
    // Story Protocol Token Addresses
    address public constant WIP_TOKEN = 0xB132A6B7AE652c974EE1557A3521D53d18F6739f; // Wrapped IP Token
    address public constant STORY_POINTS = 0x5B7AB29f60A168C61B2E39beb0Df7D0F47eDC488; // Story Points
    
    // Royalty Policy Addresses
    address public constant ROYALTY_POLICY_LRP = 0x93c22fbeff4448f2fb6e432579b0638838ff9581;
    address public constant ROYALTY_POLICY_LAP = 0x28b4F70ffE5ba7A26aEF979226f77Eb57fb9Fdb6;
    
    // License Template Addresses
    address public constant PIL_TEMPLATE = 0x58E2c909D557Cd23EF90D14f8fd21667A5Ae7a93;
    address public constant NON_COMMERCIAL_SOCIAL_REMIXING = 0x16eF7f7fA633195D57d9aFDe7f78Fbe9c597Bd8d;
    address public constant COMMERCIAL_USE = 0xa51c1fc2f0d1a1b8494Ed1FE312d7C3a78Ed91C0;
    address public constant COMMERCIAL_REMIX = 0x34056C43c18355ad9b0C8B63b5b5F5D0b8b68a67;
    
    // Oracle and Price Feed Addresses
    address public constant STORY_PRICE_ORACLE = 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318;
    address public constant CHAINLINK_AGGREGATOR = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    
    // Events for configuration updates
    event ConfigurationUpdated(string indexed parameter, address indexed newAddress);
    event ChainCompatibilityVerified(uint256 chainId, bool isCompatible);
    
    /**
     * @dev Verify Story Protocol blockchain compatibility
     */
    function verifyChainCompatibility() external view returns (bool) {
        return block.chainid == STORY_CHAIN_ID;
    }
    
    /**
     * @dev Get Story Protocol core contract addresses
     */
    function getCoreAddresses() external pure returns (
        address ipAssetRegistry,
        address licensingModule,
        address royaltyModule,
        address moduleRegistry
    ) {
        return (
            IP_ASSET_REGISTRY,
            LICENSING_MODULE,
            ROYALTY_MODULE,
            MODULE_REGISTRY
        );
    }
    
    /**
     * @dev Get Story Protocol token addresses
     */
    function getTokenAddresses() external pure returns (
        address wipToken,
        address storyPoints
    ) {
        return (
            WIP_TOKEN,
            STORY_POINTS
        );
    }
    
    /**
     * @dev Get royalty policy addresses
     */
    function getRoyaltyPolicies() external pure returns (
        address lrp,
        address lap
    ) {
        return (
            ROYALTY_POLICY_LRP,
            ROYALTY_POLICY_LAP
        );
    }
    
    /**
     * @dev Get license template addresses
     */
    function getLicenseTemplates() external pure returns (
        address pilTemplate,
        address nonCommercialSocialRemixing,
        address commercialUse,
        address commercialRemix
    ) {
        return (
            PIL_TEMPLATE,
            NON_COMMERCIAL_SOCIAL_REMIXING,
            COMMERCIAL_USE,
            COMMERCIAL_REMIX
        );
    }
    
    /**
     * @dev Get oracle and price feed addresses
     */
    function getOracleAddresses() external pure returns (
        address storyPriceOracle,
        address chainlinkAggregator
    ) {
        return (
            STORY_PRICE_ORACLE,
            CHAINLINK_AGGREGATOR
        );
    }
}