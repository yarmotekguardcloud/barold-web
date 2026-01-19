import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { ChevronRight, ChevronLeft, CheckCircle, Building2, Briefcase, Users, Shield, PenTool } from 'lucide-react';

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // État contenant TOUS les champs du formulaire PDF original (Pages 1, 2 et 3)
  const [formData, setFormData] = useState({
    // PAGE 1
    nomProposant: '', adresse: '', dateCreation: '',
    commentDefinissezVousActivite: '', domaineExclusif: 'Non', sEtendreAutres: 'Non',
    descriptionAutres: '',
    // PAGE 2
    materielsUtilises: '', natureBiensConfies: '', mesuresSecurite: '',
    intervientValeurs: 'Non', commentIntervientValeurs: '',
    appelSousTraitants: 'Non', typesTravauxSousTraites: '', partCASousTraite: '', exigeAssuranceSousTraitant: 'Non',
    nombreEmployes: '', caAnnuel: '', masseSalariale: '',
    principauxClients: '',
    // PAGE 3
    dejaAssure: 'Non', numPolice: '', societePrecedente: '', motifFin: '',
    dommages3Ans: 'Non', faitsSusceptibles: 'Non'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nomProposant) return alert("Veuillez entrer le nom du proposant.");
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
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logique de signature
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

  if (isDone) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
      <div className="max-w-md">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold italic underline uppercase">Proposition Transmise</h1>
        <p className="mt-4 text-slate-600 font-serif">Le document a été envoyé avec succès à Barold Assurances.</p>
        <button onClick={() => window.location.reload()} className="mt-8 text-blue-600 font-bold underline">Remplir une autre proposition</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-serif">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl border border-slate-300">
        [cite_start]{/* EN-TÊTE FIDÈLE AU PDF [cite: 3, 5] */}
        <div className="p-8 border-b-4 border-slate-900 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Barold Assurances</h1>
          <h2 className="text-[12px] font-bold mt-2 uppercase">Assurance de la Responsabilité Civile des Prestataires de Services</h2>
          <h3 className="text-lg font-black mt-1 italic underline">QUESTIONNAIRE - PROPOSITION</h3>
        </div>

        <div className="p-8">
          {currentSection === 0 && (
            <div className="space-y-6">
              <h3 className="font-black underline uppercase text-sm flex items-center gap-2"><Building2 size={18}/> 1. Renseignements Généraux</h3>
              <div className="grid gap-4 text-xs font-bold italic">
                <input name="nomProposant" placeholder="NOM DU PROPOSANT" className="border-b p-2 outline-none w-full" onChange={handleInputChange} />
                <input name="adresse" placeholder="ADRESSE" className="border-b p-2 outline-none w-full" onChange={handleInputChange} />
                <input name="dateCreation" type="date" placeholder="DATE DE CRÉATION" className="border-b p-2 outline-none w-full" onChange={handleInputChange} />
                <p className="uppercase mt-2 underline italic">Missions effectuées :</p>
                <textarea name="commentDefinissezVousActivite" placeholder="Définition de l'activité professionnelle..." className="w-full border p-2 h-24 font-normal not-italic" onChange={handleInputChange}></textarea>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6">
              <h3 className="font-black underline uppercase text-sm flex items-center gap-2"><Briefcase size={18}/> 2. Renseignements Spécifiques</h3>
              <div className="grid gap-4 text-xs font-bold italic">
                <p>Description des matériels utilisés :</p>
                <textarea name="materielsUtilises" className="w-full border p-2 h-20 font-normal not-italic" onChange={handleInputChange}></textarea>
                <p>Nature des biens confiés par la clientèle :</p>
                <input name="natureBiensConfies" className="border-b p-2 outline-none w-full font-normal not-italic" onChange={handleInputChange} />
                <p>Mesures de sécurité prises pour les biens :</p>
                <input name="mesuresSecurite" className="border-b p-2 outline-none w-full font-normal not-italic" onChange={handleInputChange} />
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6">
              <h3 className="font-black underline uppercase text-sm flex items-center gap-2"><Users size={18}/> 3. Importance de l'activité</h3>
              <div className="grid gap-4 text-xs font-bold italic">
                <div className="flex gap-4">
                  <input name="nombreEmployes" placeholder="NOMBRE DE PERSONNES OCCUPÉES" className="border-b p-2 flex-1" onChange={handleInputChange} />
                  <input name="caAnnuel" placeholder="CHIFFRE D'AFFAIRES ANNUEL HT" className="border-b p-2 flex-1" onChange={handleInputChange} />
                </div>
                <input name="masseSalariale" placeholder="MONTANT DE LA MASSE SALARIALE ANNUELLE" className="border-b p-2" onChange={handleInputChange} />
                <p className="mt-4 font-bold italic">Principaux clients :</p>
                <textarea name="principauxClients" className="w-full border p-2 h-20 font-normal" onChange={handleInputChange}></textarea>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6">
              <h3 className="font-black underline uppercase text-sm flex items-center gap-2"><Shield size={18}/> 4. Antécédents du risque</h3>
              <div className="text-xs font-bold italic space-y-4">
                <div className="bg-red-50 p-4 border border-red-200">
                  [cite_start]<p className="text-red-800 uppercase font-black mb-2">Avertissement Code CIMA[cite: 96]:</p>
                  <p className="font-normal not-italic leading-relaxed">Toute réticence ou déclaration intentionnellement fausse entraîne les sanctions des articles 18 et 19 du Code CIMA.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span>Déjà titulaire de polices RC ?</span>
                  <select name="dejaAssure" className="border p-1" onChange={handleInputChange}>
                    <option value="Non">NON</option>
                    <option value="Oui">OUI</option>
                  </select>
                </div>
                <input name="numPolice" placeholder="Si oui, sous quel numéro ?" className="border-b p-2 w-full" onChange={handleInputChange} />
                <div className="flex items-center gap-4">
                  <span>Dommages au cours des 3 dernières années ?</span>
                  <select name="dommages3Ans" className="border p-1" onChange={handleInputChange}>
                    <option value="Non">NON</option>
                    <option value="Oui">OUI</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6 text-center">
              <h3 className="font-black underline uppercase text-sm flex items-center justify-center gap-2"><PenTool size={18}/> Validation & Signature</h3>
              [cite_start]<p className="text-xs italic font-bold">Je soussigné certifie que les réponses faites sont exactes[cite: 97, 98].</p>
              <div className="border-2 border-slate-300 inline-block bg-white shadow-inner mt-4">
                <canvas ref={canvasRef} width={500} height={200} className="touch-none cursor-crosshair" />
              </div>
              <div className="flex justify-center gap-8 mt-4 text-[10px] font-bold">
                <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,500,200)} className="text-red-600 underline uppercase">Effacer</button>
                [cite_start]<span>Ouagadougou, le {new Date().toLocaleDateString('fr-FR')} [cite: 100, 102]</span>
              </div>
            </div>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between mt-12 pt-6 border-t-2 border-slate-800">
            <button onClick={() => setCurrentSection(currentSection - 1)} disabled={currentSection === 0} className={`flex items-center gap-2 text-xs font-black ${currentSection === 0 ? 'invisible' : 'hover:underline'}`}>
              <ChevronLeft size={16}/> PRÉCÉDENT
            </button>
            {currentSection < 4 ? (
              <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-slate-900 text-white px-8 py-3 text-xs font-black uppercase flex items-center gap-2">
                SUIVANT <ChevronRight size={16}/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-10 py-4 text-sm font-black uppercase tracking-widest shadow-xl hover:bg-orange-700 disabled:opacity-50 transition-all">
                {isSubmitting ? "ENVOI EN COURS..." : "SIGNER ET ENVOYER"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}