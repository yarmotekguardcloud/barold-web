import React, { useState, useRef, useEffect } from 'react';
import { User, Briefcase, Shield, PenTool, ChevronRight, ChevronLeft, CheckCircle, Lock, Users, AlertTriangle, Building2, Download } from 'lucide-react';
import { jsPDF } from "jspdf";
import emailjs from '@emailjs/browser';

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

  // --- FONCTION DE TÉLÉCHARGEMENT PDF ---
  const handleDownload = () => {
    const doc = new jsPDF();
    const margin = 20;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("BAROLD ASSURANCES", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text("ASSURANCE DE LA RESPONSABILITE CIVILE DES PRESTATAIRES DE SERVICES", 105, 28, { align: "center" });
    doc.text("QUESTIONNAIRE - PROPOSITION", 105, 34, { align: "center" });
    doc.line(margin, 40, 190, 40);

    doc.setFontSize(11);
    doc.text("1. RENSEIGNEMENTS GENERAUX", margin, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`NOM du PROPOSANT : ${formData.nomProposant || 'N/A'}`, margin, 60);
    doc.text(`Adresse : ${formData.adresse || 'N/A'}`, margin, 68);
    doc.text(`Activité : ${formData.commentDefinissezVousActivite || 'N/A'}`, margin, 76);

    if (canvasRef.current) {
      try {
        const signatureData = canvasRef.current.toDataURL("image/png");
        doc.setFont("helvetica", "bold");
        doc.text("SIGNATURE DU PROPOSANT :", margin, 100);
        doc.addImage(signatureData, 'PNG', margin, 105, 60, 25);
      } catch (err) {
        console.error("Erreur signature PDF:", err);
      }
    }
    doc.save(`Proposition_Barold_${formData.nomProposant || 'Client'}.pdf`);
  };

  // --- FONCTION D'ENVOI EMAILJS (CORRIGÉE) ---
  const handleSubmit = async () => {
    if (!formData.nomProposant) {
      alert("Veuillez entrer le nom du proposant avant d'envoyer.");
      return;
    }

    setIsSubmitting(true);
    const signatureBase64 = canvasRef.current ? canvasRef.current.toDataURL("image/png") : "";

    const templateParams = {
      nomProposant: formData.nomProposant,
      adresse: formData.adresse,
      commentDefinissezVousActivite: formData.commentDefinissezVousActivite,
      signature: signatureBase64 
    };

    try {
      const response = await emailjs.send(
        'service_3nzz4gj', 
        'template_2pnk0gg', // ID Corrigé
        templateParams,
        'diETOYFuHDO5ykoIM' // Public Key
      );

      if (response.status === 200) {
        setIsDone(true);
      }
    } catch (error) {
      console.error("Erreur d'envoi EmailJS:", error);
      alert("L'envoi a échoué. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
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
        
        {/* --- EN-TÊTE RESTAURÉ --- */}
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
                </div>
              </div>
            </div>
          )}

          {currentSection === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">2- RENSEIGNEMENTS SPECIFIQUES</h2>
              <div className="space-y-4 text-xs font-bold italic">
                <p>• Veuillez décrire brièvement les matériels utilisés :</p>
                <textarea name="descriptionMaterielsUtilises" className="w-full border p-2 h-16 mt-1 outline-none font-normal" onChange={handleInputChange}></textarea>
                <div>
                  <p>• Nature des biens confiés par votre clientèle :</p>
                  <input name="natureBiensConfies" className="w-full border-b outline-none mt-1 font-normal" onChange={handleInputChange}/>
                </div>
              </div>
            </div>
          )}

          {currentSection === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">IMPORTANCE DE L'ACTIVITE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs font-bold italic">
                 <div className="flex gap-2"><span>Nombre total personnes :</span><input name="nombrePersonnesOccupees" className="border-b w-20 outline-none font-normal" onChange={handleInputChange}/></div>
                 <div className="flex gap-2"><span>CA annuel HT :</span><input name="montantChiffreAffairesAnnuelHT" className="border-b flex-1 outline-none font-normal" onChange={handleInputChange}/></div>
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-sm font-black uppercase underline">ANTECEDENTS DU RISQUE</h2>
              <div className="bg-red-50 p-4 rounded border border-red-200 text-xs italic">
                <p className="font-black text-red-800 uppercase text-[10px] mb-2">Avertissement Légal :</p>
                Toute réticence ou déclaration intentionnellement fausse entraîne l'application des sanctions prévues aux articles 18 et 19 du Code CIMA.
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="space-y-6 animate-in fade-in text-center">
              <p className="text-xs font-bold text-left italic">Je soussigné certifie que les réponses faites à la présente proposition sont exactes.</p>
              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase underline mb-2">CADRE DE SIGNATURE (Souris ou doigt)</p>
                <div className="border-2 border-slate-300 bg-white inline-block shadow-inner">
                   <canvas ref={canvasRef} width={500} height={200} className="touch-none cursor-crosshair" />
                </div>
                <div className="mt-2 flex justify-center gap-6 text-[10px] font-bold">
                   <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,500,200)} className="text-red-600 uppercase underline">Effacer</button>
                   <span className="text-slate-500">Ouagadougou, le {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

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
              <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-blue-900 text-white px-6 py-2 text-xs font-bold uppercase flex items-center gap-2">
                SUIVANT <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={handleDownload} className="bg-slate-800 text-white px-4 py-3 text-xs font-bold uppercase flex items-center gap-2 shadow-lg hover:bg-black">
                  <Download size={16} /> PDF
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-600 text-white px-8 py-3 text-sm font-black uppercase tracking-widest shadow-lg hover:bg-orange-700 disabled:opacity-50">
                  {isSubmitting ? "ENVOI..." : "SIGNER ET ENVOYER"}
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