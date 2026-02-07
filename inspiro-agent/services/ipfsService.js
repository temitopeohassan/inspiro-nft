import pinataSDK from '@pinata/sdk';
import axios from 'axios';
import { config } from '../config.js';

export class IPFSService {
  constructor() {
    this.pinata = new pinataSDK(config.pinataApiKey, config.pinataSecretKey);
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadMetadata(metadata) {
    try {
      const options = {
        pinataMetadata: {
          name: `${metadata.name} - Metadata`
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const result = await this.pinata.pinJSONToIPFS(metadata, options);
      
      console.log('Metadata uploaded to IPFS:', result.IpfsHash);
      
      return {
        ipfsHash: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error.message);
      throw error;
    }
  }

  /**
   * Upload image to IPFS
   */
  async uploadImage(imageData, fileName) {
    try {
      let buffer;
      
      // If imageData is a URL, fetch it first
      if (typeof imageData === 'string' && imageData.startsWith('http')) {
        const response = await axios.get(imageData, {
          responseType: 'arraybuffer'
        });
        buffer = Buffer.from(response.data);
      } else if (typeof imageData === 'string') {
        // SVG string
        buffer = Buffer.from(imageData);
      } else {
        buffer = imageData;
      }

      const options = {
        pinataMetadata: {
          name: fileName
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const result = await this.pinata.pinFileToIPFS(buffer, options);
      
      console.log('Image uploaded to IPFS:', result.IpfsHash);
      
      return {
        ipfsHash: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
      };
    } catch (error) {
      console.error('Error uploading image to IPFS:', error.message);
      throw error;
    }
  }

  /**
   * Upload complete NFT (image + metadata)
   */
  async uploadNFT(metadata, imageData, imageName) {
    try {
      // Upload image first
      const imageResult = await this.uploadImage(imageData, imageName);
      
      // Update metadata with image URL
      const completeMetadata = {
        ...metadata,
        image: imageResult.ipfsUrl
      };
      
      // Upload metadata
      const metadataResult = await this.uploadMetadata(completeMetadata);
      
      return {
        metadataHash: metadataResult.ipfsHash,
        metadataUrl: metadataResult.ipfsUrl,
        metadataGatewayUrl: metadataResult.gatewayUrl,
        imageHash: imageResult.ipfsHash,
        imageUrl: imageResult.ipfsUrl,
        imageGatewayUrl: imageResult.gatewayUrl
      };
    } catch (error) {
      console.error('Error uploading NFT to IPFS:', error.message);
      throw error;
    }
  }

  /**
   * Create base URI for collection (metadata folder)
   */
  async createCollectionBaseURI(collectionMetadata) {
    try {
      // For ERC721, base URI typically points to a folder containing {tokenId}.json files
      // We'll upload the base metadata and return the folder path
      const result = await this.uploadMetadata(collectionMetadata);
      
      // Base URI format: ipfs://QmHash/
      return `ipfs://${result.ipfsHash}/`;
    } catch (error) {
      console.error('Error creating base URI:', error.message);
      throw error;
    }
  }
}