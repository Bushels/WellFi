'use client';

import React from 'react';
import SagdInteractiveHero from './SagdInteractiveHero';
import { ArrowRight, Thermometer, ShieldAlert, TrendingUp } from 'lucide-react';

export default function SagdPresentationSection() {
  return (
    <section id="sagd-interactive" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-section-alt border-t border-white/5">
      {/* Background radial effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="label-text tech-text tracking-widest text-xs font-semibold text-red-500">
            Thermal Recovery Optimization
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mt-3 mb-6 text-text-primary tracking-tight">
            How WellFi Optimizes <br className="hidden sm:inline" />
            <span className="text-gradient">Thermal SAGD Recovery</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Steam-Assisted Gravity Drainage requires micro-level temperature and pressure insight along horizontal laterals. 
            WellFi delivers real-time wireless telemetry without the deployment risk and signal degradation of physical cables.
          </p>
        </div>

        {/* Interactive Image and Details Component */}
        <div className="mb-16">
          <SagdInteractiveHero />
        </div>

        {/* SAGD Core Value Propositions (3 Cards Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
          {/* Card 1: Steam Conformance */}
          <div className="glass-card p-6 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-300"></div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Thermometer className="w-5 h-5" />
              </span>
              <h4 className="text-lg font-bold text-text-primary font-heading">Steam Conformance</h4>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Identify short-circuits and cold spots along the injector lateral in real time. Optimize steam placement to grow uniform steam chambers, increasing cumulative oil recovery.
            </p>
          </div>

          {/* Card 2: Sub-Cool & Pump Protection */}
          <div className="glass-card p-6 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/10 transition-all duration-300"></div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h4 className="text-lg font-bold text-text-primary font-heading">ESP Pump Protection</h4>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Monitor the liquid level (sub-cool) in the producer lateral. Prevent steam breakthrough from vaporizing fluids and causing severe mechanical damage or burnout to downhole pumps.
            </p>
          </div>

          {/* Card 3: CAPEX & OPEX Reduction */}
          <div className="glass-card p-6 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-300"></div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h4 className="text-lg font-bold text-text-primary font-heading">Eliminate Cable Failures</h4>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Ditch fragile, expensive, clamped thermocouple lines and fiber cables. WellFi telemetry installs quickly, tolerates pipe rotation, and works reliably without physical wiring to surface.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 text-center">
          <a
            href="mailto:kylegronning@mpsgroup.ca"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(239,68,68,0.3)] group"
          >
            Request SAGD Technical Specs
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

      </div>
    </section>
  );
}
