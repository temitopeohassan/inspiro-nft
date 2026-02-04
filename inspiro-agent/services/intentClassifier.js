import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { config } from '../config.js';

export class IntentClassifier {
  constructor() {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    
    // Using Gemini 2.0 Flash-lite-preview-02-05 (latest)
    // We use Controlled Generation (Schema) to ensure valid JSON
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            intent: {
              type: SchemaType.STRING,
              enum: ["DEPLOY_PAID_NFT", "DEPLOY_FREE_NFT", "STATUS_QUERY", "IGNORE"],
            },
            confidence: { type: SchemaType.NUMBER },
            reason: { type: SchemaType.STRING },
            extracted_params: {
              type: SchemaType.OBJECT,
              properties: {
                collection_name: { type: SchemaType.STRING },
                max_supply: { type: SchemaType.NUMBER },
                mint_price: { type: SchemaType.NUMBER },
                description: { type: SchemaType.STRING },
              },
            },
            content_flags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ["intent", "confidence", "reason", "extracted_params", "content_flags"],
        },
      },
    });
  }

  /**
   * Classify user intent from cast text
   */
  async classifyIntent(castText) {
    const systemInstruction = `You are an intent classifier for an NFT deployment agent on Base.
Analyze the message and classify it. 
Rules:
- User MUST explicitly request deployment.
- Be conservative - if ambiguous, return IGNORE.
- Block content related to: NSFW, hate speech, copyrighted brands, celebrity likeness.`;

    const userPrompt = `Message: "${castText}"`;

    try {
      // Gemini separates system instructions from the prompt for better adherence
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: systemInstruction,
      });

      const response = result.response;
      const data = JSON.parse(response.text());

      // Validate content flags against your local config
      const hasBlockedContent = data.content_flags?.some(flag =>
        config.blockedContent.some(blocked =>
          flag.toLowerCase().includes(blocked.toLowerCase())
        )
      );

      if (hasBlockedContent) {
        return {
          ...data,
          intent: 'IGNORE',
          reason: 'Blocked content detected: ' + data.content_flags.join(', ')
        };
      }

      return data;
    } catch (error) {
      console.error('Error classifying intent with Gemini:', error.message);
      return {
        intent: 'IGNORE',
        confidence: 0,
        reason: 'Error processing request',
        extracted_params: {},
        content_flags: []
      };
    }
  }

  /**
   * Validate and normalize extracted parameters
   */
  validateParams(params) {
    const validated = {
      collection_name: null,
      max_supply: 100,
      mint_price: 0.001,
      description: null
    };

    if (params.collection_name) {
      validated.collection_name = String(params.collection_name).substring(0, 32);
    }

    if (typeof params.max_supply === 'number') {
      validated.max_supply = Math.max(
        config.constraints.supply.min,
        Math.min(params.max_supply, config.constraints.supply.max)
      );
    }

    if (params.mint_price !== undefined && params.mint_price !== null) {
      validated.mint_price = Math.max(
        config.constraints.mintPrice.min,
        Math.min(Number(params.mint_price), config.constraints.mintPrice.max)
      );
    }

    if (params.description) {
      validated.description = String(params.description).substring(0, 280);
    }

    return validated;
  }
}