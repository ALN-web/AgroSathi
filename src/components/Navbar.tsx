import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-[1200px] mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-brand-accent" />
          <span className="text-xl font-bold text-white tracking-tight">AgroSathi</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-white/90 bg-black/20 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 shadow-lg">
          <Link to="/" className={`transition-colors ${path === '/' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>Home</Link>
          <Link to="/features" className={`transition-colors ${path === '/features' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>Features</Link>
          <Link to="/services" className={`transition-colors ${path === '/services' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>Services</Link>
          <Link to="/dashboard" className={`transition-colors ${path === '/dashboard' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>Dashboard</Link>
          <Link to="/about" className={`transition-colors ${path === '/about' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>About</Link>
          <Link to="/contact" className={`transition-colors ${path === '/contact' ? 'text-brand-accent font-bold' : 'hover:text-brand-accent'}`}>Contact</Link>
        </div>

        <button className="hidden sm:inline-flex bg-brand-accent hover:bg-[#a5db40] text-brand-dark font-bold text-sm px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105">
          Get Started
        </button>
      </div>
    </nav>
  );
}
