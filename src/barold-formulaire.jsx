import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // État contenant TOUS les champs du formulaire PDF original
  const [formData, setFormData] = useState({
    nomProposant: '', adresse: '', dateCreation: '',
    commentDefinissezVousActivite: '',
    descriptionMaterielsUtilises: '', natureBiensConfies: '',
    mesuresSecuriserBiens: '', intervientValeursSimilaires: 'Non',
    nombrePersonnesOccupees: '', montantChiffreAffairesAnnuelHT: '',
    montantMasseSalarialeAnnuelle: '',
    titulairePolicesRC: 'Non', sousQuelNumero: '',
    dommagesReclamations3Ans: 'Non'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nomProposant) {
      alert("Veuillez entrer le nom du proposant.");
      return;
    }

    setIsSubmitting(true);
    const signatureBase64 = canvasRef.current ? canvasRef.current.toDataURL("image/png") : "";

    // Mapping fidèle vers le template EmailJS
    const templateParams = {
      nomProposant: formData.nomProposant,
      adresse: formData.adresse,
      dateCreation: formData.dateCreation,
      activite: formData.commentDefinissezVousActivite,
      materiels: formData.descriptionMaterielsUtilises,
      biensConfies: formData.natureBiensConfies,
      mesuresSecurite: formData.mesuresSecuriserBiens,
      intervientValeurs: formData.intervientValeursSimilaires,
      nombreEmployes: formData.nombrePersonnesOccupees,
      ca: formData.montantChiffreAffairesAnnuelHT,
      masseSalariale: formData.montantMasseSalarialeAnnuelle,
      dejaAssure: formData.titulairePolicesRC,
      numPolice: formData.sousQuelNumero,
      dommages3ans: formData.dommagesReclamations3Ans,
      signature: signatureBase64,
      dateJour: new Date().toLocaleDateString('fr-FR')
    };

    try {
      await emailjs.send(
        'service_3nzz4gj', // Votre Service ID
        'template_2pnk0gg', // Votre Template ID
        templateParams,
        'diETOYFuHDO5ykoIM' // Votre Public Key
      );
      setIsDone(true);
    } catch (error) {
      alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logique du Canvas (Signature)
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

  if (isDone) return <div className="p-20 text-center"><h1>Envoi réussi !</h1></div>;

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-xl font-serif border border-slate-300">
      {/* Rendu des sections (0 à 4) ici... */}
      {/* Bouton final d'envoi */}
      {currentSection === 4 && (
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-orange-600 text-white px-10 py-4 font-bold uppercase mt-10"
        >
          {isSubmitting ? "Envoi en cours..." : "Signer et Envoyer la Proposition"}
        </button>
      )}
    </div>
  );
}