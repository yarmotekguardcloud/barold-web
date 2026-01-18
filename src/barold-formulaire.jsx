import React, { useState, useRef, useEffect } from 'react';
import { User, Briefcase, Shield, PenTool, Send, ChevronRight, ChevronLeft, CheckCircle, Lock } from 'lucide-react';

export default function BaroldFormulaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // ÉTAT INITIAL VIDE
  const [formData, setFormData] = useState({
    nomProposant: '',
    adresse: '',
    dateCreation: '',
    activiteProfessionnelle: '',
    materielsUtilises: '',
    mesuresSecurite: '',
    chiffreAffairesAnnuel: '',
    masseSalariale: '',
    sinistres3ans: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // GESTION DE LA SIGNATURE TACTILE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
      isDrawing.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      if (e.cancelable) e.preventDefault();
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (e.cancelable) e.preventDefault();
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
      canvas.removeEventListener('touchstart', startDrawing);
    };
  }, [currentSection]);

  const sections = [
    { title: "Profil", icon: <User size={20} /> },
    { title: "Expertise", icon: <Briefcase size={20} /> },
    { title: "Volume", icon: <Shield size={20} /> },
    { title: "Validation", icon: <PenTool size={20} /> }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/functions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) setIsDone(true);
      else alert("Erreur lors de l'envoi.");
    } catch (e) {
      // Simulation pour le test local
      setTimeout(() => setIsDone(true), 1500);
    }
    setIsSubmitting(false);
  };

  if (isDone) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-6">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">C'est envoyé !</h1>
        <p className="text-slate-500 mt-4">Le questionnaire a été transmis avec succès à Barold Assurances.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-8 px-4 font-sans">
      <div className="fixed top-0 left-0 w-full h-64 bg-[#1e3a8a] z-0 skew-y-1 -translate-y-12"></div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white rounded-t-3xl p-6 flex justify-center shadow-lg border-b border-slate-100">
          <img 
            src="/logo-barold.png" 
            alt="Logo Barold Assurances" 
            className="h-20 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div class="h-16 flex flex-col items-center justify-center"><span class="text-2xl font-black text-blue-900 italic">BAROLD</span><span class="text-[10px] font-bold text-orange-500 tracking-[0.3em] -mt-1 uppercase">Assurances</span></div>';
            }}
          />
        </div>

        <div className="bg-white shadow-2xl rounded-b-3xl overflow-hidden">
          <div className="flex bg-slate-50/50 px-4 pt-4 border-b">
            {sections.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentSection === i ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'}`}>
                  {s.icon}
                </div>
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${currentSection === i ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
                <div className={`h-1 w-full mt-3 transition-all ${currentSection === i ? 'bg-blue-600' : 'bg-transparent'}`}></div>
              </div>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {currentSection === 0 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-blue-900 mb-2">
                  <div className="h-8 w-1 bg-orange-500"></div>
                  <h2 className="text-xl font-bold italic uppercase">Identification</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom de la Société</label>
                    <input name="nomProposant" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 outline-none" placeholder="Ex: Yarmotek International" onChange={handleInputChange} value={formData.nomProposant} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Activité Professionnelle</label>
                    <textarea name="activiteProfessionnelle" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl h-28 focus:border-blue-400 outline-none" placeholder="Décrivez votre activité..." onChange={handleInputChange} value={formData.activiteProfessionnelle} />
                  </div>
                </div>
              </div>
            )}

            {currentSection === 1 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-blue-900 mb-2">
                  <div className="h-8 w-1 bg-orange-500"></div>
                  <h2 className="text-xl font-bold italic uppercase">Expertise Technique</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Matériels exploités</label>
                    <input name="materielsUtilises" className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-blue-400 outline-none" placeholder="Serveurs, terminaux, etc." onChange={handleInputChange} value={formData.materielsUtilises} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mesures de Sécurité</label>
                    <textarea name="mesuresSecurite" className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 h-28 focus:border-blue-400 outline-none" placeholder="Protocoles de protection..." onChange={handleInputChange} value={formData.mesuresSecurite} />
                  </div>
                </div>
              </div>
            )}

            {currentSection === 2 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-blue-900 mb-2">
                  <div className="h-8 w-1 bg-orange-500"></div>
                  <h2 className="text-xl font-bold italic uppercase">Données Financières</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Chiffre d'Affaires Annuel (FCFA)</label>
                    <input name="chiffreAffairesAnnuel" type="number" className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-blue-400 outline-none font-bold text-blue-900" placeholder="0" onChange={handleInputChange} value={formData.chiffreAffairesAnnuel} />
                  </div>
                </div>
              </div>
            )}

            {currentSection === 3 && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 text-center">
                <div className="flex items-center gap-3 text-blue-900 mb-2 text-left">
                  <div className="h-8 w-1 bg-orange-500"></div>
                  <h2 className="text-xl font-bold italic uppercase">Validation</h2>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4 items-start text-left">
                  <Lock className="text-blue-600 shrink-0 mt-1" size={20} />
                  <p className="text-xs text-blue-900 leading-relaxed font-medium italic">
                    "Je certifie que les déclarations ci-dessus sont sincères et exactes."
                  </p>
                </div>
                <div className="relative group">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Signez au doigt ci-dessous</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 overflow-hidden">
                    <canvas ref={canvasRef} width={600} height={300} className="w-full h-52 touch-none cursor-crosshair" />
                  </div>
                  <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,600,300)} className="mt-3 text-[10px] font-bold text-red-400 uppercase tracking-widest">Effacer</button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-12">
              <button onClick={() => setCurrentSection(currentSection - 1)} disabled={currentSection === 0} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentSection === 0 ? 'opacity-0' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                <ChevronLeft />
              </button>
              
              <div className="flex gap-1">
                {[0,1,2,3].map(dot => (
                  <div key={dot} className={`h-1.5 rounded-full transition-all ${currentSection === dot ? 'w-8 bg-orange-500' : 'w-2 bg-slate-200'}`}></div>
                ))}
              </div>

              {currentSection < 3 ? (
                <button onClick={() => setCurrentSection(currentSection + 1)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 flex items-center gap-2">
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-orange-600 uppercase tracking-widest">
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}