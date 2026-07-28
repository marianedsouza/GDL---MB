import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { verifyAuth } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAuth(req, res)) return;

  if (req.method === 'GET') {
    try {
      const { data: leaders, error } = await supabase
        .from('leaders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const leadersWithCount = await Promise.all(
        (leaders || []).map(async (leader) => {
          const { count } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('leader_id', leader.id);

          return { ...leader, _id: leader.id, leadsCount: count || 0 };
        })
      );

      return res.json(leadersWithCount);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar lideranças', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, phone, email, cpf, address } = req.body;

      const { data: leader, error } = await supabase
        .from('leaders')
        .insert([{ name, phone, email, cpf, address }])
        .select()
        .single();

      if (error) throw error;

      return res.json({ ...leader, _id: leader.id });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao criar liderança', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
