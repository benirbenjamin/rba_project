import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Radio,
  Tv,
  Search,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { currentStation, isPlaying } = usePlayer();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Radio', path: '/radio' },
    { name: 'TV', path: '/tv' },
    { name: 'About RBA', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-rba-navy text-white border-b border-rba-navyLight shadow-md">
      {/* Top Live Bar */}
      <div className="bg-rba-dark/60 border-b border-white/5 px-4 sm:px-6 py-1 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-rba-yellow">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            ON AIR NOW
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <Link to="/tv" className="hover:text-white transition-colors flex items-center gap-1">
            <Tv className="w-3 h-3 text-rba-blue" /> RTV Live & KC2
          </Link>
          <span className="hidden sm:inline text-slate-400">|</span>
          <Link to="/radio" className="hover:text-white transition-colors flex items-center gap-1">
            <Radio className="w-3 h-3 text-rba-yellow" /> Radio Rwanda 100.7 FM
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isPlaying && currentStation && (
            <div className="flex items-center gap-1.5 text-xs text-rba-blueLight font-medium">
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-rba-yellow" />
              <span className="hidden md:inline">Playing:</span> {currentStation.name}
            </div>
          )}
          {/* Only show Admin Portal if already logged in as staff */}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-rba-yellow hover:underline font-bold flex items-center gap-1 text-[11px]"
            >
              <ShieldAlert className="w-3 h-3" /> Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/logo.png"
            alt="Rwanda Broadcasting Agency (RBA)"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-rba-blue text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Search Input */}
        <div className="hidden lg:flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search radio, TV, videos..."
              className="w-56 xl:w-64 pl-9 pr-4 py-1.5 text-xs bg-white/10 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rba-blue focus:bg-white/15 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>

          <Link
            to="/tv"
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Watch Live
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/search"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-rba-navy border-t border-rba-navyLight px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          {/* Mobile Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stations, videos..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/10 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rba-blue"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-rba-blue text-white'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <Link
              to="/tv"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold text-center text-sm shadow-md"
            >
              Watch RTV Live
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="ml-2 py-2.5 px-4 rounded-xl bg-rba-yellow text-rba-dark font-bold text-sm"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
