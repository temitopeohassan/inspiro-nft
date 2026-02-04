import { ethers } from 'ethers';
import { config } from '../config.js';
import { NFTFactoryABI } from '../contracts/NFTFactoryABI.js';

export class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.baseRpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.factory = new ethers.Contract(
      config.factoryContractAddress,
      NFTFactoryABI,
      this.wallet
    );
  }

  /**
   * Deploy a new NFT collection
   */
  async deployCollection(params) {
    const {
      name,
      symbol,
      baseURI,
      maxSupply,
      mintPrice,
      creatorAddress,
      royaltyBps
    } = params;

    try {
      console.log('Deploying collection:', name);
      console.log('Parameters:', params);

      // Convert mint price to Wei
      const mintPriceWei = ethers.parseEther(mintPrice.toString());

      // Prepare treasury addresses
      const agentTreasury = config.agentTreasury || this.wallet.address;
      const creatorTreasury = creatorAddress || this.wallet.address;
      const platformTreasury = config.platformTreasury || this.wallet.address;

      // Revenue split basis points
      const agentBps = config.revenueSplit.agent;
      const creatorBps = config.revenueSplit.creator;
      const platformBps = config.revenueSplit.platform;

      // Royalty settings
      const finalRoyaltyBps = royaltyBps || config.defaultRoyaltyBps;
      const royaltyReceiver = platformTreasury;

      // Estimate gas
      const gasEstimate = await this.factory.createPaidCollection.estimateGas(
        name,
        symbol,
        baseURI,
        maxSupply,
        mintPriceWei,
        agentTreasury,
        creatorTreasury,
        platformTreasury,
        agentBps,
        creatorBps,
        platformBps,
        finalRoyaltyBps,
        royaltyReceiver
      );

      console.log('Estimated gas:', gasEstimate.toString());

      // Deploy with extra gas buffer
      const tx = await this.factory.createPaidCollection(
        name,
        symbol,
        baseURI,
        maxSupply,
        mintPriceWei,
        agentTreasury,
        creatorTreasury,
        platformTreasury,
        agentBps,
        creatorBps,
        platformBps,
        finalRoyaltyBps,
        royaltyReceiver,
        {
          gasLimit: gasEstimate * 120n / 100n // 20% buffer
        }
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // Parse the CollectionCreated event to get the new collection address
      const collectionAddress = await this.parseCollectionAddress(receipt);

      return {
        success: true,
        collectionAddress,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error deploying collection:', error.message);
      
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Parse collection address from transaction receipt
   */
  async parseCollectionAddress(receipt) {
    try {
      // Find CollectionCreated event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.factory.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsed && parsed.name === 'CollectionCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.factory.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        return parsed.args.collection;
      }

      // Fallback: try to get from logs
      if (receipt.logs.length > 0) {
        // The first log is typically the collection creation
        return receipt.logs[0].address;
      }

      return null;
    } catch (error) {
      console.error('Error parsing collection address:', error.message);
      return null;
    }
  }

  /**
   * Get block explorer URL for contract
   */
  getExplorerUrl(address) {
    return `https://basescan.org/address/${address}`;
  }

  /**
   * Get mint URL (placeholder - replace with actual minting platform)
   */
  getMintUrl(address) {
    // This could be your own minting frontend or a platform like Zora
    return `https://mint.fun/base/${address}`;
  }

  /**
   * Verify contract on Basescan (optional)
   */
  async verifyContract(address, constructorArgs) {
    // This would typically use the Basescan API
    // Placeholder for now
    console.log('Contract verification would happen here for:', address);
    return true;
  }

  /**
   * Check wallet balance
   */
  async getBalance() {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    };
  }
}