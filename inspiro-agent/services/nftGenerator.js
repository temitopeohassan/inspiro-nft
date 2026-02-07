import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from '../config.js';

export class NFTGenerator {
  constructor() {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    // Use the 2.0 Flash-lite model for fast, creative text generation
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite-preview-02-05" 
    });
  }

  /**
   * Generate complete NFT metadata
   */
  async generateMetadata(params) {
    const { collection_name, description } = params;

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
   * Generate collection description using Gemini
   */
  async generateDescription(collectionName) {
    try {
      const prompt = `You are a creative NFT collection description writer. 
      Write an engaging, concise description under 280 characters for an NFT collection named "${collectionName}". 
      Make it unique and interesting. Respond with ONLY the description text.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim().substring(0, 280);
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
      { trait_type: 'Collection', value: name || 'Inspiro' },
      { trait_type: 'Network', value: 'Base' },
      { trait_type: 'Deployed By', value: 'Inspiro Agent' },
      { trait_type: 'Creation Date', value: new Date().toISOString().split('T')[0] }
    ];

    return attributes.slice(0, 8);
  }

  /**
   * Note: Gemini 2.0 Flash-lite handles text/vision. 
   * For Image Generation (DALL-E equivalent), Google uses "Imagen".
   * This is currently a separate workflow or requires the Vertex AI SDK.
   * For now, we will log that it's using the default fallback.
   */
  async generateArtwork(collectionName, description) {
    console.log('Using default SVG artwork for:', collectionName);
    // If you plan to use a 3rd party API for images (like Midjourney/Stability), 
    // you would call it here.
    return null; 
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