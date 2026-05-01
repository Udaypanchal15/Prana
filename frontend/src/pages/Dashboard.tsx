import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, AlertTriangle, Phone, MessageSquare, CheckCircle2, User, Activity, BellRing, X, ArrowUpRight, ArrowDownRight, ArrowLeft, Heart, Droplets, FlaskConical, Wind, AlertCircle, Plus, LogOut, Brain } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Prediction } from '../services/api';

// --- Types & Constants ---
type VitalStatus = 'NORMAL' | 'WARNING' | 'DANGER';

interface Vital {
  id: string;
  name: string;
  unit: string;
  value: number;
  history: number[];
  status: VitalStatus;
  min: number;
  max: number;
  icon: React.ReactNode;
}

const INITIAL_VITALS: Record<string, Vital> = {
  hr: { 
    id: 'hr', 
    name: 'Heart Rate', 
    unit: 'bpm', 
    value: 72, 
    history: Array(10).fill(72), 
    status: 'NORMAL', 
    min: 40, 
    max: 150,
    icon: <Heart className="w-5 h-5" />
  },
  ef: { 
    id: 'ef', 
    name: 'Ejection Fraction', 
    unit: '%', 
    value: 62, 
    history: Array(10).fill(62), 
    status: 'NORMAL', 
    min: 10, 
    max: 80,
    icon: <Activity className="w-5 h-5" />
  },
  creatinine: { 
    id: 'creatinine', 
    name: 'Serum Creatinine', 
    unit: 'mg/dL', 
    value: 0.9, 
    history: Array(10).fill(0.9), 
    status: 'NORMAL', 
    min: 0, 
    max: 4,
    icon: <FlaskConical className="w-5 h-5" />
  },
  sodium: { 
    id: 'sodium', 
    name: 'Serum Sodium', 
    unit: 'mEq/L', 
    value: 140, 
    history: Array(10).fill(140), 
    status: 'NORMAL', 
    min: 110, 
    max: 160,
    icon: <Droplets className="w-5 h-5" />
  },
  bp: { 
    id: 'bp', 
    name: 'Blood Pressure', 
    unit: 'mmHg', 
    value: 110, 
    history: Array(10).fill(110), 
    status: 'NORMAL', 
    min: 60, 
    max: 200,
    icon: <Wind className="w-5 h-5" />
  },
  glucose: { 
    id: 'glucose', 
    name: 'Blood Glucose', 
    unit: 'mg/dL', 
    value: 95, 
    history: Array(10).fill(95), 
    status: 'NORMAL', 
    min: 40, 
    max: 300,
    icon: <FlaskConical className="w-5 h-5" />
  },
};

const SCENARIOS = {
  healthy: { hr: 72, ef: 62, creatinine: 0.9, sodium: 140, bp: 110, glucose: 95 },
  warning: { hr: 108, ef: 42, creatinine: 1.4, sodium: 133, bp: 145, glucose: 160 },
  critical: { hr: 138, ef: 22, creatinine: 2.8, sodium: 128, bp: 175, glucose: 210 },
};

// --- Components ---

