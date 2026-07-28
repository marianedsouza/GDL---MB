import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const payload = req.body;

      const dbPayload = {
        full_name: payload.fullName,
        name: payload.name,
        cpf: payload.cpf,
        birth_date: payload.birthDate,
        phone: payload.phone,
        email: payload.email,
        neighborhood: payload.neighborhood,
        administrative_region: payload.administrativeRegion,
        city: payload.city,
        role: payload.role,
        segment: payload.segment,
        target_neighborhoods: payload.targetNeighborhoods,
        estimated_mobilization: payload.estimatedMobilization,
        has_whatsapp_group: payload.hasWhatsappGroup,
        whatsapp_group_participants: payload.whatsappGroupParticipants,
        available_days: payload.availableDays,
        has_vehicle: payload.hasVehicle,
        can_walk: payload.canWalk,
        can_organize_meetings: payload.canOrganizeMeetings,
        can_host_meetings: payload.canHostMeetings,
        skills: payload.skills,
        commitment_agreed: payload.commitmentAgreed,
        direct_leader: payload.directLeader,
        address: `${payload.street || ''}, ${payload.addressNumber || 'S/N'} - ${payload.neighborhood || ''}, ${payload.city || ''} - CEP: ${payload.cep || ''}`,
      };

      const { data: leader, error } = await supabase
        .from('leaders')
        .insert([dbPayload])
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
