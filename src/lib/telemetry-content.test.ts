import { describe, expect, it } from 'vitest';
import { navLinks, telemetry } from './content';

describe('telemetry content', () => {
  it('uses the approved second-section headline', () => {
    expect(telemetry.title).toBe('Data Below, Insight Above');
  });

  it('lists the five measurement families in engineer-facing order', () => {
    expect(telemetry.metrics.map((metric) => metric.label)).toEqual([
      'Pressure',
      'Temperature',
      'Vibration',
      'Water Cut',
      'Flow Insight',
    ]);
  });

  it('uses flow insight instead of a hard flow-rate claim', () => {
    const allText = JSON.stringify(telemetry).toLowerCase();
    expect(allText).toContain('flow insight');
    expect(allText).not.toContain('flow rate');
    expect(allText).not.toContain('flow-rate');
  });

  it('keeps the telemetry section card-only for this session closeout', () => {
    expect(Object.keys(telemetry).sort()).toEqual(['metrics', 'title']);
  });

  it('points the primary telemetry nav link at the new section', () => {
    expect(navLinks).toEqual([
      { label: 'Telemetry', href: '#telemetry' },
      { label: 'SAGD', href: '#sagd-interactive' },
      { label: 'Proof', href: '#proof' },
    ]);
  });
});
