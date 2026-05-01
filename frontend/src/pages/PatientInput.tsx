import React, { useState } from 'react';
import { Heart, Activity, FlaskConical, Droplets, Wind, User, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Prediction } from '../services/api';

interface VitalsForm {
  age: number;
  sex: number;
  anaemia: number;
  diabetes: number;
  high_blood_pressure: number;
  smoking: number;
  creatinine_phosphokinase: number;
  ejection_fraction: number;
  platelets: number;
  serum_creatinine: number;
  serum_sodium: number;
  time: number;
}

const initialForm: VitalsForm = {
  age: 45,
  sex: 1,
  anaemia: 0,
  diabetes: 0,
  high_blood_pressure: 0,
  smoking: 0,
  creatinine_phosphokinase: 100,
  ejection_fraction: 50,
  platelets: 250000,
  serum_creatinine: 1.0,
  serum_sodium: 137,
  time: 10,
};

const PatientInput: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<VitalsForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState('');

  const handleChange = (field: keyof VitalsForm, value: number) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.submitHeartFailureVitals(form);
      const predictions = await api.getPredictionHistory(1);
      if (predictions.length > 0) {
        setResult(predictions[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vitals');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-teal-400';
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-heading font-bold text-xl">PRANA</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user?.email}</span>
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-white text-sm cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Patient Vitals Input</h1>
        <p className="text-slate-400 mb-8">Enter clinical parameters to predict heart failure risk</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Demographics */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-500" />
              Demographics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                  min={0}
                  max={120}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Sex</label>
                <select
                  value={form.sex}
                  onChange={(e) => handleChange('sex', parseInt(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                >
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Follow-up Time (days)</label>
                <input
                  type="number"
                  value={form.time}
                  onChange={(e) => handleChange('time', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Medical Conditions */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Medical Conditions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'anaemia', label: 'Anaemia', desc: 'Low red blood cells' },
                { key: 'diabetes', label: 'Diabetes', desc: 'Blood sugar disorder' },
                { key: 'high_blood_pressure', label: 'High BP', desc: 'Hypertension' },
                { key: 'smoking', label: 'Smoking', desc: 'Tobacco use' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleChange(item.key as keyof VitalsForm, form[item.key as keyof VitalsForm] === 0 ? 1 : 0)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    form[item.key as keyof VitalsForm] === 1
                      ? 'bg-teal-500/20 border-teal-500'
                      : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-slate-500 text-xs mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Clinical Measurements */}
          <section className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-500" />
              Clinical Measurements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Creatinine Phosphokinase (U/L)</label>
                <input
                  type="number"
                  value={form.creatinine_phosphokinase}
                  onChange={(e) => handleChange('creatinine_phosphokinase', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Ejection Fraction (%)</label>
                <input
                  type="number"
                  value={form.ejection_fraction}
                  onChange={(e) => handleChange('ejection_fraction', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Platelets (kiloplatelets/mL)</label>
                <input
                  type="number"
                  value={form.platelets}
                  onChange={(e) => handleChange('platelets', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.serum_creatinine}
                  onChange={(e) => handleChange('serum_creatinine', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Serum Sodium (mEq/L)</label>
                <input
                  type="number"
                  value={form.serum_sodium}
                  onChange={(e) => handleChange('serum_sodium', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 disabled:cursor-not-allowed text-white font-heading font-semibold text-lg py-4 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Analyze Patient
              </>
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <section className="mt-8 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-heading font-semibold text-white mb-4">Prediction Result</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl font-heading font-bold">
                <span className={getRiskColor(result.risk_level)}>{Math.round(result.risk_score * 100)}</span>
                <span className="text-slate-500 text-2xl">%</span>
              </div>
              <div>
                <div className={`text-lg font-semibold ${getRiskColor(result.risk_level)}`}>
                  {result.risk_level.toUpperCase()} RISK
                </div>
                <div className="text-slate-400 text-sm">Heart Failure Probability</div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <h3 className="text-sm font-heading font-semibold text-slate-400 mb-3">Risk Factors (SHAP Explanation)</h3>
              <ul className="space-y-2">
                {result.explanation.map((exp, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PatientInput;