const AnimatedNumber = ({ value, isDecimal = false }: { value: number, isDecimal?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const duration = 400;
    const steps = 20;
    const stepTime = duration / steps;
    const diff = value - displayValue;
    
    if (diff === 0) return;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setDisplayValue(prev => {
        const next = prev + (diff * progress);
        return currentStep === steps ? value : next;
      });
      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{isDecimal ? displayValue.toFixed(1) : Math.round(displayValue)}</span>;
};

const Sparkline = ({ data, min, max, color }: { data: number[], min: number, max: number, color: string }) => {
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const normalizedVal = Math.max(min, Math.min(max, val));
    const y = height - ((normalizedVal - min) / (max - min) * height);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [scenario, setScenario] = useState<'healthy' | 'warning' | 'critical' | 'deteriorating'>('healthy');
  const [mlPrediction, setMlPrediction] = useState<Prediction | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  
  const [dangerMode, setDangerMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<'sending' | 'notified'>('sending');
  const [toasts, setToasts] = useState<{ id: number, message: string, icon: React.ReactNode }[]>([]);
  
  const deterioratingInterval = useRef<NodeJS.Timeout | null>(null);
  const isTransitioning = useRef(false);
  
  // Calculate risk score
  const getRiskScore = () => {
    if (vitals.hr.value >= 130 || vitals.ef.value <= 25) return 89;
    if (vitals.hr.value >= 100 || vitals.ef.value <= 45) return 48;
    return 12;
  };
  const riskScore = getRiskScore();
  const riskColor = riskScore > 60 ? '#ef4444' : riskScore > 30 ? '#eab308' : '#22c55e';

  // Call ML backend
  const fetchMlPrediction = async () => {
    setIsLoadingPrediction(true);
    try {
      const hfVitals = {
        age: 45,
        sex: 1,
        anaemia: vitals.creatinine.value > 1.5 ? 1 : 0,
        diabetes: 0,
        high_blood_pressure: vitals.bp.value > 140 ? 1 : 0,
        smoking: 0,
        creatinine_phosphokinase: Math.round(vitals.glucose.value * 5),
        ejection_fraction: vitals.ef.value,
        platelets: 250000,
        serum_creatinine: vitals.creatinine.value,
        serum_sodium: vitals.sodium.value,
        time: Math.round(vitals.sodium.value / 10),
      };
      await api.submitHeartFailureVitals(hfVitals);
      const predictions = await api.getPredictionHistory(1);
      if (predictions.length > 0) {
        setMlPrediction(predictions[0]);
      }
    } catch (err) {
      console.error('ML prediction error:', err);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  // Determine status
  const getStatus = (id: string, val: number): VitalStatus => {
    if (id === 'hr') return val > 120 ? 'DANGER' : val > 100 ? 'WARNING' : 'NORMAL';
    if (id === 'ef') return val < 30 ? 'DANGER' : val < 50 ? 'WARNING' : 'NORMAL';
    if (id === 'creatinine') return val > 2.0 ? 'DANGER' : val > 1.2 ? 'WARNING' : 'NORMAL';
    if (id === 'sodium') return val < 130 ? 'DANGER' : val < 135 ? 'WARNING' : 'NORMAL';
    if (id === 'bp') return val > 160 ? 'DANGER' : val > 120 ? 'WARNING' : 'NORMAL';
    if (id === 'glucose') return val > 200 ? 'DANGER' : val > 140 ? 'WARNING' : 'NORMAL';
    return 'NORMAL';
  };

  const updateVitals = (targetValues: Record<string, number>) => {
    setVitals(prev => {
      const newVitals = { ...prev };
      Object.keys(targetValues).forEach(k => {
        const val = targetValues[k];
        const newHistory = [...prev[k].history.slice(1), val];
        newVitals[k] = { ...prev[k], value: val, history: newHistory, status: getStatus(k, val) };
      });
      return newVitals;
    });
  };

  const triggerDangerAlert = () => {
    if (dangerMode) return;
    setDangerMode(true);
    setModalOpen(true);
    setModalState('sending');
    
    // Add toasts
    setTimeout(() => {
      setToasts(prev => [...prev, { id: 1, message: "SMS sent to emergency contact", icon: <MessageSquare className="w-4 h-4" /> }]);
    }, 1000);
    setTimeout(() => {
      setToasts(prev => [...prev, { id: 2, message: "Call initiated to Dr. Ramesh Kumar", icon: <Phone className="w-4 h-4" /> }]);
    }, 2000);
    setTimeout(() => {
      setToasts(prev => [...prev, { id: 3, message: "Manipal Hospital alerted", icon: <Activity className="w-4 h-4" /> }]);
      setModalState('notified');
    }, 3000);
  };

  // Check critical status
  useEffect(() => {
    const isCritical = Object.values(vitals).some(v => v.status === 'DANGER');
    if (isCritical && !dangerMode) {
      triggerDangerAlert();
    } else if (!isCritical && dangerMode) {
      setDangerMode(false);
      setModalOpen(false);
    }
  }, [vitals]);

  // Clear toasts
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Handle scenarios
  const handleScenario = (type: 'healthy' | 'warning' | 'critical' | 'deteriorating') => {
    setScenario(type);
    if (deterioratingInterval.current) clearInterval(deterioratingInterval.current);
    
    if (type === 'healthy' || type === 'warning' || type === 'critical') {
      isTransitioning.current = true;
      const targetVitals = SCENARIOS[type];
      
      const startVals = {
        hr: vitals.hr.value,
        ef: vitals.ef.value,
        creatinine: vitals.creatinine.value,
        sodium: vitals.sodium.value,
        bp: vitals.bp.value,
        glucose: vitals.glucose.value,
      };

      const steps = 15;
      let currentStep = 0;
      
      deterioratingInterval.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        const currentVals = {
          hr: startVals.hr + (targetVitals.hr - startVals.hr) * progress,
          ef: startVals.ef + (targetVitals.ef - startVals.ef) * progress,
          creatinine: startVals.creatinine + (targetVitals.creatinine - startVals.creatinine) * progress,
          sodium: startVals.sodium + (targetVitals.sodium - startVals.sodium) * progress,
          bp: startVals.bp + (targetVitals.bp - startVals.bp) * progress,
          glucose: startVals.glucose + (targetVitals.glucose - startVals.glucose) * progress,
        };
        
        updateVitals(currentVals);
        
        if (currentStep >= steps) {
          isTransitioning.current = false;
          if (deterioratingInterval.current) clearInterval(deterioratingInterval.current);
        }
      }, 200);
    } else if (type === 'deteriorating') {
      isTransitioning.current = false;
      let currentVals = { ...SCENARIOS.warning };
      updateVitals(currentVals);
      
      deterioratingInterval.current = setInterval(() => {
        currentVals = {
          hr: Math.min(145, currentVals.hr + 5),
          ef: Math.max(15, currentVals.ef - 4),
          creatinine: Math.min(3.5, currentVals.creatinine + 0.3),
          sodium: Math.max(120, currentVals.sodium - 1.5),
          bp: Math.min(190, currentVals.bp + 6),
          glucose: Math.min(250, currentVals.glucose + 10),
        };
        updateVitals(currentVals);
      }, 3000);
    }
  };

  // Realistic jitter
  useEffect(() => {
    if (scenario === 'deteriorating') return;

    const jitterInterval = setInterval(() => {
      if (isTransitioning.current) return;
      
      setVitals(prev => {
        const newVitals = { ...prev };
        
        const jitterConfig: Record<string, number> = {
          hr: 2, ef: 1, creatinine: 0.05, sodium: 1, bp: 3, glucose: 2,
        };

        Object.keys(newVitals).forEach(k => {
          const config = jitterConfig[k];
          const delta = (Math.random() * 2 * config) - config;
          
          const baseValue = SCENARIOS[scenario as keyof typeof SCENARIOS][k as keyof typeof SCENARIOS.healthy];
          let newVal = prev[k].value + delta;
          
          const maxDrift = config * 3;
          if (newVal > baseValue + maxDrift) newVal = baseValue + maxDrift;
          if (newVal < baseValue - maxDrift) newVal = baseValue - maxDrift;
          newVal = Math.max(prev[k].min, Math.min(prev[k].max, newVal));
          if (k !== 'creatinine') newVal = Math.round(newVal);
          else newVal = Number(newVal.toFixed(2));

          const newHistory = [...prev[k].history.slice(1), newVal];
          newVitals[k] = { ...prev[k], value: newVal, history: newHistory, status: getStatus(k, newVal) };
        });

        return newVitals;
      });
    }, 2000);

    return () => clearInterval(jitterInterval);
  }, [scenario]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (deterioratingInterval.current) clearInterval(deterioratingInterval.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-slate-100 font-body selection:bg-teal-500/30 animate-page-transition">
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/20 -z-20"></div>
      
      {/* Danger Banner */}
      {dangerMode && (
        <div className="w-full bg-red-600 text-white py-3 px-6 flex items-center justify-center gap-3 animate-pulse z-50 relative shadow-lg shadow-red-900/50">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-heading font-bold tracking-wide">CRITICAL: Patient vitals in danger zone</span>
        </div>
      )}

      {/* Patient Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative shadow-inner">
              <User className="w-6 h-6 text-slate-400" />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 transition-colors duration-500 ${dangerMode ? 'bg-red-500' : riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                Manthan G
                <span className="text-sm font-normal text-slate-400 px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">Age: 21</span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Chronic Heart Failure • Attending: Dr. Ramesh Kumar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Activity className="w-4 h-4 text-teal-500" />
            Last checked: 2 minutes ago
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/patient-input"
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Patient
            </Link>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Scenarios Panel */}
          <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h2 className="text-sm font-heading font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" /> Simulation Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => handleScenario('healthy')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${scenario === 'healthy' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Healthy Patient
              </button>
              <button 
                onClick={() => handleScenario('warning')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${scenario === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Early Warning
              </button>
              <button 
                onClick={() => handleScenario('critical')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${scenario === 'critical' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Critical Patient
              </button>
              <button 
                onClick={() => handleScenario('deteriorating')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-200 cursor-pointer ${scenario === 'deteriorating' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                Deteriorating (Real-time)
              </button>
            </div>
          </section>

          {/* Vitals Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(vitals).map((vital) => {
              const isDanger = vital.status === 'DANGER';
              const isWarning = vital.status === 'WARNING';
              const colorClass = isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-teal-400';
              const bgClass = isDanger ? 'bg-red-500/10' : isWarning ? 'bg-yellow-500/10' : 'bg-teal-500/10';
              const borderClass = isDanger ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : isWarning ? 'border-yellow-500/30' : 'border-slate-700';
              const sparklineColor = isDanger ? '#f87171' : isWarning ? '#facc15' : '#2dd4bf';
              
              const lastVal = vital.history[vital.history.length - 2];
              const currVal = vital.value;
              const trendUp = currVal > lastVal;
              const trendSame = currVal === lastVal;

              return (
                <div key={vital.id} className={`bg-slate-800/50 rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-40 ${borderClass}`}>
                  {isDanger && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}
                  
                  <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{vital.icon}</span>
                      <h3 className="text-slate-400 font-body font-medium text-sm">{vital.name}</h3>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-heading font-bold tracking-wider ${bgClass} ${colorClass}`}>
                      {vital.status}
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-2 z-10 my-2">
                    <div className={`text-4xl font-heading font-bold tracking-tight transition-colors duration-300 ${colorClass}`}>
                      <AnimatedNumber value={vital.value} isDecimal={vital.id === 'creatinine'} />
                    </div>
                    <div className="text-slate-500 font-body font-medium mb-1 flex items-center gap-1">
                      {vital.unit}
                      {!trendSame && (
                        trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full h-10 mt-auto opacity-70 z-10">
                    <Sparkline data={vital.history} min={vital.min} max={vital.max} color={sparklineColor} />
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* Right Column: Risk Score */}
        <div className="lg:col-span-4">
          <section className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 shadow-2xl h-full flex flex-col items-center">
            <h2 className="text-lg font-heading font-bold text-white mb-8 self-start flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Patient Risk Score
            </h2>
            
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 mb-8 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={riskColor}
                  strokeWidth="8"
                  strokeDasharray={`${(riskScore / 100) * 283} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-heading font-bold text-white tracking-tighter">
                  <AnimatedNumber value={riskScore} />
                </span>
                <span className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-heading font-semibold">Risk</span>
              </div>
            </div>

            {/* SHAP Explainability */}
            <div className="w-full bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50 flex-grow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-bold text-slate-300">AI Risk Factors</h3>
                <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded uppercase font-heading font-bold tracking-wider">SHAP</span>
              </div>
              <ul className="space-y-3">
                {riskScore < 30 && (
                  <li className="flex items-start gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    All vitals are stable and within normal ranges.
                  </li>
                )}
                {riskScore >= 30 && riskScore <= 60 && (
                  <>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <div>
                        <span className="text-yellow-400 font-semibold mr-1">↑</span>
                        Heart rate slightly elevated (108 bpm)
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <div>
                        <span className="text-yellow-400 font-semibold mr-1">↓</span>
                        Ejection Fraction reduced (42%)
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <div>
                        <span className="text-yellow-400 font-semibold mr-1">↑</span>
                        Blood Pressure elevated (145 mmHg)
                      </div>
                    </li>
                  </>
                )}
                {riskScore > 60 && (
                  <>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                      <div>
                        <span className="text-red-400 font-semibold mr-1">↓</span>
                        Ejection Fraction critically low (22%)
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                      <div>
                        <span className="text-red-400 font-semibold mr-1">↑</span>
                        Serum Creatinine elevated (2.8 mg/dL)
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                      <div>
                        <span className="text-red-400 font-semibold mr-1">↑</span>
                        Heart rate dangerously high (138 bpm)
                      </div>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Emergency Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-page-transition">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
              <BellRing className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-white mb-2">Emergency Alert Triggered</h2>
            <p className="text-slate-400 mb-8">Patient vitals have entered critical zones. Automating emergency protocols.</p>
            
            <div className="space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-heading font-medium text-sm">Emergency Contact</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Dr. Ramesh Kumar • +91 98765 43210</p>
                </div>
                {modalState === 'sending' ? (
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Notified
                  </div>
                )}
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-heading font-medium text-sm">Patient Contact</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Manthan G • +91 90000 00000</p>
                </div>
                {modalState === 'sending' ? (
                  <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    Calling...
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Notified
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => setModalOpen(false)}
              className="mt-8 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-heading font-semibold rounded-xl transition-colors border border-slate-600 cursor-pointer"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-page-transition cursor-pointer">
            <div className="text-teal-400">
              {toast.icon}
            </div>
            <p className="text-sm font-body font-medium">{toast.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;