import OpenAI from 'openai';
import { config } from '../config.js';

export class NFTGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  /**
   * Generate complete NFT metadata
   */
  async generateMetadata(params) {
    const { collection_name, description, max_supply } = params;

    // Generate enhanced description if needed
    let finalDescription = description;
    if (!description && collection_name) {
      finalDescription = await this.generateDescription(collection_name);
    }

    // Generate symbol from name
    const symbol = this.generateSymbol(collection_name);

    // Generate attributes
    const attributes = await this.generateAttributes(collection_name, finalDescription);

    return {
      name: collection_name || 'Inspiro NFT',
      symbol: symbol,
      description: finalDescription || 'A unique NFT collection deployed on Base',
      attributes: attributes,
      external_url: '',
      image: '' // Will be set after image generation
    };
  }

  /**
   * Generate collection description using AI
   */
  async generateDescription(collectionName) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a creative NFT collection description writer. Write engaging, concise descriptions under 280 characters.'
          },
          {
            role: 'user',
            content: `Write a compelling description for an NFT collection named "${collectionName}". Make it unique and interesting.`
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      return completion.choices[0].message.content.substring(0, 280);
    } catch (error) {
      console.error('Error generating description:', error.message);
      return `${collectionName} - A unique digital collectible on Base`;
    }
  }

  /**
   * Generate symbol from collection name
   */
  generateSymbol(name) {
    if (!name) return 'INSP';
    
    // Take first letters of each word, max 5 characters
    const words = name.split(' ').filter(w => w.length > 0);
    let symbol = words.map(w => w[0].toUpperCase()).join('');
    
    if (symbol.length > 5) {
      symbol = symbol.substring(0, 5);
    }
    
    return symbol || 'INSP';
  }

  /**
   * Generate NFT attributes
   */
  async generateAttributes(name, description) {
    const attributes = [
      {
        trait_type: 'Collection',
        value: name || 'Inspiro'
      },
      {
        trait_type: 'Network',
        value: 'Base'
      },
      {
        trait_type: 'Deployed By',
        value: 'Inspiro Agent'
      }
    ];

    // Add timestamp
    attributes.push({
      trait_type: 'Creation Date',
      value: new Date().toISOString().split('T')[0]
    });

    return attributes.slice(0, 8); // Max 8 attributes
  }

  /**
   * Generate artwork using DALL-E (optional, can be replaced with templates)
   */
  async generateArtwork(collectionName, description) {
    try {
      const prompt = `Create a modern, abstract NFT artwork for a collection called "${collectionName}". ${description || ''}. Style: vibrant, digital art, geometric, suitable for NFT. No text in image.`;

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      });

      return response.data[0].url;
    } catch (error) {
      console.error('Error generating artwork:', error.message);
      // Return null to use default template
      return null;
    }
  }

  /**
   * Create default SVG template artwork
   */
  generateDefaultArtwork(collectionName, symbol) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7B731', '#5F27CD', '#00D2FF'
    ];
    
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];

    const svg = `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="32" 
        fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.8">${collectionName}</text>
</svg>`;

    return svg;
  }
}