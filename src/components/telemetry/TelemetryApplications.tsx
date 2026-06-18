import {
  Cable,
  Droplets,
  Gauge,
  LineChart,
  Radar,
  Settings2,
  ShieldAlert,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TelemetryApplicationCard } from '@/lib/content';

const iconMap: Record<string, LucideIcon> = {
  Cable,
  Droplets,
  Gauge,
  LineChart,
  Radar,
  Settings2,
  ShieldAlert,
  TrendingUp,
};

interface TelemetryApplicationsProps {
  applications: TelemetryApplicationCard[];
}

export default function TelemetryApplications({ applications }: TelemetryApplicationsProps) {
  return (
    <div className="telemetry-applications mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {applications.map((card) => {
        const Icon = iconMap[card.icon] ?? Gauge;
        return (
          <article
            key={card.title}
            className="telemetry-application rounded-md border border-white/10 bg-[#07101a]/80 p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-em-glow">
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-text-primary">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {card.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
