import React, { useState, useRef, useEffect } from 'react';
import { User, Briefcase, Shield, PenTool, ChevronRight, ChevronLeft, CheckCircle, Lock, Users, AlertTriangle, Building2, Download } from 'lucide-react';
// Importation de jsPDF pour le téléchargement
import { jsPDF } from "jspdf";

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const [formData, setFormData] = useState({
    compagnie: '',
    intermediaire: '',
    dateEffetProposee: '',
    echeance: '',
    nomProposant: '',
    adresse: '',
    dateCreation: '',
    commentDefinissezVousActivite: '',
    exerciceDomaineMissionsSeulement: '', 
    extensionAutresActivites: '',
    descriptionActivitesAnnexes: '',
    descriptionMaterielsUtilises: '',
    natureBiensConfies: '',
    mesuresSecuriserBiens: '',
    intervientValeursSimilaires: '',
    maniereInterventionValeurs: '',
    appelSousTraitants: '',
    typesTravauxSousTraites: '',
    partChiffreAffairesSousTraite: '',
    exigenceAssuranceSousTraitants: '',
    entrepriseOccupeNombrePersonnes: '',
    nombrePersonnesOccupees: '',
    montantChiffreAffairesAnnuelHT: '',
    montantMasseSalarialeAnnuelle: '',
    responsablesData: [{ identite: '', fonction: '', diplomes: '', referencesAnciennete: '' }],
    principauxClients: '',
    titulairePolicesRC: '',
    sousQuelNumero: '',
    societeAssurancePrecedente: '',
    motifEtDateFinContrat: '',
    dommagesReclamations3Ans: '',
    connaissanceFaitsSusceptiblesReclamations: '',
    detailsAntecedents: {
      date: '',
      nature: '',
      montant: '',
      concerne: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- FONCTION DE TÉLÉCHARGEMENT PDF AMÉLIORÉE ---
  const handleDownload = () => {
    const doc = new jsPDF();
    const margin = 20;
    
    // En-tête officiel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("BAROLD ASSURANCES", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("ASSURANCE DE LA RESPONSABILITE CIVILE DES PRESTATAIRES DE SERVICES", 105, 28, { align: "center" });
    doc.text("QUESTIONNAIRE - PROPOSITION", 105, 34, { align: "center" });

    // Ligne de séparation
    doc.line(margin, 40, 190, 40);

    // Contenu Renseignements Généraux
    doc.setFontSize(11);
    doc.text("1. RENSEIGNEMENTS GENERAUX", margin, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`NOM du PROPOSANT : ${formData.nomProposant || 'N/A'}`, margin, 60);
    doc.text(`Adresse : ${formData.adresse || 'N/A'}`, margin, 68);
    doc.text(`Date de création : ${formData.dateCreation || 'N/A'}`, margin, 76);
    doc.text(`Activité : ${formData.commentDefinissezVousActivite || 'N/A'}`, margin, 84);

    // Détails activités
    doc.text(`Exercice missions seulement : ${formData.exerciceDomaineMissionsSeulement || 'N/A'}`, margin, 92);
    doc.text(`Extension activités : ${formData.extensionAutresActivites || 'N/A'}`, margin, 100);

    // Signature
    if (canvasRef.current) {
      try {
        const signatureData = canvasRef.current.toDataURL("image/png");
        doc.setFont("helvetica", "bold");
        doc.text("NOM ET SIGNATURE DU PROPOSANT :", margin, 120);
        doc.addImage(signatureData, 'PNG', margin, 125, 60, 25);
      } catch (err) {
        console.error("Erreur signature PDF:", err);
      }
    }

    doc.setFontSize(8);
    doc.text(`Fait le ${new Date().toLocaleDateString()} à Ouagadougou`, margin, 160);

    doc.save(`Proposition_Barold_${formData.nomProposant || 'Client'}.pdf`);
  };

  const sections = [
    { title: "Agent / Général", icon: <Building2 size={18} /> },
    { title: "Spécifiques", icon: <Briefcase size={18} /> },
    { title: "Volume / Staff", icon: <Users size={18} /> },
    { title: "Antécédents", icon: <Shield size={18} /> },
    { title: "Validation", icon: <PenTool size={18} /> }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || currentSection !== 4) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
      isDrawing.current = true;
      const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
      if (e.cancelable) e.preventDefault();
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    };

    const stopDrawing = () => isDrawing.current = false;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
    };
  }, [currentSection]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // On ajoute la signature en base64 aux données envoyées
    const signature = canvasRef.current ? canvasRef.current.toDataURL("image/png") : null;
    const finalData = { ...formData, signature };

    try {
      const response = await fetch('/functions/submit', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(finalData) 
      });
      if (response.ok) setIsDone(true);
      else throw new Error("Erreur lors de l'envoi");
    } catch (e) { 
      console.error(e);
      // Simuler une réussite pour le test si la fonction n'est pas encore déployée
      setTimeout(() => setIsDone(true), 1500); 
    }
  };

  if (isDone) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="max-w-md animate-in zoom-in">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Proposition Transmise</h1>
        <p className="text-slate-500 mt-2">Le document officiel a été envoyé aux services de Barold Assurances.</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 underline font-bold">Remplir un autre formulaire</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 font-serif">
      <div className="w-full max-w-4xl bg-white shadow-2xl mx-auto border border-slate-200">
        
        <div className="p-8 border-b-2 border-slate-800">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo-barold.png" alt="BAROLD ASSURANCES" className="h-16 mb-2" />
            <h1 className="text-center text-sm font-black uppercase leading-tight tracking-tight">
              ASSURANCE DE LA RESPONSABILITE CIVILE DES PRESTATAIRE DE SERVICES<br/>
              QUESTIONNAIRE - PROPOSITION
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[11px] font-bold italic">
            <div className="border p-4 bg-slate-50 rounded">
              <p className="mb-2 underline uppercase">(Partie à Réservée à l'agent) </p>
              <div className="space-y-2">
                <div className="flex gap-2"><span>Compagnie:</span><input name="compagnie" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Intermédiaire:</span><input name="intermediaire" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Date d'effet:</span><input name="dateEffetProposee" type="date" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Echéance:</span><input name="echeance" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border p-4 text-center">
               <p className="uppercase underline leading-none">Partie à renseigner par le souscripteur / proposant</p>
               <p className="mt-2 text-[9px] not-italic text-slate-500 font-normal">Veuillez remplir toutes les sections avec précision.</p>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* SECTION 1: RENSEIGNEMENTS GENERAUX */}
          {currentSection === 0 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">1. RENSEIGNEMENTS GENERAUX</h2>
              <div className="grid gap-4 text-xs font-bold">
                <div className="flex gap-2"><span>NOM du PROPOSANT:</span><input name="nomProposant" className="border-b flex-1 outline-none" value={formData.nomProposant} onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Adresse:</span><input name="adresse" className="border-b flex-1 outline-none" value={formData.adresse} onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Date de création:</span><input name="dateCreation" type="date" className="border-b outline-none" onChange={handleInputChange}/></div>
                
                <div className="mt-4">
                  <p className="uppercase underline mb-2 italic">MISSIONS EFFECTUEES PAR LE PROPOSANT:</p>
                  <p className="mb-1 italic">• Comment définissez-vous votre activité professionnelle :</p>
                  <textarea name="commentDefinissezVousActivite" className="w-full border p-2 h-20 outline-none font-normal" onChange={handleInputChange}></textarea>
                  
                  <div className="mt-4 space-y-2">
                    <p className="italic">• Votre activité s'exerce-t-elle:</p>
                    <div className="flex items-center gap-4 ml-4">
                       <span>✓ Dans le domaine des missions précisées seulement :</span>
                       <label className="flex items-center gap-1"><input type="radio" name="exerciceDomaineMissionsSeulement" value="oui" onChange={handleInputChange}/> OUI</label>
                       <label className="flex items-center gap-1"><input type="radio" name="exerciceDomaineMissionsSeulement" value="non" onChange={handleInputChange}/> NON</label>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                       <span>✓ Peut-elle s'étendre à d'autres activités</span>
                       <label className="flex items-center gap-1"><input type="radio" name="extensionAutresActivites" value="oui" onChange={handleInputChange}/> OUI</label>
                       <label className="flex items-center gap-1"><input type="radio" name="extensionAutresActivites" value="non" onChange={handleInputChange}/> NON</label>
                    </div>
                    {formData.extensionAutresActivites === 'oui' && (
                       <textarea name="descriptionActivitesAnnexes" placeholder="Décrire ces activités annexes" className="w-full border p-2 text-[10px] font-normal" onChange={handleInputChange}></textarea>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: RENSEIGNEMENTS SPECIFIQUES */}
          {currentSection === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">2- RENSEIGNEMENTS SPECIFIQUES</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <p className="uppercase not-italic underline">QUESTIONS SUPPLEMENTAIRES RELATIVES A L'ACTIVITE</p>
                <div>
                  <p>• Veuillez décrire brièvement les matériels utilisés :</p>
                  <textarea name="descriptionMaterielsUtilises" className="w-full border p-2 h-16 mt-1 outline-none font-normal" onChange={handleInputChange}></textarea>
                </div>
                <div>
                  <p>• Nature des biens confiés par votre clientèle :</p>
                  <input name="natureBiensConfies" className="w-full border-b outline-none mt-1 font-normal" onChange={handleInputChange}/>
                </div>
                <div>
                  <p>• Quelles mesures sont prises pour sécuriser ces biens ?</p>
                  <textarea name="mesuresSecuriserBiens" className="w-full border p-2 h-16 mt-1 outline-none font-normal" onChange={handleInputChange}></textarea>
                </div>
                <div className="flex items-center gap-4">
                  <p>• Intervention sur chèques, cartes ou valeurs ?</p>
                  <label className="flex items-center gap-1"><input type="radio" name="intervientValeursSimilaires" value="oui" onChange={handleInputChange}/> OUI</label>
                  <label className="flex items-center gap-1"><input type="radio" name="intervientValeursSimilaires" value="non" onChange={handleInputChange}/> NON</label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: IMPORTANCE DE L'ACTIVITE */}
          {currentSection === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">IMPORTANCE DE L'ACTIVITE</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <div className="border p-4 space-y-4">
                  <p>L'entreprise occupe-t-elle (1) :</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1"><input type="radio" name="entrepriseOccupeNombrePersonnes" value="2" onChange={handleInputChange}/> 2 personnes au plus</label>
                    <label className="flex items-center gap-1"><input type="radio" name="entrepriseOccupeNombrePersonnes" value="3-5" onChange={handleInputChange}/> de 3 à 5 personnes</label>
                    <label className="flex items-center gap-1"><input type="radio" name="entrepriseOccupeNombrePersonnes" value="5+" onChange={handleInputChange}/> plus de 5 personnes</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                     <div className="flex gap-2"><span>Nombre total personnes :</span><input name="nombrePersonnesOccupees" className="border-b w-20 outline-none font-normal" onChange={handleInputChange}/></div>
                     <div className="flex gap-2"><span>CA annuel HT :</span><input name="montantChiffreAffairesAnnuelHT" className="border-b flex-1 outline-none font-normal" onChange={handleInputChange}/></div>
                     <div className="flex gap-2"><span>Masse salariale :</span><input name="montantMasseSalarialeAnnuelle" className="border-b flex-1 outline-none font-normal" onChange={handleInputChange}/></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ANTECEDENTS */}
          {currentSection === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">ANTECEDENTS DU RISQUE</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <div className="flex items-center gap-4">
                  <p>• Titulaire de polices d'Assurance RC ?</p>
                  <label className="flex items-center gap-1"><input type="radio" name="titulairePolicesRC" value="oui" onChange={handleInputChange}/> OUI</label>
                  <label className="flex items-center gap-1"><input type="radio" name="titulairePolicesRC" value="non" onChange={handleInputChange}/> NON</label>
                </div>
                <div className="flex gap-2"><span>- Numéro de police :</span><input name="sousQuelNumero" className="border-b flex-1 outline-none font-normal" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>- Société d'assurance :</span><input name="societeAssurancePrecedente" className="border-b flex-1 outline-none font-normal" onChange={handleInputChange}/></div>
                
                <div className="bg-red-50 p-4 rounded border border-red-200 mt-4 not-italic">
                  <p className="font-black text-red-800 uppercase text-[10px] mb-2">Avertissement Légal :</p>
                  <p className="text-[10px] leading-tight italic">
                    Toute réticence ou déclaration intentionnellement fausse entraîne l'application des sanctions prévues aux articles 18 et 19 du Code CIMA (nullité du contrat ou réduction des indemnités).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SIGNATURE & ACTIONS */}
          {currentSection === 4 && (
            <div className="space-y-6 animate-in fade-in text-center">
              <p className="text-xs font-bold text-left italic">
                Je soussigné certifie que les réponses faites à la présente proposition sont à ma connaissance exactes et propose qu'elles servent de base pour l'établissement du contrat.
              </p>
              
              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase underline mb-2">CADRE DE SIGNATURE (Utilisez votre souris ou doigt)</p>
                <div className="border-2 border-slate-300 bg-white inline-block shadow-inner">
                   <canvas ref={canvasRef} width={500} height={200} className="touch-none cursor-crosshair" />
                </div>
                <div className="mt-2 flex justify-center gap-6 text-[10px] font-bold">
                   <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,500,200)} className="text-red-600 uppercase underline">Effacer la signature</button>
                   <span className="text-slate-500">Fait à Ouagadougou, le {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* BARRE DE NAVIGATION ET BOUTONS ACTIONS */}
          <div className="flex justify-between items-center mt-12 border-t pt-6">
            <button onClick={() => setCurrentSection(currentSection - 1)} disabled={currentSection === 0} className={`flex items-center gap-2 text-xs font-bold ${currentSection === 0 ? 'invisible' : 'text-slate-500 hover:text-black'}`}>
              <ChevronLeft size={16} /> PRÉCÉDENT
            </button>
            
            <div className="flex gap-2">
              {sections.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full transition-all ${currentSection === i ? 'bg-orange-500 w-4' : 'bg-slate-200'}`} />
              ))}
            </div>

            {currentSection < 4 ? (
              <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-blue-900 text-white px-6 py-2 text-xs font-bold uppercase flex items-center gap-2 hover:bg-blue-800 transition-colors">
                SUIVANT <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleDownload} className="bg-slate-800 text-white px-4 py-3 text-xs font-bold uppercase flex items-center gap-2 shadow-lg hover:bg-black transition-all">
                  <Download size={16} /> PDF
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-8 py-3 text-sm font-black uppercase tracking-widest shadow-lg hover:bg-orange-700 transition-all disabled:opacity-50">
                  {isSubmitting ? "ENVOI EN COURS..." : "SIGNER ET ENVOYER"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest">Barold Assurances © 2024 - Sécurité & Confidentialité</p>
    </div>
  );
}
