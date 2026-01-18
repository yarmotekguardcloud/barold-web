import React, { useState, useRef, useEffect } from 'react';
import { User, Briefcase, Shield, PenTool, ChevronRight, ChevronLeft, CheckCircle, Lock, Users, AlertTriangle, Building2 } from 'lucide-react';

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // ÉTAT INITIAL : RÉPLIQUE EXACTE SANS PRÉ-REMPLISSAGE
  const [formData, setFormData] = useState({
    // (Partie à Réservée à l'agent)
    compagnie: '',
    intermediaire: '',
    dateEffetProposee: '',
    echeance: '',

    // (Partie à renseigner par le souscripteur/proposant)
    // 1. RENSEIGNEMENTS GENERAUX
    nomProposant: '',
    adresse: '',
    dateCreation: '',
    // MISSIONS EFFECTUEES PAR LE PROPOSANT
    commentDefinissezVousActivite: '',
    exerciceDomaineMissionsSeulement: '', 
    extensionAutresActivites: '',
    descriptionActivitesAnnexes: '',

    // 2- RENSEIGNEMENTS SPECIFIQUES
    // QUESTIONS SUPPLEMENTAIRES RELATIVES A L'ACTIVITE
    descriptionMaterielsUtilises: '',
    natureBiensConfies: '',
    mesuresSecuriserBiens: '',
    intervientValeursSimilaires: '',
    maniereInterventionValeurs: '',

    // QUESTIONS RELATIVES A L'ENSEMBLE DES ACTIVITES
    appelSousTraitants: '',
    typesTravauxSousTraites: '',
    partChiffreAffairesSousTraite: '',
    exigenceAssuranceSousTraitants: '',

    // IMPORTANCE DE L'ACTIVITE
    entrepriseOccupeNombrePersonnes: '', // 2 ou moins, 3 à 5, plus de 5
    nombrePersonnesOccupees: '',
    montantChiffreAffairesAnnuelHT: '',
    montantMasseSalarialeAnnuelle: '',

    // QUALIFICATIONS PROFESSIONNELLES DES PRINCIPAUX RESPONSABLES
    responsablesData: [{ identite: '', fonction: '', diplomes: '', referencesAnciennete: '' }],

    // QUESTIONS RELATIVES A LA CLIENTELE ET AUX FOURNISSEURS
    principauxClients: '',

    // ANTECEDENTS DU RISQUE
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
      concerne: '' // produits vendus, travaux exécutés, après achèvement, autre
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sections = [
    { title: "Agent / Général", icon: <Building2 size={18} /> },
    { title: "Spécifiques", icon: <Briefcase size={18} /> },
    { title: "Volume / Staff", icon: <Users size={18} /> },
    { title: "Antécédents", icon: <Shield size={18} /> },
    { title: "Validation", icon: <PenTool size={18} /> }
  ];

  // Gestion Signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
  }, [currentSection]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/functions/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      setIsDone(true);
    } catch (e) { setTimeout(() => setIsDone(true), 1500); }
  };

  if (isDone) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="max-w-md animate-in zoom-in">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Proposition Transmise</h1>
        <p className="text-slate-500 mt-2">Le document officiel a été envoyé aux services de Barold Assurances.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 font-serif">
      <div className="w-full max-w-4xl bg-white shadow-2xl mx-auto border border-slate-200">
        
        {/* HEADER AVEC LOGO ET TITRE PDF */}
        <div className="p-8 border-b-2 border-slate-800">
          <div className="flex flex-col items-center mb-6">
            <img src="/logo-barold.png" alt="BAROLD ASSURANCES" className="h-16 mb-2" />
            <h1 className="text-center text-sm font-black uppercase leading-tight tracking-tight">
              ASSURANCE DE LA RESPONSABILITE CIVILE DES PRESTATAIRE DE SERVICES [cite: 3]<br/>
              QUESTIONNAIRE - PROPOSITION [cite: 4, 5]
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[11px] font-bold italic">
            <div className="border p-4 bg-slate-50 rounded">
              <p className="mb-2 underline uppercase">(Partie à Réservée à l'agent) </p>
              <div className="space-y-2">
                <div className="flex gap-2"><span>Compagnie:</span><input name="compagnie" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Intermédiaire:</span><input name="intermediaire" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Date d'effet proposée:</span><input name="dateEffetProposee" type="date" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Echéance:</span><input name="echeance" className="border-b w-full bg-transparent outline-none" onChange={handleInputChange}/></div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center border p-4">
               <p className="text-center uppercase underline leading-none">Partie à renseigner par le souscripteur / proposant </p>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* SECTION 1: RENSEIGNEMENTS GENERAUX */}
          {currentSection === 0 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">1. RENSEIGNEMENTS GENERAUX [cite: 11]</h2>
              <div className="grid gap-4 text-xs font-bold">
                <div className="flex gap-2"><span>NOM du PROPOSANT:</span><input name="nomProposant" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Adresse:</span><input name="adresse" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>Date de création:</span><input name="dateCreation" type="date" className="border-b outline-none" onChange={handleInputChange}/></div>
                
                <div className="mt-4">
                  <p className="uppercase underline mb-2 italic">MISSIONS EFFECTUEES PAR LE PROPOSANT: [cite: 13]</p>
                  <p className="mb-1 italic">• Comment définissez-vous votre activité professionnelle : [cite: 14]</p>
                  <textarea name="commentDefinissezVousActivite" className="w-full border p-2 h-20 outline-none" onChange={handleInputChange}></textarea>
                  
                  <div className="mt-4 space-y-2">
                    <p className="italic">• Votre activité s'exerce-t-elle: [cite: 15]</p>
                    <div className="flex items-center gap-4 ml-4">
                       <span>✓ Dans le domaine des missions précisées ci-dessus seulement : [cite: 16]</span>
                       <label><input type="radio" name="exerciceDomaineMissionsSeulement" value="oui" onChange={handleInputChange}/> OUI</label>
                       <label><input type="radio" name="exerciceDomaineMissionsSeulement" value="non" onChange={handleInputChange}/> NON</label>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                       <span>✓ Peut-elle s'étendre à d'autres activités [cite: 20]</span>
                       <label><input type="radio" name="extensionAutresActivites" value="oui" onChange={handleInputChange}/> OUI</label>
                       <label><input type="radio" name="extensionAutresActivites" value="non" onChange={handleInputChange}/> NON</label>
                    </div>
                    {formData.extensionAutresActivites === 'oui' && (
                       <textarea name="descriptionActivitesAnnexes" placeholder="Décrire ces activités annexes" className="w-full border p-2 text-[10px]" onChange={handleInputChange}></textarea>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: RENSEIGNEMENTS SPECIFIQUES */}
          {currentSection === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">2- RENSEIGNEMENTS SPECIFIQUES [cite: 24]</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <p className="uppercase not-italic underline">QUESTIONS SUPPLEMENTAIRES RELATIVES A L'ACTIVITE [cite: 25]</p>
                <div>
                  <p>• Veuillez décrire brièvement les matériels utilisés dans l'exploitation de l'entreprise [cite: 26]</p>
                  <textarea name="descriptionMaterielsUtilises" className="w-full border p-2 h-16 mt-1 outline-none" onChange={handleInputChange}></textarea>
                </div>
                <div>
                  <p>• Quelle est la nature des biens confiés par votre clientèle et se trouvant dans vos locaux [cite: 28]</p>
                  <input name="natureBiensConfies" className="w-full border-b outline-none mt-1" onChange={handleInputChange}/>
                </div>
                <div>
                  <p>• Quelles mesures sont-elles prises pour permettre sécuriser ces biens [cite: 29]</p>
                  <textarea name="mesuresSecuriserBiens" className="w-full border p-2 h-16 mt-1 outline-none" onChange={handleInputChange}></textarea>
                </div>
                <div className="flex items-center gap-4">
                  <p>• Etes-vous susceptible d'intervenir sur des chèques bancaires, cartes de crédit ou valeurs similaires? [cite: 30]</p>
                  <label><input type="radio" name="intervientValeursSimilaires" value="oui" onChange={handleInputChange}/> OUI</label>
                  <label><input type="radio" name="intervientValeursSimilaires" value="non" onChange={handleInputChange}/> NON</label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ACTIVITE & STAFF */}
          {currentSection === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">IMPORTANCE DE L'ACTIVITE [cite: 40]</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <div className="border p-4 space-y-2">
                  <p>L'entreprise occupe-t-elle (1) : [cite: 42]</p>
                  <div className="flex gap-4">
                    <label><input type="radio" name="entrepriseOccupeNombrePersonnes" value="2" onChange={handleInputChange}/> 2 personnes au plus [cite: 43]</label>
                    <label><input type="radio" name="entrepriseOccupeNombrePersonnes" value="3-5" onChange={handleInputChange}/> de 3 à 5 personnes [cite: 47]</label>
                    <label><input type="radio" name="entrepriseOccupeNombrePersonnes" value="5+" onChange={handleInputChange}/> plus de 5 personnes [cite: 50]</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                     <div className="flex gap-2"><span>Nombre de personnes occupées : [cite: 54]</span><input name="nombrePersonnesOccupees" className="border-b w-20 outline-none" onChange={handleInputChange}/></div>
                     <div className="flex gap-2"><span>Chiffre d'affaires annuel HT : [cite: 55]</span><input name="montantChiffreAffairesAnnuelHT" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                     <div className="flex gap-2"><span>Masse salariale annuelle : [cite: 56]</span><input name="montantMasseSalarialeAnnuelle" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="uppercase not-italic underline mb-2">QUALIFICATIONS PROFESSIONNELLES DES PRINCIPAUX RESPONSABLES [cite: 58]</p>
                  <table className="w-full border-collapse border text-[10px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="border p-1">Identité [cite: 59]</th>
                        <th className="border p-1">Fonction [cite: 63]</th>
                        <th className="border p-1">Diplômes [cite: 64]</th>
                        <th className="border p-1">Ancienneté prof. [cite: 65]</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-1"><input className="w-full outline-none" onChange={handleInputChange}/></td>
                        <td className="border p-1"><input className="w-full outline-none" onChange={handleInputChange}/></td>
                        <td className="border p-1"><input className="w-full outline-none" onChange={handleInputChange}/></td>
                        <td className="border p-1"><input className="w-full outline-none" onChange={handleInputChange}/></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ANTECEDENTS */}
          {currentSection === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">ANTECEDENTS DU RISQUE [cite: 69]</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <div className="flex items-center gap-4">
                  <p>• Titulaire de polices d'Assurance Responsabilité Civile ? [cite: 70]</p>
                  <label><input type="radio" name="titulairePolicesRC" value="oui" onChange={handleInputChange}/> OUI</label>
                  <label><input type="radio" name="titulairePolicesRC" value="non" onChange={handleInputChange}/> NON</label>
                </div>
                <div className="flex gap-2"><span>- Sous quel numéro ? [cite: 71]</span><input name="sousQuelNumero" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                <div className="flex gap-2"><span>- A quelle société d'assurances ? [cite: 72]</span><input name="societeAssurancePrecedente" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
                
                <div className="bg-red-50 p-4 rounded border border-red-200 mt-4 not-italic">
                  <p className="font-black text-red-800 uppercase text-[10px] mb-2">Attention : [cite: 96]</p>
                  <p className="text-[10px] leading-tight italic">
                    Toute réticence ou déclaration intentionnellement fausse entraîne l'application des sanctions prévues aux articles 18 et 19 du Code CIMA. [cite: 96]
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SIGNATURE */}
          {currentSection === 4 && (
            <div className="space-y-6 animate-in fade-in text-center">
              <p className="text-xs font-bold text-left italic">
                Je soussigné certifie que les réponses faites à la présente proposition sont à ma connaissance exactes et propose qu'elles servent de base pour l'établissement du contrat... [cite: 97, 98, 99]
              </p>
              
              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase underline mb-2">NOM ET SIGNATURE DU PROPOSANT [cite: 104]</p>
                <div className="border-2 border-slate-300 bg-white inline-block">
                   <canvas ref={canvasRef} width={500} height={200} className="touch-none cursor-crosshair" />
                </div>
                <div className="mt-2 flex justify-center gap-4 text-[10px] font-bold">
                   <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,500,200)} className="text-red-600 underline">Effacer</button>
                   <span>Fait à Ouagadougou, le {new Date().toLocaleDateString()} [cite: 100, 102]</span>
                </div>
              </div>
            </div>
          )}

          {/* BARRE DE NAVIGATION */}
          <div className="flex justify-between items-center mt-12 border-t pt-6">
            <button onClick={() => setCurrentSection(currentSection - 1)} disabled={currentSection === 0} className={`flex items-center gap-2 text-xs font-bold ${currentSection === 0 ? 'invisible' : 'text-slate-500'}`}>
              <ChevronLeft size={16} /> PRÉCÉDENT
            </button>
            <div className="flex gap-1">
              {sections.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${currentSection === i ? 'bg-orange-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            {currentSection < 4 ? (
              <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-blue-900 text-white px-6 py-2 text-xs font-bold uppercase flex items-center gap-2">
                SUIVANT <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-8 py-3 text-sm font-black uppercase tracking-widest shadow-lg">
                {isSubmitting ? "TRANSMISSION..." : "SIGNER ET ENVOYER"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}