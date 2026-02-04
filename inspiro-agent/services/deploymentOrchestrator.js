import { config } from '../config.js';
import { IntentClassifier } from './intentClassifier.js';
import { NFTGenerator } from './nftGenerator.js';
import { IPFSService } from './ipfsService.js';
import { BlockchainService } from './blockchainService.js';
import { RateLimiter } from './rateLimiter.js';

export class DeploymentOrchestrator {
  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.nftGenerator = new NFTGenerator();
    this.ipfsService = new IPFSService();
    this.blockchainService = new BlockchainService();
    this.rateLimiter = new RateLimiter();
    
    // State tracking
    this.activeDeployments = new Map();
  }

  /**
   * Main orchestration method
   */
  async processCast(cast) {
    const deploymentId = `${cast.castId}-${Date.now()}`;
    
    try {
      // Update state
      this.updateState(deploymentId, 'INTENT_DETECTED', { cast });
      
      console.log(`\n=== Processing Cast ${cast.castId} ===`);
      console.log('Text:', cast.castText);
      console.log('Author:', cast.authorUsername);
      
      // Step 1: Classify intent
      const intent = await this.intentClassifier.classifyIntent(cast.castText);
      console.log('Intent:', intent.intent, `(${intent.confidence})`);
      
      if (intent.intent === 'IGNORE') {
        console.log('Ignoring cast:', intent.reason);
        return {
          success: false,
          reason: intent.reason,
          shouldReply: false
        };
      }
      
      if (intent.intent === 'STATUS_QUERY') {
        return this.handleStatusQuery(cast);
      }
      
      if (!['DEPLOY_PAID_NFT', 'DEPLOY_FREE_NFT'].includes(intent.intent)) {
        return {
          success: false,
          reason: 'Intent not supported',
          shouldReply: true,
          replyText: "I can help you deploy NFT collections on Base! Tag me with 'deploy nft' and describe what you'd like to create."
        };
      }
      
      // Step 2: Check rate limits
      const userId = cast.authorFid;
      
      if (!this.rateLimiter.canUserDeploy(userId)) {
        const timeUntil = this.rateLimiter.getTimeUntilUserCanDeploy(userId);
        const hoursUntil = Math.ceil(timeUntil / (1000 * 60 * 60));
        
        return {
          success: false,
          reason: 'Rate limit exceeded',
          shouldReply: true,
          replyText: `You've reached your daily deployment limit. You can deploy again in ~${hoursUntil} hours.`
        };
      }
      
      if (!this.rateLimiter.canDeployGlobally()) {
        return {
          success: false,
          reason: 'Global rate limit exceeded',
          shouldReply: true,
          replyText: "We're experiencing high demand right now. Please try again in an hour!"
        };
      }
      
      // Step 3: Check kill switch
      if (!config.deploysEnabled) {
        return {
          success: false,
          reason: 'Deployments disabled',
          shouldReply: true,
          replyText: 'NFT deployments are temporarily paused. Please check back soon!'
        };
      }
      
      // Step 4: Validate and normalize parameters
      const params = this.intentClassifier.validateParams(intent.extracted_params);
      console.log('Validated params:', params);
      
      // Step 5: Generate NFT content
      this.updateState(deploymentId, 'CONTENT_GENERATED', { params });
      console.log('Generating NFT metadata and artwork...');
      
      const metadata = await this.nftGenerator.generateMetadata(params);
      console.log('Metadata generated:', metadata.name);
      
      // Generate artwork (use AI or default SVG)
      let artwork = await this.nftGenerator.generateArtwork(
        metadata.name,
        metadata.description
      );
      
      if (!artwork) {
        artwork = this.nftGenerator.generateDefaultArtwork(
          metadata.name,
          metadata.symbol
        );
      }
      
      // Step 6: Upload to IPFS
      this.updateState(deploymentId, 'IPFS_UPLOADED', { metadata, artwork });
      console.log('Uploading to IPFS...');
      
      const ipfsResult = await this.ipfsService.uploadNFT(
        metadata,
        artwork,
        `${metadata.name}.png`
      );
      
      console.log('IPFS upload complete:', ipfsResult.metadataHash);
      
      // Step 7: Deploy to blockchain
      this.updateState(deploymentId, 'ONCHAIN_DEPLOYMENT', { ipfsResult });
      console.log('Deploying to Base blockchain...');
      
      const mintPrice = intent.intent === 'DEPLOY_FREE_NFT' ? 0 : params.mint_price;
      
      const deploymentParams = {
        name: metadata.name,
        symbol: metadata.symbol,
        baseURI: ipfsResult.metadataUrl,
        maxSupply: params.max_supply,
        mintPrice: mintPrice,
        creatorAddress: cast.authorAddress,
        royaltyBps: config.defaultRoyaltyBps
      };
      
      const deployResult = await this.blockchainService.deployCollection(deploymentParams);
      
      if (!deployResult.success) {
        this.updateState(deploymentId, 'FAILED', { error: deployResult.error });
        
        return {
          success: false,
          reason: deployResult.error,
          shouldReply: true,
          replyText: `Deployment failed: ${deployResult.error}. Please try again or contact support.`
        };
      }
      
      // Step 8: Success!
      this.updateState(deploymentId, 'CONFIRMED', { deployResult });
      
      // Record deployment for rate limiting
      this.rateLimiter.recordDeployment(userId);
      
      console.log('Deployment successful!');
      console.log('Contract:', deployResult.collectionAddress);
      console.log('Tx:', deployResult.txHash);
      
      // Step 9: Prepare response
      const response = this.formatSuccessResponse(
        metadata,
        deploymentParams,
        deployResult,
        ipfsResult
      );
      
      return {
        success: true,
        shouldReply: true,
        replyText: response,
        deploymentData: {
          collectionAddress: deployResult.collectionAddress,
          txHash: deployResult.txHash,
          metadata: metadata,
          ipfs: ipfsResult
        }
      };
      
    } catch (error) {
      console.error('Error in deployment orchestration:', error);
      this.updateState(deploymentId, 'FAILED', { error: error.message });
      
      return {
        success: false,
        reason: error.message,
        shouldReply: true,
        replyText: 'An unexpected error occurred during deployment. Please try again later.'
      };
    }
  }

  /**
   * Handle status query
   */
  handleStatusQuery(cast) {
    const state = this.rateLimiter.getState();
    const remaining = this.rateLimiter.getUserRemainingDeployments(cast.authorFid);
    
    return {
      success: true,
      shouldReply: true,
      replyText: `Inspiro NFT Agent is online! 🚀\n\nYou can deploy ${remaining} more collection(s) today.\n\nTag me with "deploy nft" to get started!`
    };
  }

  /**
   * Format success response
   */
  formatSuccessResponse(metadata, params, deployResult, ipfsResult) {
    const explorerUrl = this.blockchainService.getExplorerUrl(deployResult.collectionAddress);
    const mintUrl = this.blockchainService.getMintUrl(deployResult.collectionAddress);
    
    const priceText = params.mintPrice > 0 
      ? `${params.mintPrice} ETH` 
      : 'FREE';
    
    return `🎉 Collection deployed successfully!

📦 ${metadata.name} (${metadata.symbol})
💰 Mint Price: ${priceText}
🔢 Supply: ${params.maxSupply}

🔗 Contract: ${explorerUrl}
🌐 Mint: ${mintUrl}

Powered by Inspiro on Base ⚡`;
  }

  /**
   * Update deployment state
   */
  updateState(deploymentId, state, data = {}) {
    this.activeDeployments.set(deploymentId, {
      state,
      timestamp: Date.now(),
      ...data
    });
    
    console.log(`State: ${state}`);
  }

  /**
   * Get deployment state
   */
  getState(deploymentId) {
    return this.activeDeployments.get(deploymentId);
  }

  /**
   * Clean up old deployments
   */
  cleanup() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    for (const [id, deployment] of this.activeDeployments.entries()) {
      if (deployment.timestamp < oneHourAgo) {
        this.activeDeployments.delete(id);
      }
    }
  }
}