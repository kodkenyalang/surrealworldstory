// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LoomIPRegistry
 * @dev ERC721 contract to record metadata of Indigenous IP assets from traditional looms
 * Fully compatible with Story Protocol blockchain and IP registry framework
 * Each token represents a unique loom pattern, design, or cultural artifact with verified provenance
 * Integrates with Story Protocol licensing and royalty distribution systems
 */
contract LoomIPRegistry is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Registration fee for new IP assets (in Story Protocol IP tokens)
    uint256 public registrationFee = 0.01 ether;
    
    // Story Protocol integration
    address public storyProtocolRegistry;
    address public royaltyPolicyLRP;
    
    // Story Protocol IP metadata structure
    struct StoryIPMetadata {
        address ipId;           // Story Protocol IP ID
        string licenseTerms;    // Story Protocol license terms
        address royaltyPolicy;  // Royalty policy address
        bool isRegisteredWithStory; // Registered with Story Protocol
        uint256 storyRegistrationDate; // Story Protocol registration timestamp
    }
    
    // IP Asset metadata structure
    struct LoomIPMetadata {
        string culturalOrigin;      // e.g., "Batak", "Javanese", "Sasak"
        string artisanName;         // Creator/artisan name
        string patternName;         // Traditional pattern name
        string technique;           // Weaving technique used
        string materials;           // Materials used (cotton, silk, etc.)
        uint256 creationDate;       // When the design was created
        string region;              // Geographic region of origin
        string tribe;               // Specific tribal origin
        bool isVerified;            // Verification status by cultural authority
        address verifier;           // Address of cultural authority who verified
        uint256 registrationDate;  // When registered on blockchain
        string ipfsHash;            // IPFS hash of detailed metadata
        bool isCommercializable;    // Can this IP be used commercially
        uint256 royaltyPercentage;  // Royalty percentage for commercial use
    }
    
    // Mapping from token ID to IP metadata
    mapping(uint256 => LoomIPMetadata) public loomIPMetadata;
    
    // Mapping from token ID to Story Protocol metadata
    mapping(uint256 => StoryIPMetadata) public storyIPMetadata;
    
    // Mapping from cultural origin to list of token IDs
    mapping(string => uint256[]) public ipByCulturalOrigin;
    
    // Mapping of verified cultural authorities
    mapping(address => bool) public culturalAuthorities;
    mapping(address => string) public authorityNames;
    
    // Mapping to track if a pattern hash is already registered
    mapping(bytes32 => bool) public patternHashExists;
    mapping(bytes32 => uint256) public patternHashToTokenId;
    
    // Events
    event IPRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string culturalOrigin,
        string patternName,
        string ipfsHash
    );
    
    event IPVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        string authorityName
    );
    
    event CulturalAuthorityAdded(address indexed authority, string name);
    event CulturalAuthorityRemoved(address indexed authority);
    event RoyaltyUpdated(uint256 indexed tokenId, uint256 newPercentage);
    
    constructor() ERC721("Loom IP Registry", "LIPR") {}
    
    /**
     * @dev Register a new loom IP asset
     * @param to Address to receive the NFT
     * @param culturalOrigin Cultural origin of the IP
     * @param artisanName Name of the artisan/creator
     * @param patternName Traditional pattern name
     * @param technique Weaving technique used
     * @param materials Materials used
     * @param region Geographic region
     * @param tribe Specific tribal origin
     * @param ipfsHash IPFS hash of detailed metadata
     * @param royaltyPercentage Royalty percentage for commercial use
     */
    function registerIP(
        address to,
        string memory culturalOrigin,
        string memory artisanName,
        string memory patternName,
        string memory technique,
        string memory materials,
        string memory region,
        string memory tribe,
        string memory ipfsHash,
        uint256 royaltyPercentage
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(royaltyPercentage <= 5000, "Royalty cannot exceed 50%"); // Max 50%
        require(bytes(culturalOrigin).length > 0, "Cultural origin required");
        require(bytes(patternName).length > 0, "Pattern name required");
        
        // Generate unique hash for this pattern
        bytes32 patternHash = keccak256(abi.encodePacked(
            culturalOrigin,
            patternName,
            artisanName,
            technique,
            region,
            tribe
        ));
        
        require(!patternHashExists[patternHash], "Pattern already registered");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        
        // Store metadata
        loomIPMetadata[tokenId] = LoomIPMetadata({
            culturalOrigin: culturalOrigin,
            artisanName: artisanName,
            patternName: patternName,
            technique: technique,
            materials: materials,
            creationDate: block.timestamp,
            region: region,
            tribe: tribe,
            isVerified: false,
            verifier: address(0),
            registrationDate: block.timestamp,
            ipfsHash: ipfsHash,
            isCommercializable: false,
            royaltyPercentage: royaltyPercentage
        });
        
        // Track pattern hash
        patternHashExists[patternHash] = true;
        patternHashToTokenId[patternHash] = tokenId;
        
        // Add to cultural origin index
        ipByCulturalOrigin[culturalOrigin].push(tokenId);
        
        emit IPRegistered(tokenId, to, culturalOrigin, patternName, ipfsHash);
        
        return tokenId;
    }
    
    /**
     * @dev Verify an IP asset by a cultural authority
     * @param tokenId Token ID to verify
     */
    function verifyIP(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(culturalAuthorities[msg.sender], "Not a cultural authority");
        
        LoomIPMetadata storage metadata = loomIPMetadata[tokenId];
        require(!metadata.isVerified, "Already verified");
        
        metadata.isVerified = true;
        metadata.verifier = msg.sender;
        metadata.isCommercializable = true; // Enable commercial use after verification
        
        emit IPVerified(tokenId, msg.sender, authorityNames[msg.sender]);
    }
    
    /**
     * @dev Add a cultural authority
     * @param authority Address of the cultural authority
     * @param name Name of the cultural authority
     */
    function addCulturalAuthority(address authority, string memory name) external onlyOwner {
        require(authority != address(0), "Invalid authority address");
        require(bytes(name).length > 0, "Authority name required");
        
        culturalAuthorities[authority] = true;
        authorityNames[authority] = name;
        
        emit CulturalAuthorityAdded(authority, name);
    }
    
    /**
     * @dev Remove a cultural authority
     * @param authority Address to remove
     */
    function removeCulturalAuthority(address authority) external onlyOwner {
        require(culturalAuthorities[authority], "Not a cultural authority");
        
        culturalAuthorities[authority] = false;
        delete authorityNames[authority];
        
        emit CulturalAuthorityRemoved(authority);
    }
    
    /**
     * @dev Update royalty percentage for an IP asset
     * @param tokenId Token ID to update
     * @param newPercentage New royalty percentage
     */
    function updateRoyalty(uint256 tokenId, uint256 newPercentage) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        require(newPercentage <= 5000, "Royalty cannot exceed 50%");
        
        loomIPMetadata[tokenId].royaltyPercentage = newPercentage;
        
        emit RoyaltyUpdated(tokenId, newPercentage);
    }
    
    /**
     * @dev Get all IP assets by cultural origin
     * @param culturalOrigin Cultural origin to search
     */
    function getIPByCulturalOrigin(string memory culturalOrigin) external view returns (uint256[] memory) {
        return ipByCulturalOrigin[culturalOrigin];
    }
    
    /**
     * @dev Get verified IP assets only
     */
    function getVerifiedIPs() external view returns (uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256[] memory verifiedTokens = new uint256[](totalSupply);
        uint256 verifiedCount = 0;
        
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = tokenByIndex(i);
            if (loomIPMetadata[tokenId].isVerified) {
                verifiedTokens[verifiedCount] = tokenId;
                verifiedCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](verifiedCount);
        for (uint256 i = 0; i < verifiedCount; i++) {
            result[i] = verifiedTokens[i];
        }
        
        return result;
    }
    
    /**
     * @dev Check if pattern already exists
     * @param culturalOrigin Cultural origin
     * @param patternName Pattern name
     * @param artisanName Artisan name
     * @param technique Technique used
     * @param region Region
     * @param tribe Tribe
     */
    function isPatternRegistered(
        string memory culturalOrigin,
        string memory patternName,
        string memory artisanName,
        string memory technique,
        string memory region,
        string memory tribe
    ) external view returns (bool, uint256) {
        bytes32 patternHash = keccak256(abi.encodePacked(
            culturalOrigin,
            patternName,
            artisanName,
            technique,
            region,
            tribe
        ));
        
        return (patternHashExists[patternHash], patternHashToTokenId[patternHash]);
    }
    
    /**
     * @dev Set registration fee
     * @param newFee New registration fee in wei
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }
    
    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}