import { supabase } from '../lib/supabase';
import { BlockchainService, Block, DonationTransaction } from './blockchain';

export class BlockchainManager {
  static async initializeBlockchain(): Promise<void> {
    const { data: existingBlocks } = await supabase
      .from('blockchain')
      .select('*')
      .order('block_index', { ascending: true })
      .limit(1);

    if (!existingBlocks || existingBlocks.length === 0) {
      const genesisBlock = await BlockchainService.createGenesisBlock();
      await this.saveBlock(genesisBlock);
    }
  }

  static async getLatestBlock(): Promise<Block | null> {
    const { data, error } = await supabase
      .from('blockchain')
      .select('*')
      .order('block_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      index: data.block_index,
      timestamp: data.timestamp,
      data: data.data as DonationTransaction,
      previousHash: data.previous_hash,
      hash: data.hash,
      nonce: data.nonce,
    };
  }

  static async getAllBlocks(): Promise<Block[]> {
    const { data, error } = await supabase
      .from('blockchain')
      .select('*')
      .order('block_index', { ascending: true });

    if (error || !data) return [];

    return data.map(block => ({
      index: block.block_index,
      timestamp: block.timestamp,
      data: block.data as DonationTransaction,
      previousHash: block.previous_hash,
      hash: block.hash,
      nonce: block.nonce,
    }));
  }

  static async addTransaction(transaction: DonationTransaction): Promise<Block | null> {
    try {
      await this.initializeBlockchain();

      const latestBlock = await this.getLatestBlock();
      if (!latestBlock) {
        throw new Error('Failed to get latest block');
      }

      const newBlock = await BlockchainService.createBlock(
        latestBlock.index + 1,
        transaction,
        latestBlock.hash
      );

      await this.saveBlock(newBlock);
      return newBlock;
    } catch (error) {
      console.error('Error adding transaction to blockchain:', error);
      return null;
    }
  }

  private static async saveBlock(block: Block): Promise<void> {
    const { error } = await supabase.from('blockchain').insert({
      block_index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previous_hash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
    });

    if (error) {
      throw new Error(`Failed to save block: ${error.message}`);
    }
  }

  static async verifyChainIntegrity(): Promise<{
    isValid: boolean;
    totalBlocks: number;
    lastVerifiedBlock: number;
    error?: string;
  }> {
    try {
      const blocks = await this.getAllBlocks();

      if (blocks.length === 0) {
        return {
          isValid: false,
          totalBlocks: 0,
          lastVerifiedBlock: -1,
          error: 'No blocks found in chain',
        };
      }

      const isValid = await BlockchainService.validateChain(blocks);

      return {
        isValid,
        totalBlocks: blocks.length,
        lastVerifiedBlock: blocks[blocks.length - 1].index,
      };
    } catch (error: any) {
      return {
        isValid: false,
        totalBlocks: 0,
        lastVerifiedBlock: -1,
        error: error.message,
      };
    }
  }

  static async getDonationHistory(donationId: string): Promise<Block[]> {
    const allBlocks = await this.getAllBlocks();
    return allBlocks.filter(block => block.data.donationId === donationId);
  }

  static async getUserTransactions(userId: string): Promise<Block[]> {
    const allBlocks = await this.getAllBlocks();
    return allBlocks.filter(
      block => block.data.donorId === userId || block.data.recipientId === userId
    );
  }
}
