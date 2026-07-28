import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { leaderId, name, phone, email, cpf, address } = req.body;

      const { data: leader, error: leaderError } = await supabase
        .from('leaders')
        .select('id')
        .eq('id', leaderId)
        .single();

      if (leaderError || !leader) return res.status(404).json({ error: 'Líder inválido' });

      const { error } = await supabase
        .from('leads')
        .insert([{ leader_id: leaderId, name, phone, email, cpf, address }]);

      if (error) throw error;

      return res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar contato', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
