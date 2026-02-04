import { config } from './config.js';
import { FarcasterListener } from './services/farcasterListener.js';
import { DeploymentOrchestrator } from './services/deploymentOrchestrator.js';

class InspiroAgent {
  constructor() {
    this.farcasterListener = new FarcasterListener();
    this.deploymentOrchestrator = new DeploymentOrchestrator();
    this.isRunning = false;
    this.processedCasts = new Set();
  }

  /**
   * Start the agent
   */
  async start() {
    console.log('🚀 Inspiro NFT Agent Starting...');
    console.log('Environment:', config.environment);
    console.log('Deployments enabled:', config.deploysEnabled);
    console.log('Network:', 'Base');
    console.log('');

    // Validate configuration
    if (!this.validateConfig()) {
      console.error('❌ Configuration validation failed. Please check your .env file.');
      process.exit(1);
    }

    // Check wallet balance
    try {
      const balance = await this.deploymentOrchestrator.blockchainService.getBalance();
      console.log('💰 Wallet balance:', balance, 'ETH');
      
      if (parseFloat(balance) < 0.001) {
        console.warn('⚠️  Warning: Low wallet balance. May not be able to deploy collections.');
      }
    } catch (error) {
      console.error('❌ Error checking wallet balance:', error.message);
    }

    console.log('');
    console.log('👂 Listening for Farcaster mentions...');
    console.log('');

    this.isRunning = true;

    // Start polling loop
    this.pollLoop();

    // Cleanup old deployments periodically
    setInterval(() => {
      this.deploymentOrchestrator.cleanup();
    }, 3600000); // Every hour
  }

  /**
   * Main polling loop
   */
  async pollLoop() {
    while (this.isRunning) {
      try {
        // Fetch new mentions
        const casts = await this.farcasterListener.pollForMentions();

        if (casts.length > 0) {
          console.log(`📬 Found ${casts.length} new cast(s)`);

          for (const cast of casts) {
            // Skip if already processed
            if (this.processedCasts.has(cast.castId)) {
              continue;
            }

            // Mark as processed
            this.processedCasts.add(cast.castId);

            // Limit processed casts cache size
            if (this.processedCasts.size > 1000) {
              const firstItem = this.processedCasts.values().next().value;
              this.processedCasts.delete(firstItem);
            }

            // Check if cast contains triggers
            if (!this.farcasterListener.containsTriggers(cast.castText)) {
              console.log('⏭️  Cast does not contain triggers, skipping');
              continue;
            }

            // Process the cast
            await this.processCast(cast);
          }
        }

        // Wait before next poll
        await this.sleep(config.pollingInterval);

      } catch (error) {
        console.error('❌ Error in poll loop:', error.message);
        await this.sleep(60000); // Wait 1 minute on error
      }
    }
  }

  /**
   * Process a single cast
   */
  async processCast(cast) {
    try {
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('Processing new cast...');
      
      const result = await this.deploymentOrchestrator.processCast(cast);

      if (result.shouldReply) {
        console.log('');
        console.log('💬 Replying to cast...');
        console.log('Reply:', result.replyText.substring(0, 100) + '...');

        try {
          await this.farcasterListener.replyCast(cast.castId, result.replyText);
          console.log('✅ Reply sent successfully');
        } catch (error) {
          console.error('❌ Failed to send reply:', error.message);
        }
      }

      if (result.success) {
        console.log('');
        console.log('🎉 Deployment completed successfully!');
        if (result.deploymentData) {
          console.log('Contract:', result.deploymentData.collectionAddress);
          console.log('Transaction:', result.deploymentData.txHash);
        }
      } else {
        console.log('');
        console.log('⚠️  Deployment not completed:', result.reason);
      }

      console.log('═══════════════════════════════════════');
      console.log('');

    } catch (error) {
      console.error('❌ Error processing cast:', error.message);
      
      // Try to send error reply
      try {
        await this.farcasterListener.replyCast(
          cast.castId,
          'An error occurred while processing your request. Please try again later.'
        );
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError.message);
      }
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const required = [
      'privateKey',
      'neynarApiKey',
      'signerUuid',
      'openaiApiKey',
      'pinataApiKey',
      'pinataSecretKey',
      'factoryContractAddress',
      'agentTreasury'
    ];

    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      console.error('Missing required configuration:', missing.join(', '));
      return false;
    }

    return true;
  }

  /**
   * Stop the agent
   */
  stop() {
    console.log('');
    console.log('🛑 Stopping Inspiro Agent...');
    this.isRunning = false;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('Received SIGINT, shutting down gracefully...');
  if (global.agent) {
    global.agent.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('Received SIGTERM, shutting down gracefully...');
  if (global.agent) {
    global.agent.stop();
  }
  process.exit(0);
});

// Start the agent
const agent = new InspiroAgent();
global.agent = agent;

agent.start().catch(error => {
  console.error('Fatal error starting agent:', error);
  process.exit(1);
});