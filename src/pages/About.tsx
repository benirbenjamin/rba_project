import React from 'react';
import { Radio, Tv, Globe, Shield, Award, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-rba-grayBg pb-20">
      <SEO
        title="About Rwanda Broadcasting Agency (RBA)"
        description="Learn about the history, mandate, and nationwide broadcast reach of Rwanda Broadcasting Agency (RBA), RTV, and Radio Rwanda."
      />

      {/* Hero Header */}
      <div className="bg-rba-navy text-white py-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-rba-yellow/20 text-rba-yellow text-xs font-bold uppercase tracking-wider mb-3">
            Hafi Yawe • Close To You
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            About Rwanda Broadcasting Agency
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The national public service multimedia broadcaster dedicated to educating, informing, and entertaining the citizens of Rwanda and audiences worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 space-y-10">
        
        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-rba-blue/10 text-rba-blue flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Our Mission</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To provide quality content that meets the needs of the audience and promotes cultural values, socio-economic development, and citizen participation in good governance.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-rba-yellow flex items-center justify-center mb-5">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Our Vision</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              To be a leading, modern public broadcaster in the region, delivering trusted, inspiring, and innovative content across all digital, television, and radio mediums.
            </p>
          </div>
        </div>

        {/* Network Reach Breakdown */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md space-y-6">
          <h3 className="text-2xl font-black text-slate-900">Broadcasting Network & Infrastructure</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            RBA operates a comprehensive multimedia network reaching over 98% of Rwanda's population with terrestrial signals, and reaching millions more internationally through digital live streaming.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rba-blue/10 text-rba-blue shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Television Channels</h4>
                <p className="text-xs text-slate-500 mt-0.5">RTV Live (DTT Ch 01) & KC2 Youth Channel</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Radio Rwanda</h4>
                <p className="text-xs text-slate-500 mt-0.5">National public broadcast on 100.7 FM</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Community Radios</h4>
                <p className="text-xs text-slate-500 mt-0.5">7 regional stations across all 4 provinces</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
