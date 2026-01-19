import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const [formData, setFormData] = useState({
    compagnie: '', intermediaire: '', dateEffet: '', echeance: '',
    nomProposant: '', adresse: '', dateCreation: '',
    activiteProfessionnelle: '', missionExclusive: '', sEtendreAutres: '', activitesAnnexes: '',
    materielsUtilises: '', natureBiensConfies: '', mesuresSecurite: '',
    intervientValeurs: '', maniereIntervention: '',
    appelSousTraitance: '', typesTravauxSousTraites: '', partCASousTraite: '', exigeAssuranceST: '',
    occupeMoins2: false, occupe3a5: false, occupePlus5: false,
    nombrePersonnes: '', caHT: '', masseSalariale: '', principauxClients: '',
    dejaAssureRC: '', numPolice: '', societeAssurance: '', motifDateFin: '',
    dommages3Ans: '', faitsSusceptibles: '',
    concerneProduits: false, concerneTravaux: false, concerneApresAchevement: false, concerneAutre: false,
    dateSinistre: '', natureSinistre: '', montantSinistre: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!formData.nomProposant) return alert("Le NOM du PROPOSANT est obligatoire.");
    setIsSubmitting(true);
    const signatureBase64 = canvasRef.current ? canvasRef.current.toDataURL("image/png") : "";

    const templateParams = {
      ...formData,
      signature: signatureBase64,
      dateJour: new Date().toLocaleDateString('fr-FR')
    };

    try {
      await emailjs.send('service_3nzz4gj', 'template_2pnk0gg', templateParams, 'diETOYFuHDO5ykoIM');
      setIsDone(true);
    } catch (error) {
      alert("Erreur lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
  }, [currentSection]);

  if (isDone) return <div className="p-20 text-center"><CheckCircle className="mx-auto text-green-600 w-16 h-16"/><h1 className="text-2xl font-bold mt-4 uppercase">Proposition Transmise</h1></div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-serif text-[11px] leading-tight">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl border border-black p-8">
        
        {/* EN-TÊTE PAGE 1 */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <img src="/logo-barold.png" alt="BAROLD ASSURANCES" className="h-14 mb-1" />
                     </div>
          <div className="border border-black p-2 w-72 italic bg-gray-50">
            <p className="font-bold underline not-italic mb-1">(Partie à Réservée à l'agent)</p>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex gap-1"><span>Compagnie:</span><input name="compagnie" className="border-b flex-1 bg-transparent" onChange={handleInputChange}/></div>
              <div className="flex gap-1"><span>Intermédiaire:</span><input name="intermediaire" className="border-b flex-1 bg-transparent" onChange={handleInputChange}/></div>
              <div className="flex gap-1"><span>Date d'effet proposée:</span><input name="dateEffet" className="border-b flex-1 bg-transparent" onChange={handleInputChange}/></div>
              <div className="flex gap-1"><span>Echéance:</span><input name="echeance" className="border-b flex-1 bg-transparent" onChange={handleInputChange}/></div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="font-bold uppercase text-[14px]">ASSURANCE DE LA RESPONSABILITE CIVILE DES PRESTATAIRES DE SERVICES</h2>
          <h3 className="font-bold text-lg mt-1 tracking-widest">QUESTIONNAIRE - PROPOSITION</h3>
          <p className="italic mt-1">(Partie à renseigner par le souscripteur/proposant)</p>
        </div>

        {/* SECTION 1 : PAGE 1 */}
        {currentSection === 0 && (
          <div className="space-y-4">
            <h4 className="font-bold underline uppercase">1. RENSEIGNEMENTS GENERAUX</h4>
            <div className="grid gap-2">
              <div className="flex gap-2"><span>NOM du PROPOSANT:</span><input name="nomProposant" className="border-b flex-1 outline-none uppercase font-bold" onChange={handleInputChange}/></div>
              <div className="flex gap-2"><span>Adresse:</span><input name="adresse" className="border-b flex-1 outline-none" onChange={handleInputChange}/></div>
              <div className="flex gap-2 w-1/3"><span>Date de création:</span><input name="dateCreation" type="date" className="border-b outline-none" onChange={handleInputChange}/></div>
            </div>
            
            <div className="mt-4">
              <p className="font-bold underline uppercase mb-2">MISSIONS EFFECTUEES PAR LE PROPOSANT:</p>
              <p>• Comment définissez-vous votre activité professionnelle :</p>
              <textarea name="activiteProfessionnelle" className="w-full border p-1 h-20" onChange={handleInputChange}></textarea>
              <p className="mt-2">• Votre activité s'exerce-t-elle:</p>
              <div className="ml-4 space-y-1">
                <div className="flex gap-4">
                  <span>✓ Dans le domaine des missions précisées ci-dessus seulement :</span>
                  <label><input type="radio" name="missionExclusive" value="oui" onChange={handleInputChange}/> oui</label>
                  <label><input type="radio" name="missionExclusive" value="non" onChange={handleInputChange}/> non</label>
                </div>
                <div className="flex gap-4">
                  <span>✓ Peut-elle s'étendre à d'autres activités :</span>
                  <label><input type="radio" name="sEtendreAutres" value="oui" onChange={handleInputChange}/> oui</label>
                  <label><input type="radio" name="sEtendreAutres" value="non" onChange={handleInputChange}/> non</label>
                </div>
                <p className="italic">(Dans l'affirmative décrire ces activités annexes).</p>
                <textarea name="activitesAnnexes" className="w-full border p-1 h-12" onChange={handleInputChange}></textarea>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 : PAGE 1 (BAS) & PAGE 2 */}
        {currentSection === 1 && (
          <div className="space-y-4">
            <h4 className="font-bold underline uppercase">2- RENSEIGNEMENTS SPECIFIQUES</h4>
            <p className="font-bold italic">QUESTIONS SUPPLEMENTAIRES RELATIVES A L'ACTIVITE</p>
            <p>• Veuillez décrire brièvement les matériels utilisés dans l'exploitation de l'entreprise :</p>
            <textarea name="materielsUtilises" className="w-full border p-1 h-16" onChange={handleInputChange}></textarea>
            
            <p>• Quelle est la nature des biens confiés par votre clientèle et se trouvant dans vos locaux :</p>
            <input name="natureBiensConfies" className="w-full border-b" onChange={handleInputChange}/>
            
            <p>• Quelles mesures sont-elles prises pour permettre sécuriser ces biens :</p>
            <input name="mesuresSecurite" className="w-full border-b" onChange={handleInputChange}/>
            
            <div className="flex gap-4 items-center mt-2">
              <p>• Etes-vous susceptible d'intervenir sur des chèques bancaires, cartes de crédit ou valeurs similaires?</p>
              <label><input type="radio" name="intervientValeurs" value="oui" onChange={handleInputChange}/> oui</label>
              <label><input type="radio" name="intervientValeurs" value="non" onChange={handleInputChange}/> non</label>
            </div>
            <p className="italic">Dans l'affirmative, dites-nous brièvement de quelle manière s'effectue votre intervention?</p>
            <textarea name="maniereIntervention" className="w-full border p-1 h-12" onChange={handleInputChange}></textarea>
          </div>
        )}

        {/* SECTION 3 : PAGE 2 (SUITE) */}
        {currentSection === 2 && (
          <div className="space-y-4">
            <p className="font-bold italic uppercase underline">QUESTIONS RELATIVES A L'ENSEMBLE DES ACTIVITES</p>
            <div className="flex gap-4">
              <p>• Faites-vous appel à des sous-traitants ?</p>
              <label><input type="radio" name="appelSousTraitance" value="oui" onChange={handleInputChange}/> oui</label>
              <label><input type="radio" name="appelSousTraitance" value="non" onChange={handleInputChange}/> non</label>
            </div>
            <div className="grid gap-2 ml-4">
              <div className="flex gap-2"><span>- pour quels types de travaux:</span><input name="typesTravauxSousTraites" className="border-b flex-1" onChange={handleInputChange}/></div>
              <div className="flex gap-2"><span>- Part de votre chiffre d'affaires sous-traité:</span><input name="partCASousTraite" className="border-b flex-1" onChange={handleInputChange}/></div>
              <div className="flex gap-4">
                <span>• Exigez-vous que vos sous-traitants soient assurés en Responsabilité Civile Professionnelle ?</span>
                <label><input type="radio" name="exigeAssuranceST" value="oui" onChange={handleInputChange}/> oui</label>
                <label><input type="radio" name="exigeAssuranceST" value="non" onChange={handleInputChange}/> non</label>
              </div>
            </div>

            <h4 className="font-bold underline uppercase mt-6 text-center">IMPORTANCE DE L'ACTIVITE</h4>
            <div className="border border-black p-3 space-y-2">
              <p>L'entreprise occupe-t-elle (1) :</p>
              <div className="flex justify-around font-bold">
                <label>2 personnes au plus : <input type="checkbox" name="occupeMoins2" onChange={handleInputChange}/></label>
                <label>de 3 à 5 personnes : <input type="checkbox" name="occupe3a5" onChange={handleInputChange}/></label>
                <label>plus de 5 personnes : <input type="checkbox" name="occupePlus5" onChange={handleInputChange}/></label>
              </div>
              <p className="text-[9px] italic">(1) Non compris les membres de la famille, associés et apprentis.</p>
            </div>
            <div className="grid gap-2 mt-4">
              <div className="flex gap-2"><span>- nombre de personnes occupées:</span><input name="nombrePersonnes" className="border-b flex-1" onChange={handleInputChange}/></div>
              <div className="flex gap-2"><span>- montant du chiffre d'affaires annuel hors taxes:</span><input name="caHT" className="border-b flex-1" onChange={handleInputChange}/></div>
              <div className="flex gap-2"><span>- montant de la masse salariale annuelle:</span><input name="masseSalariale" className="border-b flex-1" onChange={handleInputChange}/></div>
              <div className="mt-2">
                <p className="font-bold underline">Quels sont vos principaux clients :</p>
                <textarea name="principauxClients" className="w-full border p-1 h-12" onChange={handleInputChange}></textarea>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4 : PAGE 3 */}
        {currentSection === 3 && (
          <div className="space-y-4">
            <h4 className="font-bold underline uppercase text-center">ANTECEDENTS DU RISQUE</h4>
            <div className="space-y-3">
              <div className="flex gap-4">
                <p>• Le proposant est-il titulaire de polices d'Assurance Responsabilité Civile ?</p>
                <label><input type="radio" name="dejaAssureRC" value="oui" onChange={handleInputChange}/> OUI</label>
                <label><input type="radio" name="dejaAssureRC" value="non" onChange={handleInputChange}/> NON</label>
              </div>
              <div className="flex gap-2"><span>- Sous quel numéro ?</span><input name="numPolice" className="border-b flex-1" onChange={handleInputChange}/></div>
              <p>A quelle société d'assurances est-il ou a-t-il été assuré pour le risque proposé ?</p>
              <input name="societeAssurance" className="w-full border-b" onChange={handleInputChange}/>
              <p>Pour quel motif et à quelle date cette assurance doit-elle prendre ou a-t-elle pris fin ?</p>
              <input name="motifDateFin" className="w-full border-b" onChange={handleInputChange}/>
              
              <div className="flex gap-4">
                <p>• Des dommages sont-ils survenus au cours des 3 dernières années ?</p>
                <label><input type="radio" name="dommages3Ans" value="oui" onChange={handleInputChange}/> OUI</label>
                <label><input type="radio" name="dommages3Ans" value="non" onChange={handleInputChange}/> NON</label>
              </div>
              <div className="flex gap-4">
                <p>• Connaissance de faits susceptibles d'entraîner des réclamations ?</p>
                <label><input type="radio" name="faitsSusceptibles" value="oui" onChange={handleInputChange}/> OUI</label>
                <label><input type="radio" name="faitsSusceptibles" value="non" onChange={handleInputChange}/> NON</label>
              </div>

              <div className="bg-gray-100 p-3 border border-black text-[10px] leading-tight italic">
                Toute réticence ou déclaration intentionnellement fausse, toute omission ou déclaration inexacte par le proposant... entraîne l'application, suivant le cas, des sanctions prévues aux articles 18 et 19 du Code CIMA. 
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5 : SIGNATURE PAGE 3 */}
        {currentSection === 4 && (
          <div className="space-y-6">
            <p className="italic underline font-bold">Je soussigné certifie que les réponses faites à la présente proposition sont à ma connaissance exactes et propose qu'elles servent de base pour l'établissement du contrat que je désire souscrire. [cite: 97, 98, 99]</p>
            <div className="flex justify-center border-2 border-black bg-white">
              <canvas ref={canvasRef} width={500} height={200} className="touch-none cursor-crosshair" />
            </div>
            <div className="flex justify-between items-end font-bold uppercase mt-4">
              <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,500,200)} className="text-red-600 underline text-[10px]">Effacer Signature</button>
              <div className="text-right">
                <p>Fait à : <input name="lieuFait" className="border-b w-32" onChange={handleInputChange}/></p>
                <p className="mt-2">le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <p className="text-center font-bold mt-4">NOM ET SIGNATURE DU PROPOSANT [cite: 104]</p>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between mt-10 pt-4 border-t border-black">
          <button onClick={() => setCurrentSection(currentSection - 1)} disabled={currentSection === 0} className={`flex items-center gap-1 font-bold ${currentSection === 0 ? 'invisible' : ''}`}>
            <ChevronLeft size={14}/> PRÉCÉDENT
          </button>
          <div className="flex gap-2">
            {[0,1,2,3,4].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full ${currentSection === s ? 'bg-black' : 'bg-gray-300'}`}></div>
            ))}
          </div>
          {currentSection < 4 ? (
            <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-black text-white px-6 py-2 font-bold flex items-center gap-1">
              SUIVANT <ChevronRight size={14}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-8 py-3 font-bold uppercase border-2 border-black">
              {isSubmitting ? "ENVOI EN COURS..." : "VALIDER LA PROPOSITION"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}