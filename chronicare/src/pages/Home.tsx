import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-manrope animate-page-transition">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4"
          type="video/mp4"
        />
      </video>

      {/* Navbar Overlay */}
      <nav className="relative z-20 w-full flex items-center justify-between px-6 md:px-[120px] py-[16px] bg-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-[20px]">PRANA</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 ml-8 mr-auto">
          <Link to="/" className="text-white font-medium text-[14px] hover:opacity-80 transition-opacity">Home</Link>
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity group">
            <Link to="/dashboard" className="text-white font-medium text-[14px]">Dashboard</Link>
            <ChevronDown className="text-white w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
          </div>
          <Link to="/scheduler" className="text-white font-medium text-[14px] hover:opacity-80 transition-opacity">Scheduler</Link>
          <Link to="/predict" className="text-white font-medium text-[14px] hover:opacity-80 transition-opacity">Predict</Link>
          <Link to="#about" className="text-white font-medium text-[14px] hover:opacity-80 transition-opacity">About</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="bg-white border border-[#d4d4d4] text-[#171717] font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-gray-50 transition-colors">
            Sign In
          </button>
          <Link to="/consultation" className="bg-[#2563eb] text-[#fafafa] font-semibold text-[14px] px-4 py-2 rounded-[8px] shadow-sm hover:bg-blue-600 transition-colors">
            Analyze Patient
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col p-6">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-[20px]">PRANA</span>
            </div>
            <button className="text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-6">
            <Link to="/" className="text-white text-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/dashboard" className="text-white text-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/scheduler" className="text-white text-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Scheduler</Link>
            <Link to="/predict" className="text-white text-xl font-medium" onClick={() => setMobileMenuOpen(false)}>Predict</Link>
            <Link to="#about" className="text-white text-xl font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <div className="h-px bg-white/20 my-4" />
            <button className="bg-white text-black font-semibold text-lg py-3 rounded-lg w-full">Sign In</button>
            <Link to="/consultation" className="bg-[#2563eb] text-white font-semibold text-lg py-3 rounded-lg w-full text-center" onClick={() => setMobileMenuOpen(false)}>Analyze Patient</Link>
          </div>
        </div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-32 px-6">
        {/* Tagline Pill */}
        <div className="flex items-center gap-2 bg-[rgba(37,99,235,0.3)] backdrop-blur-md border border-[rgba(147,197,253,0.4)] rounded-[10px] h-[38px] px-2 pr-4 mb-6">
          <div className="bg-[#2563eb] text-white font-cabin font-medium text-[12px] px-2 py-0.5 rounded-[6px]">
            AI
          </div>
          <span className="text-white font-cabin font-medium text-[14px]">
            Powered by Random Forest + SHAP Explainability
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-instrument text-white text-5xl md:text-[96px] leading-[1.1] max-w-[900px] mb-6">
          Predict patient deterioration <span className="italic pr-1">before</span> it's too late
        </h1>

        {/* Subtext */}
        <p className="font-inter font-normal text-[18px] text-white/70 max-w-[662px] mb-10">
          PRANA monitors chronic patients using 12 clinical vitals — detecting early signs of heart failure and delivering explainable, actionable risk scores to doctors in real time.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/consultation" 
            className="flex items-center justify-center bg-[#2563eb] text-white font-cabin font-medium text-[16px] rounded-[10px] px-6 py-3 w-full sm:w-auto hover:bg-[#3b82f6] transition-colors"
          >
            Analyze a Patient
          </Link>
          <button 
            className="flex items-center justify-center bg-[#0f172a] text-[#f6f7f9] font-cabin font-medium text-[16px] rounded-[10px] px-6 py-3 w-full sm:w-auto hover:bg-[#1e293b] transition-colors"
          >
            See How It Works
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
