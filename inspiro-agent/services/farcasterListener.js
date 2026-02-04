import axios from 'axios';
import { config } from '../config.js';

export class FarcasterListener {
  constructor() {
    this.lastCheckedTimestamp = Date.now();
    this.neynarBaseUrl = 'https://api.neynar.com/v2';
  }

  /**
   * Poll for new casts mentioning the bot
   */
  async pollForMentions() {
    try {
      const response = await axios.get(
        `${this.neynarBaseUrl}/farcaster/cast/search`,
        {
          params: {
            q: '@Inspiro',
            limit: 25,
            // You can add more filters here
          },
          headers: {
            'api_key': config.neynarApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.result && response.data.result.casts) {
        const newCasts = response.data.result.casts.filter(cast => {
          const castTime = new Date(cast.timestamp).getTime();
          return castTime > this.lastCheckedTimestamp;
        });

        if (newCasts.length > 0) {
          this.lastCheckedTimestamp = Date.now();
        }

        return newCasts.map(cast => this.normalizeCast(cast));
      }

      return [];
    } catch (error) {
      console.error('Error polling Farcaster:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Normalize cast data to consistent format
   */
  normalizeCast(cast) {
    return {
      castId: cast.hash,
      castText: cast.text,
      authorFid: cast.author.fid,
      authorUsername: cast.author.username,
      authorAddress: cast.author.verified_addresses?.eth_addresses?.[0] || null,
      timestamp: cast.timestamp,
      parentHash: cast.parent_hash,
      embedUrls: cast.embeds?.map(e => e.url).filter(Boolean) || []
    };
  }

  /**
   * Reply to a cast
   */
  async replyCast(parentCastHash, replyText) {
    try {
      const response = await axios.post(
        `${this.neynarBaseUrl}/farcaster/cast`,
        {
          signer_uuid: config.signerUuid,
          text: replyText,
          parent: parentCastHash
        },
        {
          headers: {
            'api_key': config.neynarApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Reply posted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error replying to cast:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Check if cast contains deployment triggers
   */
  containsTriggers(text) {
    const lowerText = text.toLowerCase();
    return config.triggers.some(trigger => 
      lowerText.includes(trigger.toLowerCase())
    );
  }
}