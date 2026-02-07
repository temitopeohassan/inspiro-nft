// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NFTCollection.sol";

/**
 * @title NFTFactory
 * @notice Deploys Inspiro NFT collections with paid mint and revenue splits
 */
contract NFTFactory {
    address[] private _allCollections;
    mapping(address => address[]) private _collectionsByCreator;

    event CollectionDeployed(
        address indexed collection,
        string name,
        string symbol,
        address creatorTreasury,
        uint256 maxSupply,
        uint256 mintPrice
    );

    /**
     * @notice Deploy a new paid-mint NFT collection
     * @param name Collection name
     * @param symbol Collection symbol
     * @param baseURI Base URI for token metadata (e.g. ipfs://Qm.../)
     * @param maxSupply Maximum supply (1-1000 per protocol)
     * @param mintPrice Price per mint in wei (0-0.05 ETH per protocol)
     * @param agentTreasury Address to receive agent share (40% default)
     * @param creatorTreasury Address to receive creator share (40% default)
     * @param platformTreasury Address to receive platform share (20% default)
     * @param agentBps Agent share in basis points (4000 = 40%)
     * @param creatorBps Creator share in basis points (4000 = 40%)
     * @param platformBps Platform share in basis points (2000 = 20%)
     * @param royaltyBps ERC2981 royalty in basis points (max 1000 = 10% per protocol)
     * @param royaltyReceiver Address to receive secondary royalties
     */
    function createPaidCollection(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 maxSupply,
        uint256 mintPrice,
        address agentTreasury,
        address creatorTreasury,
        address platformTreasury,
    uint256 agentBps,
    uint256 creatorBps,
    uint256 platformBps,
        uint96 royaltyBps,
        address royaltyReceiver
    ) external returns (address) {
        NFTCollection collection = new NFTCollection(
            name,
            symbol,
            baseURI,
            maxSupply,
            mintPrice,
            agentTreasury,
            creatorTreasury,
            platformTreasury,
            agentBps,
            creatorBps,
            platformBps,
            royaltyBps,
            royaltyReceiver
        );

        collection.transferOwnership(msg.sender);

        _allCollections.push(address(collection));
        _collectionsByCreator[msg.sender].push(address(collection));

        emit CollectionDeployed(
            address(collection),
            name,
            symbol,
            creatorTreasury,
            maxSupply,
            mintPrice
        );

        return address(collection);
    }

    function getAllCollections() external view returns (address[] memory) {
        return _allCollections;
    }

    function getCollectionsByCreator(address creator) external view returns (address[] memory) {
        return _collectionsByCreator[creator];
    }
}
