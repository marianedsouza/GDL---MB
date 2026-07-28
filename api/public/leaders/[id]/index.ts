import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: leader, error } = await supabase
        .from('leaders')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error || !leader) return res.status(404).json({ error: 'Líder não encontrado' });

      return res.json({ ...leader, _id: leader.id });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
