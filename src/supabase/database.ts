import { supabase } from './client';

export const DatabaseHelpers = {
  // Medicines
  async getMedicines() {
    return await supabase.from('medicines').select('*');
  },

  async getMedicineById(id: string) {
    return await supabase.from('medicines').select('*').eq('id', id).single();
  },

  async addMedicine(data: any) {
    return await supabase.from('medicines').insert([data]);
  },

  async updateMedicine(id: string, data: any) {
    return await supabase.from('medicines').update(data).eq('id', id);
  },

  async deleteMedicine(id: string) {
    return await supabase.from('medicines').delete().eq('id', id);
  },

  // Inventory
  async getInventory() {
    return await supabase.from('inventory_transactions').select('*');
  },

  async addInventoryBatch(data: any) {
    return await supabase.from('medicine_batches').insert([data]);
  },

  async updateInventoryQuantity(id: string, quantity: number) {
    return await supabase.from('medicine_batches').update({ quantity }).eq('id', id);
  },
};
