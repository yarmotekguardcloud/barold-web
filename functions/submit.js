export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();

    // Structuration de l'e-mail pour l'assureur
    const emailBody = `
      DOSSIER RC PROFESSIONNELLE - YARMOTEK INTERNATIONAL
      --------------------------------------------------
      EXPÉDITEUR : ${data.nomProposant}
      DATE DE CRÉATION : ${data.dateCreation}
      
      1. ACTIVITÉ DÉCLARÉE :
      ${data.activiteProfessionnelle}
      
      2. DÉTAILS TECHNIQUES (PAGE 2) :
      - Matériels : ${data.materielsUtilises}
      - Biens confiés : ${data.biensConfiesNature}
      - Sécurité : ${data.mesuresSecurite}
      
      3. CHIFFRES ET SOUS-TRAITANCE :
      - CA Annuel HT : ${data.chiffreAffairesAnnuel}
      - Sous-traitants : ${data.appelSousTraitants ? 'OUI' : 'NON'} (${data.typesTravaux})
      
      4. ANTÉCÉDENTS (PAGE 3) :
      - Déjà assuré : ${data.policeRC ? 'OUI' : 'NON'}
      - Sinistres (3 ans) : ${data.sinistres3ans ? 'OUI' : 'NON'}
      
      --------------------------------------------------
      CERTIFICATION : Je certifie l'exactitude des informations.
      Signature électronique transmise via le formulaire digital.
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yarmotek <onboarding@resend.dev>',
        to: ['bagnon.bassan@baroldassurance.com'],
        cc: ['votre-email@domaine.com'], // Mettez votre email pour recevoir une copie
        subject: `NOUVEAU DOSSIER ASSURANCE - ${data.nomProposant}`,
        text: emailBody,
      }),
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}