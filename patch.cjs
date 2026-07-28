const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const insertCode = `
// Create a leader (Public)
app.post('/api/public/leaders', async (req, res) => {
  try {
    const payload = req.body;
    
    // Convert camelCase payload to snake_case for Supabase if needed,
    // or just pass payload directly (Supabase column names should match keys)
    // Based on previous code, let's just convert it:
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
      direct_leader: payload.directLeader
    };

    const { data: leader, error } = await supabase
      .from('leaders')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;
    
    res.json({ ...leader, _id: leader.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar liderança", details: err.message });
  }
});
`;

if (!code.includes("app.post('/api/public/leaders'")) {
    code = code.replace("app.delete('/api/leaders/:id'", insertCode + "\n// Delete a leader (Admin)\napp.delete('/api/leaders/:id'");
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts successfully");
}
