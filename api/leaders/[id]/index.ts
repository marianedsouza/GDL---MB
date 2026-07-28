import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { verifyAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAuth(req, res)) return;

  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      await supabase.from('leads').delete().eq('leader_id', id);

      const { error } = await supabase.from('leaders').delete().eq('id', id);

      if (error) throw error;

      return res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao deletar liderança', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
