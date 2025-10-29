import { supabase } from '../lib/supabase';

export class WalletService {
  static generateWalletAddress(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const userHash = userId.substring(0, 8);
    return `0xPL${userHash}${timestamp}${random}`.substring(0, 42);
  }

  static async hasWallet(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return !!data?.wallet_address;
  }

  static async hasReceivedWelcomeBonus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('transaction_type', 'initial_credit')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  static async createWallet(userId: string): Promise<string> {
    const existingWallet = await this.hasWallet(userId);
    if (existingWallet) {
      const { data } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', userId)
        .single();

      throw new Error(`Wallet already exists for this user: ${data?.wallet_address}`);
    }

    const hasBonus = await this.hasReceivedWelcomeBonus(userId);
    if (hasBonus) {
      throw new Error('Welcome bonus already claimed. Cannot create duplicate wallet.');
    }

    const walletAddress = this.generateWalletAddress(userId);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        wallet_address: walletAddress,
        wallet_balance: 100,
      })
      .eq('id', userId)
      .is('wallet_address', null);

    if (updateError) {
      if (updateError.code === '23505') {
        throw new Error('Wallet address already exists. Please try again.');
      }
      throw updateError;
    }

    try {
      await this.recordTransaction({
        user_id: userId,
        transaction_type: 'initial_credit',
        amount: 100,
        description: 'Welcome bonus - Initial wallet credit',
      });
    } catch (txError: any) {
      if (txError.code === '23505') {
        throw new Error('Welcome bonus already claimed.');
      }
      throw txError;
    }

    return walletAddress;
  }

  static async getWalletBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.wallet_balance || 0;
  }

  static async recordTransaction(transaction: {
    user_id: string;
    transaction_type: string;
    amount: number;
    donation_id?: string;
    blockchain_hash?: string;
    description: string;
  }) {
    const { error } = await supabase
      .from('wallet_transactions')
      .insert(transaction);

    if (error) throw error;
  }

  static async getTransactionHistory(userId: string) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async creditWallet(userId: string, amount: number, description: string, donationId?: string) {
    const currentBalance = await this.getWalletBalance(userId);
    const newBalance = currentBalance + amount;

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (error) throw error;

    await this.recordTransaction({
      user_id: userId,
      transaction_type: 'credit',
      amount,
      donation_id: donationId,
      description,
    });

    return newBalance;
  }

  static async debitWallet(userId: string, amount: number, description: string, donationId?: string) {
    const currentBalance = await this.getWalletBalance(userId);

    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = currentBalance - amount;

    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (error) throw error;

    await this.recordTransaction({
      user_id: userId,
      transaction_type: 'debit',
      amount: -amount,
      donation_id: donationId,
      description,
    });

    return newBalance;
  }

  static async transferTokens(fromUserId: string, toUserId: string, amount: number, description: string, donationId?: string) {
    await this.debitWallet(fromUserId, amount, `Transfer: ${description}`, donationId);
    await this.creditWallet(toUserId, amount, `Received: ${description}`, donationId);
  }

  static async validateWalletState(userId: string): Promise<{
    hasWallet: boolean;
    hasBonus: boolean;
    canCreateWallet: boolean;
    message?: string;
  }> {
    try {
      const [hasWallet, hasBonus] = await Promise.all([
        this.hasWallet(userId),
        this.hasReceivedWelcomeBonus(userId),
      ]);

      let canCreateWallet = true;
      let message = '';

      if (hasWallet) {
        canCreateWallet = false;
        message = 'Wallet already exists for this user';
      } else if (hasBonus) {
        canCreateWallet = false;
        message = 'Welcome bonus already claimed';
      }

      return {
        hasWallet,
        hasBonus,
        canCreateWallet,
        message,
      };
    } catch (error) {
      console.error('Error validating wallet state:', error);
      return {
        hasWallet: false,
        hasBonus: false,
        canCreateWallet: false,
        message: 'Error validating wallet state',
      };
    }
  }
}
