'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Activity, Thermometer, Layers, CloudLightning, Flame, ArrowDownCircle, Cpu, ShieldAlert, CheckCircle } from 'lucide-react';

interface Hotspot {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  x: string; // percentage from left
  y: string; // percentage from top
  highlights: string[];
  specs?: { label: string; value: string }[];
}

export default function SagdInteractiveHero() {
  const [activeId, setActiveId] = useState<string>('wellfi-telemetry');

  const hotspots: Hotspot[] = [
    {
      id: 'lease-pad',
      title: 'Surface Well Pad & Pipe Rack',
      subtitle: 'Central Distribution Hub',
      description: 'The gravel lease pad houses the central pipe rack, modular utility buildings, valves, and manifold headers. Piping branches out to individual injector and producer wellheads. This pad distributes high-pressure steam downhole and collects the produced bitumen-water emulsion for processing.',
      icon: <Layers className="w-5 h-5 text-amber-500" />,
      x: '50%',
      y: '22%',
      highlights: [
        'Modular industrial layout',
        'Steam and production manifolds',
        'Gravel lease with boreal perimeter'
      ]
    },
    {
      id: 'steam-injector',
      title: 'Steam Injector Laterals',
      subtitle: 'Upper Horizontal Wellbores',
      description: 'Drilled horizontally through the upper zone of the oil sand reservoir. Steam is injected continuously through these upper wells to heat the surrounding cold bitumen. Maintaining uniform steam distribution along the lateral is critical to maximize recovery and avoid cold spots.',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      x: '34%',
      y: '58%',
      highlights: [
        'Drilled horizontally in oil sand',
        'Glowing red/orange steam injection',
        'Requires continuous conformance monitoring'
      ]
    },
    {
      id: 'steam-chambers',
      title: 'Steam Chamber Development',
      subtitle: 'Viscosity Reduction Zone',
      description: 'Injected steam rises and expands, forming large steam chambers in the oil sand. The heat reduces the viscosity of the heavy bitumen from a solid-like state (like asphalt) into a flowing liquid that drains downwards.',
      icon: <CloudLightning className="w-5 h-5 text-amber-400" />,
      x: '24%',
      y: '48%',
      highlights: [
        'Orange steam envelope expansion',
        'Latent heat transfer to bitumen',
        'Gravity-driven drainage perimeter'
      ]
    },
    {
      id: 'bitumen-drainage',
      title: 'Viscous Bitumen Drainage',
      subtitle: 'Gravity Flow Mechanics',
      description: 'Under the force of gravity, the heated bitumen and condensed steam drain downward along the outer boundaries of the steam chamber. This liquid accumulation flows directly toward the lower horizontal producer wells.',
      icon: <ArrowDownCircle className="w-5 h-5 text-amber-600" />,
      x: '64%',
      y: '65%',
      highlights: [
        'Continuous gravity-driven flow',
        'Heated bitumen accumulation',
        'Condensed steam water mixture'
      ]
    },
    {
      id: 'producer-lateral',
      title: 'Producer Laterals',
      subtitle: 'Lower Horizontal Wellbores',
      description: 'Positioned parallel to and exactly 5 meters below the steam injectors, located within the same oil sand reservoir layer. These lower laterals collect the draining bitumen and condensed steam water, pumping them to the surface. Preventing steam breakthrough is critical to protect downhole pumps.',
      icon: <Thermometer className="w-5 h-5 text-cyan-500" />,
      x: '76%',
      y: '72%',
      highlights: [
        'Parallel horizontal collection well',
        'Positioned in the same reservoir layer',
        'Requires precise temperature control to prevent breakthrough'
      ]
    },
    {
      id: 'wellfi-telemetry',
      title: 'WellFi Downhole Telemetry',
      subtitle: 'Wireless EM Telemetry Platform',
      description: 'WellFi wireless tools are installed directly inside both injector and producer wells, running parallel within the same reservoir layer. They measure downhole temperature and pressure along the horizontal laterals and transmit data electromagnetically through the formation to the surface, completely eliminating failure-prone physical cables in thermal operations.',
      icon: <Cpu className="w-5 h-5 text-red-500 text-glow" />,
      x: '45%',
      y: '62%',
      highlights: [
        '100% wireless EM telemetry',
        'Clamps directly onto casing strings',
        'Prevents sub-cool and breakthrough failures'
      ],
      specs: [
        { label: 'Continuous Temp', value: '150°C (302°F)' },
        { label: 'Max Pressure', value: '10,000 psia' },
        { label: 'Output Interface', value: 'Modbus RS-485' },
        { label: 'Form Factor', value: '46 mm (1.83 in) OD' }
      ]
    }
  ];

  const activeHotspot = hotspots.find(h => h.id === activeId) || hotspots[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* 3D Isometric Image View Container (Left 7 Columns) */}
      <div className="lg:col-span-7 flex flex-col justify-between calc-shell overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[620px]">
        {/* Visual Header */}
        <div className="p-4 sm:p-6 z-10 flex justify-between items-center bg-gradient-to-b from-navy-void to-transparent">
          <div>
            <span className="label-text tech-text tracking-widest text-[11px]">Subsurface Blueprint</span>
            <h3 className="text-xl font-bold font-heading mt-0.5 text-text-primary">Alberta SAGD Cutaway</h3>
          </div>
          <div className="flex gap-1.5 text-[11px] tech-text text-text-secondary items-center bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Interactive Hotspots
          </div>
        </div>

        {/* The Image + Absolute Hotspot Pins */}
        <div className="relative flex-grow flex items-center justify-center p-2 sm:p-4 bg-gradient-mesh">
          <div className="relative w-full max-w-[580px] aspect-[4/3] rounded-lg overflow-hidden group select-none">
            {/* The Generated Hero Image */}
            <Image
              src="/images/wellfi-sagd-island-hero.png"
              alt="WellFi Alberta SAGD 3D Isometric Island Hero"
              fill
              className="object-contain duration-700 ease-in-out transition-transform group-hover:scale-[1.02]"
              priority
              sizes="(max-width: 1024px) 100vw, 580px"
            />

            {/* Hotspots Map */}
            {hotspots.map((spot) => {
              const isActive = spot.id === activeId;
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveId(spot.id)}
                  style={{ left: spot.x, top: spot.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 outline-none
                    ${isActive 
                      ? 'bg-red-500 scale-125 shadow-[0_0_20px_rgba(239,68,68,0.8)]' 
                      : 'bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110'
                    }`}
                  title={spot.title}
                >
                  {/* Outer Pulsing Glow */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60"></span>
                  )}
                  {/* Dot/Icon Center */}
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold tech-text
                    ${isActive ? 'text-navy-void' : 'text-text-primary'}`}
                  >
                    {spot.id === 'wellfi-telemetry' ? (
                      <span className="w-2 h-2 rounded-full bg-text-primary animate-pulse"></span>
                    ) : (
                      ''
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Image Bottom Bar */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 backdrop-blur-sm z-10 flex flex-wrap gap-2 justify-center sm:justify-start">
          {hotspots.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setActiveId(spot.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border
                ${spot.id === activeId
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-white/5 border-transparent text-text-secondary hover:text-text-primary hover:bg-white/10'
                }`}
            >
              {spot.title}
            </button>
          ))}
        </div>
      </div>

      {/* Details Side Panel (Right 5 Columns) */}
      <div className="lg:col-span-5 flex flex-col justify-between glass-card p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        {/* Glow Ambient behind the active card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div>
          {/* Section Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              {activeHotspot.icon}
            </span>
            <div>
              <span className="label-text tech-text tracking-widest text-[10px]">{activeHotspot.subtitle}</span>
              <h4 className="text-lg font-bold text-text-primary leading-tight font-heading mt-0.5">{activeHotspot.title}</h4>
            </div>
          </div>

          <div className="h-px bg-white/10 my-4"></div>

          {/* Description */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            {activeHotspot.description}
          </p>

          {/* Key Bullet points */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-text-primary tech-text uppercase tracking-wider">Key Aspects</h5>
            {activeHotspot.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2.5 text-xs text-text-secondary">
                <CheckCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specs Box (Only for WellFi Telemetry or specific items) */}
        {activeHotspot.specs ? (
          <div className="mt-8 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold tech-text text-red-400 uppercase tracking-widest">WellFi Tool Specs</span>
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {activeHotspot.specs.map((spec, index) => (
                <div key={index} className="border-b border-white/5 pb-2">
                  <span className="block text-[10px] text-text-secondary uppercase tech-text">{spec.label}</span>
                  <span className="text-sm font-semibold text-text-primary tech-text">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-3 items-center">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary block">Thermal Operational Risks</span>
              Extreme temperatures exceed normal sensor limits. WellFi provides robust downhole telemetry in these environments.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
