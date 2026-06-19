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

  it('includes hydrostatic head as pressure context for the below-pump story', () => {
    expect(telemetry.hydrostaticHead.title).toBe('Hydrostatic Head');
    expect(telemetry.hydrostaticHead.description.toLowerCase()).toContain('fluid column');
    expect(telemetry.hydrostaticHead.description.toLowerCase()).toContain('pump intake');
  });

  it('keeps the three placement modes in the approved hierarchy', () => {
    expect(telemetry.placementModes.map((mode) => mode.id)).toEqual([
      'below-pump',
      'behind-casing',
      'dual-wellfi',
    ]);
  });

  it('provides the below-pump pressure callout used by the cutaway stage', () => {
    const belowPump = telemetry.placementModes.find((mode) => mode.id === 'below-pump');
    const pressure = belowPump?.callouts.find((callout) => callout.id === 'intake-pressure');

    expect(pressure).toMatchObject({
      label: 'Pump-intake pressure',
      value: 'P intake',
    });
  });

  it('keeps the application cards focused on production engineering decisions', () => {
    expect(telemetry.applications.map((card) => card.title)).toEqual([
      'Pump Optimization',
      'Drawdown Management',
      'Pressure Build-Up Testing',
      'Reservoir Pressure Monitoring',
      'Water Cut Tracking',
      'Flow Insight',
      'Pump Protection',
      'Cableless Gauge Backup',
    ]);
  });

  it('points the primary telemetry nav link at the new section', () => {
    expect(navLinks).toEqual([
      { label: 'Telemetry', href: '#telemetry' },
      { label: 'SAGD', href: '#sagd-interactive' },
      { label: 'Proof', href: '#proof' },
    ]);
  });
});
