export interface Block {
  index: number;
  timestamp: string;
  data: DonationTransaction;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface DonationTransaction {
  id: string;
  donationId: string;
  donorId: string;
  donorName: string;
  recipientId?: string;
  recipientName?: string;
  quantity: number;
  padType: string;
  location: string;
  transactionType: 'created' | 'reserved' | 'completed' | 'cancelled';
  description: string;
}

export class BlockchainService {
  private static async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  static async createBlock(
    index: number,
    data: DonationTransaction,
    previousHash: string
  ): Promise<Block> {
    const timestamp = new Date().toISOString();
    let nonce = 0;
    let hash = '';

    do {
      nonce++;
      const blockString = JSON.stringify({ index, timestamp, data, previousHash, nonce });
      hash = await this.sha256(blockString);
    } while (!hash.startsWith('00'));

    return {
      index,
      timestamp,
      data,
      previousHash,
      hash,
      nonce,
    };
  }

  static async createGenesisBlock(): Promise<Block> {
    const genesisData: DonationTransaction = {
      id: 'genesis',
      donationId: 'genesis',
      donorId: 'system',
      donorName: 'PadLink System',
      quantity: 0,
      padType: 'none',
      location: 'blockchain',
      transactionType: 'created',
      description: 'Genesis Block - PadLink Blockchain Initialized',
    };

    return this.createBlock(0, genesisData, '0');
  }

  static async validateBlock(block: Block, previousBlock: Block): Promise<boolean> {
    if (block.previousHash !== previousBlock.hash) {
      return false;
    }

    if (block.index !== previousBlock.index + 1) {
      return false;
    }

    const blockString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce,
    });
    const calculatedHash = await this.sha256(blockString);

    if (calculatedHash !== block.hash) {
      return false;
    }

    if (!block.hash.startsWith('00')) {
      return false;
    }

    return true;
  }

  static async validateChain(blocks: Block[]): Promise<boolean> {
    if (blocks.length === 0) return false;

    const genesisBlock = blocks[0];
    if (genesisBlock.previousHash !== '0' || genesisBlock.index !== 0) {
      return false;
    }

    for (let i = 1; i < blocks.length; i++) {
      const isValid = await this.validateBlock(blocks[i], blocks[i - 1]);
      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  static generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
