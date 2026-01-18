export async function onRequestPost(context) {
  const { RESEND_API_KEY } = context.env;
  const data = await context.request.json();

  // Construction du corps de l'e-mail avec les données du formulaire
  const emailBody = {
    from: "Barold Formulaire <onboarding@resend.dev>", 
    to: ["bagnon.bassan@baroldassurance.com"],
    cc: ["myarbanga@yarmotek.com"],
    subject: `PROPOSITION RC PRESTATAIRE : ${data.nomProposant || 'Nouveau Client'}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #003366; border-bottom: 2px solid #003366;">NOUVELLE PROPOSITION D'ASSURANCE</h2>
        
        <h3>1. RENSEIGNEMENTS GÉNÉRAUX</h3>
        <p><strong>Nom du Proposant :</strong> ${data.nomProposant || 'Non renseigné'}</p>
        <p><strong>Adresse :</strong> ${data.adresse || 'Non renseignée'}</p>
        <p><strong>Activité définie :</strong> ${data.commentDefinissezVousActivite || 'Non renseignée'}</p>
        
        <h3>2. DÉTAILS DE L'ACTIVITÉ</h3>
        <p><strong>Chiffre d'affaires annuel HT :</strong> ${data.montantChiffreAffairesAnnuelHT || 'N/A'}</p>
        <p><strong>Nombre de personnes :</strong> ${data.nombrePersonnesOccupees || 'N/A'}</p>
        <p><strong>Matériels utilisés :</strong> ${data.descriptionMaterielsUtilises || 'N/A'}</p>

        <hr />
        <p style="font-size: 10px; color: #666; font-style: italic;">
          Conformément aux articles 18 et 19 du Code CIMA, le client certifie l'exactitude de ces informations.
        </p>

        <h3>SIGNATURE DU CLIENT</h3>
        <div style="border: 1px solid #ccc; padding: 10px; display: inline-block;">
          <img src="${data.signature}" alt="Signature du client" style="max-width: 300px;" />
        </div>
        
        <p><br/>Fait le : ${new Date().toLocaleDateString()}</p>
      </div>
    `
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailBody)
    });

    const result = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: result }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur serveur lors de l'envoi" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}