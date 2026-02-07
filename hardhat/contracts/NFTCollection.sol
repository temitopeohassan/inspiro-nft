// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NFTCollection
 * @notice Inspiro NFT collection with paid mint, revenue splits, and ERC2981 royalties
 */
contract NFTCollection is ERC721, ERC721Royalty, Ownable, Pausable, ReentrancyGuard {
    uint256 public maxSupply;
    uint256 public mintPrice;
    uint256 private _nextTokenId;

    address public agentTreasury;
    address public creatorTreasury;
    address public platformTreasury;
    uint256 public agentBps;
    uint256 public creatorBps;
    uint256 public platformBps;

    error ExceedsMaxSupply();
    error InsufficientPayment();
    error InvalidRevenueSplit();
    error ZeroAddress();
    error TransferFailed();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address agentTreasury_,
        address creatorTreasury_,
        address platformTreasury_,
        uint256 agentBps_,
        uint256 creatorBps_,
        uint256 platformBps_,
        uint96 royaltyBps_,
        address royaltyReceiver_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        if (agentTreasury_ == address(0) || creatorTreasury_ == address(0) || platformTreasury_ == address(0)) {
            revert ZeroAddress();
        }
        if (agentBps_ + creatorBps_ + platformBps_ != 10000) {
            revert InvalidRevenueSplit();
        }

        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        agentTreasury = agentTreasury_;
        creatorTreasury = creatorTreasury_;
        platformTreasury = platformTreasury_;
        agentBps = agentBps_;
        creatorBps = creatorBps_;
        platformBps = platformBps_;

        _baseTokenURI = baseURI_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBps_);
    }

    string private _baseTokenURI;

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /**
     * @notice Mint an NFT (paid)
     * @return tokenId The minted token ID
     */
    function mint(address to) external payable whenNotPaused nonReentrant returns (uint256) {
        if (_nextTokenId >= maxSupply) revert ExceedsMaxSupply();
        if (msg.value < mintPrice) revert InsufficientPayment();

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _splitRevenue(msg.value);
        return tokenId;
    }

    /**
     * @notice Owner can mint (e.g. token 1 for creator)
     */
    function ownerMint(address to) external onlyOwner {
        if (_nextTokenId >= maxSupply) revert ExceedsMaxSupply();
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function _splitRevenue(uint256 amount) internal {
        uint256 agentAmount = (amount * agentBps) / 10000;
        uint256 creatorAmount = (amount * creatorBps) / 10000;
        uint256 platformAmount = amount - agentAmount - creatorAmount;

        _sendEth(agentTreasury, agentAmount);
        _sendEth(creatorTreasury, creatorAmount);
        _sendEth(platformTreasury, platformAmount);
    }

    function _sendEth(address to, uint256 amount) internal {
        if (amount > 0) {
            (bool ok,) = to.call{value: amount}("");
            if (!ok) revert TransferFailed();
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Alias for frontend compatibility
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Whether minting is paused (frontend compatibility)
    function mintPaused() external view returns (bool) {
        return paused();
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Royalty) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
