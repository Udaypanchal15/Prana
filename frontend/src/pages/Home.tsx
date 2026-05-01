import React, { useState } from 'react';
import { Menu, X, ChevronDown, Heart, Activity, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-body bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0891B2 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 w-full flex items-center justify-between px-6 md:px-12 lg:px-24 py-5 backdrop-blur-sm bg-slate-900/50 border-b border-teal-900/30">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-heading font-bold text-xl tracking-tight">PRANA</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10 ml-12">
          <Link to="/" className="text-slate-300 font-medium text-sm hover:text-teal-400 transition-colors duration-200">Home</Link>
          <Link to="/dashboard" className="text-slate-300 font-medium text-sm hover:text-teal-400 transition-colors duration-200 flex items-center gap-1">
            Dashboard
            <ChevronDown className="w-4 h-4 opacity-60" />
          </Link>
          <a href="#features" className="text-slate-300 font-medium text-sm hover:text-teal-400 transition-colors duration-200">Features</a>
          <a href="#about" className="text-slate-300 font-medium text-sm hover:text-teal-400 transition-colors duration-200">About</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-slate-300 font-semibold text-sm px-5 py-2.5 hover:text-white transition-colors duration-200 cursor-pointer">
            Sign In
          </Link>
          <Link to="/login" className="bg-teal-500 hover:bg-teal-400 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 cursor-pointer">
            Analyze Patient
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-heading font-bold text-xl">PRANA</span>
            </div>
            <button className="text-slate-400 p-2 hover:text-white cursor-pointer" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-5">
            <Link to="/" className="text-white text-lg font-medium py-2 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/dashboard" className="text-white text-lg font-medium py-2 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <a href="#features" className="text-white text-lg font-medium py-2 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#about" className="text-white text-lg font-medium py-2 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>About</a>
            <div className="h-px bg-slate-700 my-2" />
            <Link to="/login" className="bg-slate-800 text-white font-semibold text-base py-3 rounded-lg w-full text-center cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/login" className="bg-teal-500 text-white font-semibold text-base py-3 rounded-lg w-full text-center cursor-pointer hover:bg-teal-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Analyze Patient</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-20 lg:mt-28 px-6">
        {/* AI Tag */}
        <div className="flex items-center gap-2 bg-teal-500/10 backdrop-blur-md border border-teal-500/30 rounded-full px-4 py-2 mb-8">
          <span className="bg-teal-500 text-white font-heading font-semibold text-xs px-3 py-1 rounded-full">AI</span>
          <span className="text-teal-300 font-body font-medium text-sm">
            Powered by Random Forest + SHAP Explainability
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mb-6">
          Predict patient deterioration <span className="text-teal-400 italic">before</span> it's too late
        </h1>

        {/* Subtext */}
        <p className="font-body text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          PRANA monitors chronic patients using 12 clinical vitals — detecting early signs of heart failure and delivering explainable, actionable risk scores to doctors in real time.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-heading font-semibold text-base rounded-xl px-8 py-4 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-200 cursor-pointer w-full sm:w-auto"
          >
            Analyze a Patient
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#features"
            className="flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-heading font-semibold text-base rounded-xl px-8 py-4 border border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer w-full sm:w-auto"
          >
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-16 mt-16 pt-10 border-t border-slate-800">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-bold text-teal-400">85%</div>
            <div className="text-slate-500 text-sm mt-1">Prediction Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-bold text-teal-400">12</div>
            <div className="text-slate-500 text-sm mt-1">Clinical Vitals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-bold text-teal-400">Real-time</div>
            <div className="text-slate-500 text-sm mt-1">Monitoring</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 mt-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Why Choose PRANA?</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built for healthcare professionals who demand precision, reliability, and speed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Continuous tracking of 12 vital parameters with instant alerts for critical changes.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">AI-Powered Predictions</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Machine learning model trained on 300+ patient records with 85% accuracy.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">SHAP Explainability</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Every prediction comes with clear, understandable risk factor explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 py-10 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-400 font-heading font-semibold">PRANA Health</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Prana Health. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;