'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/lib/content';
import { zIndex, animation } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import WellFiLogo from '@/components/ui/WellFiLogo';

gsap.registerPlugin(ScrollTrigger);

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useGSAP(() => {
    const nav = navRef.current;
    const heroTrigger = document.getElementById('hero');
    if (!nav || !heroTrigger) return;

    // Start hidden above viewport
    gsap.set(nav, { yPercent: -100 });

    ScrollTrigger.create({
      trigger: heroTrigger,
      start: 'bottom 80px',
      onEnter: () => {
        gsap.to(nav, {
          yPercent: 0,
          duration: animation.navSlide.duration,
          ease: animation.navSlide.ease,
        });
      },
      onLeaveBack: () => {
        gsap.to(nav, {
          yPercent: -100,
          duration: animation.navSlide.duration,
          ease: 'power2.in',
        });
      },
    });
  }, { scope: navRef });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="glass-panel fixed top-0 left-0 w-full h-16 flex items-center px-6 lg:px-10"
      style={{
        zIndex: zIndex.nav,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        onClick={(e) => handleNavClick(e, '#hero')}
        className="shrink-0"
      >
        <WellFiLogo className="h-7 w-auto" />
      </a>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8 mx-auto">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Desktop CTA spacer to balance logo */}
      <div className="hidden md:block w-14 shrink-0" />

      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto text-text-primary"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      <div
        className={cn(
          'absolute top-16 left-0 w-full glass-panel md:hidden flex flex-col gap-4 px-6 py-6 transition-all duration-300',
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none',
        )}
        style={{ borderRadius: 0, borderTop: 'none' }}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-text-secondary hover:text-text-primary transition-colors text-base"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
