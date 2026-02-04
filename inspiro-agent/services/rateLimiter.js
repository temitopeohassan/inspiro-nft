import { config } from '../config.js';

export class RateLimiter {
  constructor() {
    // Store: { userId: [timestamps] }
    this.userDeployments = new Map();
    
    // Store: [timestamps]
    this.globalDeployments = [];
    
    // Clean up old entries every hour
    setInterval(() => this.cleanup(), 3600000);
  }

  /**
   * Check if user can deploy (per-user rate limit)
   */
  canUserDeploy(userId) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    if (!this.userDeployments.has(userId)) {
      return true;
    }
    
    const userTimestamps = this.userDeployments.get(userId);
    const recentDeployments = userTimestamps.filter(ts => ts > oneDayAgo);
    
    this.userDeployments.set(userId, recentDeployments);
    
    return recentDeployments.length < config.maxDeploysPerUserPerDay;
  }

  /**
   * Check global rate limit (deployments per hour)
   */
  canDeployGlobally() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    this.globalDeployments = this.globalDeployments.filter(ts => ts > oneHourAgo);
    
    return this.globalDeployments.length < config.maxDeploysPerHour;
  }

  /**
   * Record a deployment
   */
  recordDeployment(userId) {
    const now = Date.now();
    
    // Record user deployment
    if (!this.userDeployments.has(userId)) {
      this.userDeployments.set(userId, []);
    }
    this.userDeployments.get(userId).push(now);
    
    // Record global deployment
    this.globalDeployments.push(now);
  }

  /**
   * Get user's remaining deployments for today
   */
  getUserRemainingDeployments(userId) {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    if (!this.userDeployments.has(userId)) {
      return config.maxDeploysPerUserPerDay;
    }
    
    const userTimestamps = this.userDeployments.get(userId);
    const recentDeployments = userTimestamps.filter(ts => ts > oneDayAgo);
    
    return Math.max(0, config.maxDeploysPerUserPerDay - recentDeployments.length);
  }

  /**
   * Get time until user can deploy again
   */
  getTimeUntilUserCanDeploy(userId) {
    if (this.canUserDeploy(userId)) {
      return 0;
    }
    
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const userTimestamps = this.userDeployments.get(userId);
    const recentDeployments = userTimestamps.filter(ts => ts > oneDayAgo);
    
    // Find oldest deployment in the window
    const oldestDeployment = Math.min(...recentDeployments);
    const timeUntilExpiry = (oldestDeployment + 24 * 60 * 60 * 1000) - now;
    
    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // Clean user deployments
    for (const [userId, timestamps] of this.userDeployments.entries()) {
      const recentTimestamps = timestamps.filter(ts => ts > oneDayAgo);
      if (recentTimestamps.length === 0) {
        this.userDeployments.delete(userId);
      } else {
        this.userDeployments.set(userId, recentTimestamps);
      }
    }
    
    // Clean global deployments
    const oneHourAgo = now - 60 * 60 * 1000;
    this.globalDeployments = this.globalDeployments.filter(ts => ts > oneHourAgo);
    
    console.log('Rate limiter cleanup completed');
  }

  /**
   * Get current state (for monitoring)
   */
  getState() {
    return {
      totalUsers: this.userDeployments.size,
      globalDeploymentsLastHour: this.globalDeployments.length,
      canDeployGlobally: this.canDeployGlobally()
    };
  }
}