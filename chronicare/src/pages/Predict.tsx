import React, { useState } from 'react';
import { ArrowLeft, Activity, HeartPulse, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Predict: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    probability: number;
    risk_score: number;
    prediction: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    age: 60,
    anaemia: 0,
    creatinine_phosphokinase: 250,
    diabetes: 0,
    ejection_fraction: 38,
    high_blood_pressure: 0,
    platelets: 263358,
    serum_creatinine: 1.1,
    serum_sodium: 137,
    sex: 1,
    smoking: 0,
    time: 130
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error predicting:", error);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-950 text-gray-100 font-manrope selection:bg-blue-500/30 animate-page-transition">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      {/* Header */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-gray-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold font-instrument tracking-wide text-white">PRANA AI Predictor</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        
        {/* Left Column - Input Form */}
        <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 lg:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
            <HeartPulse className="text-blue-500" size={28} />
            <h2 className="text-2xl font-bold">Patient Clinical Data</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Input Fields */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Age (Years)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value={1}>Male</option>
                <option value={0}>Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Anaemia</label>
              <select name="anaemia" value={formData.anaemia} onChange={handleChange} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Diabetes</label>
              <select name="diabetes" value={formData.diabetes} onChange={handleChange} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">High Blood Pressure</label>
              <select name="high_blood_pressure" value={formData.high_blood_pressure} onChange={handleChange} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Smoking Status</label>
              <select name="smoking" value={formData.smoking} onChange={handleChange} 
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value={0}>Non-Smoker (0)</option>
                <option value={1}>Smoker (1)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Creatinine Phosphokinase (mcg/L)</label>
              <input type="number" name="creatinine_phosphokinase" value={formData.creatinine_phosphokinase} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Ejection Fraction (%)</label>
              <input type="number" name="ejection_fraction" value={formData.ejection_fraction} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Platelets (kiloplatelets/mL)</label>
              <input type="number" name="platelets" value={formData.platelets} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Serum Creatinine (mg/dL)</label>
              <input type="number" step="0.1" name="serum_creatinine" value={formData.serum_creatinine} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Serum Sodium (mEq/L)</label>
              <input type="number" name="serum_sodium" value={formData.serum_sodium} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Follow-up Time (Days)</label>
              <input type="number" name="time" value={formData.time} onChange={handleChange} required 
                     className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>

            <div className="md:col-span-2 pt-6">
              <button type="submit" disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Risk...
                  </span>
                ) : (
                  <>
                    Run Prediction Analysis <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Results Display */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold mb-6 pb-4 border-b border-gray-800">Prediction Results</h3>
            
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>Fill out the clinical data form and run the analysis to generate a risk score.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
                <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center gap-2
                  ${result.prediction === 'SURVIVE' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  
                  {result.prediction === 'SURVIVE' ? (
                    <CheckCircle2 size={48} className="text-emerald-500 mb-2" />
                  ) : (
                    <AlertTriangle size={48} className="text-red-500 mb-2" />
                  )}
                  
                  <div className="text-4xl font-black tracking-tight" 
                       style={{ color: result.prediction === 'SURVIVE' ? '#10b981' : '#ef4444' }}>
                    {result.risk_score}%
                  </div>
                  <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                    Mortality Risk Score
                  </div>
                </div>

                <div className="bg-gray-950 rounded-xl p-5 border border-gray-800">
                  <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Clinical Assessment</h4>
                  <p className="text-gray-200 leading-relaxed text-sm">
                    {result.prediction === 'SURVIVE' 
                      ? "The AI model predicts a low probability of a critical event. Patient is currently stable, but continue standard monitoring protocols."
                      : "The AI model predicts a HIGH probability of deterioration or mortality. Immediate clinical intervention and intensive care monitoring are strongly recommended."}
                  </p>
                </div>

                <div className="mt-auto">
                  <p className="text-xs text-gray-500 text-center">
                    Powered by ChroniCare Random Forest Classifier Model. Note: This tool provides AI-assisted risk stratification and does not replace professional clinical judgment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Predict;
