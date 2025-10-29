import { supabase } from '../lib/supabase';

export class AdminService {
  static async logAction(
    adminId: string,
    actionType: string,
    description: string,
    targetUserId?: string,
    targetResourceType?: string,
    targetResourceId?: string,
    metadata?: any
  ) {
    const { error } = await supabase.from('admin_actions').insert({
      admin_id: adminId,
      action_type: actionType,
      description,
      target_user_id: targetUserId,
      target_resource_type: targetResourceType,
      target_resource_id: targetResourceId,
      metadata: metadata || null,
    });

    if (error) {
      console.error('Error logging admin action:', error);
    }
  }

  static async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateUserRole(adminId: string, userId: string, newRole: 'donor' | 'recipient' | 'admin') {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name, user_type')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('profiles')
      .update({ user_type: newRole })
      .eq('id', userId);

    if (error) throw error;

    await this.logAction(
      adminId,
      'user_role_update',
      `Changed ${user?.full_name}'s role from ${user?.user_type} to ${newRole}`,
      userId,
      'profile',
      userId
    );
  }

  static async deleteUser(adminId: string, userId: string) {
    const { data: user } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    await this.logAction(
      adminId,
      'user_deleted',
      `Deleted user account: ${user?.full_name}`,
      userId,
      'profile',
      userId
    );
  }

  static async getAllDonations() {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        donor:profiles!donations_donor_id_fkey(full_name, email),
        recipient:profiles!donations_reserved_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateDonationStatus(
    adminId: string,
    donationId: string,
    newStatus: 'available' | 'reserved' | 'completed' | 'cancelled'
  ) {
    const { error } = await supabase
      .from('donations')
      .update({ status: newStatus })
      .eq('id', donationId);

    if (error) throw error;

    await this.logAction(
      adminId,
      'donation_status_update',
      `Updated donation status to ${newStatus}`,
      undefined,
      'donation',
      donationId
    );
  }

  static async getSystemStats() {
    const [users, donations, requests, articles, blockchain] = await Promise.all([
      supabase.from('profiles').select('id, user_type, wallet_balance'),
      supabase.from('donations').select('id, status, quantity'),
      supabase.from('requests').select('id, status'),
      supabase.from('educational_content').select('id, views_count'),
      supabase.from('blockchain').select('id'),
    ]);

    return {
      users: users.data || [],
      donations: donations.data || [],
      requests: requests.data || [],
      articles: articles.data || [],
      blockchain: blockchain.data || [],
    };
  }
}
