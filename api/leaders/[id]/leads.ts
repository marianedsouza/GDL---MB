import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase';
import { verifyAuth } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAuth(req, res)) return;

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          leader:leaders(id, name)
        `)
        .eq('leader_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedLeads = (leads || []).map((lead) => ({
        ...lead,
        _id: lead.id,
        leaderId: lead.leader ? { _id: lead.leader.id, name: lead.leader.name } : null,
      }));

      return res.json(mappedLeads);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar contatos', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
