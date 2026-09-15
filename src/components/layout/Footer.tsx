import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Tv, Phone, Mail, MapPin, ExternalLink, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-rba-dark text-slate-300 border-t border-rba-navyLight pt-14 pb-28 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: About RBA */}
          <div className="space-y-4">
            <img
              src="/logo.png"
              alt="Rwanda Broadcasting Agency"
              className="h-12 w-auto object-contain"
            />
            <p className="text-xs text-slate-400 leading-relaxed">
              Rwanda Broadcasting Agency (RBA) is Rwanda’s public service multimedia broadcaster, providing quality news, education, and entertainment across television, radio, and digital streaming platforms nationwide and worldwide.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-rba-yellow">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hafi Yawe
              </span>
              <span>•</span>
              <span>Close To You</span>
            </div>
          </div>

          {/* Column 2: Radio Network Frequencies */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-rba-yellow" />
              RBA Radio Stations
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link to="/radio/radio-rwanda" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Rwanda</span> <span className="font-semibold text-slate-200">100.7 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/magic-fm" className="hover:text-white transition-colors flex justify-between">
                  <span>Magic FM</span> <span className="font-semibold text-slate-200">90.7 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-rubavu" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Rubavu</span> <span className="font-semibold text-slate-200">105.1 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-nyagatare" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Nyagatare</span> <span className="font-semibold text-slate-200">96.6 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-inteko" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Inteko</span> <span className="font-semibold text-slate-200">89.6 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-huye" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Huye</span> <span className="font-semibold text-slate-200">100.4 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-musanze" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Musanze</span> <span className="font-semibold text-slate-200">90.0 FM</span>
                </Link>
              </li>
              <li>
                <Link to="/radio/radio-rusizi" className="hover:text-white transition-colors flex justify-between">
                  <span>Radio Rusizi</span> <span className="font-semibold text-slate-200">93.3 FM</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & TV */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4 text-rba-blue" />
              Television & Programs
            </h4>
            <ul className="text-xs space-y-2.5 text-slate-400">
              <li>
                <Link to="/tv" className="hover:text-white transition-colors">
                  RTV Live Streaming
                </Link>
              </li>
              <li>
                <Link to="/tv" className="hover:text-white transition-colors">
                  KC2 Youth & Sports TV
                </Link>
              </li>
              <li>
                <Link to="/tv" className="hover:text-white transition-colors">
                  Latest News Bulletins
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Rwanda Broadcasting Agency
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Broadcasting Center & Studios
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & App Downloads */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Get in Touch
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rba-blue shrink-0 mt-0.5" />
                <span>KG 7 Ave, Kacyiru, P.O. Box 83 Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rba-yellow shrink-0" />
                <span>+250 252 576 540 / +250 788 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rba-blue shrink-0" />
                <span>info@rba.co.rw</span>
              </div>
            </div>

            {/* Mobile / Audio App Links */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
                Listen On Mobile Apps
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15 cursor-default">
                  App Store
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15 cursor-default">
                  Google Play
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15 cursor-default">
                  TuneIn Radio
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Rwanda Broadcasting Agency (RBA). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <Link to="/admin/login" className="hover:text-slate-300 transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
