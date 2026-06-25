'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/lib/content';
import { zIndex } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import WellFiLogo from '@/components/ui/WellFiLogo';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The bar is always present so section links are reachable immediately.
  // While over the hero it floats transparent (the hero shows its own logo);
  // once scrolled past the hero it solidifies to glass and reveals its logo.
  useEffect(() => {
    const hero = document.getElementById('hero');
    const compute = () => {
      const threshold = hero ? hero.offsetHeight - 80 : 80;
      setScrolled(window.scrollY > threshold);
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'fixed top-0 left-0 w-full h-16 flex items-center px-6 lg:px-10',
        'transition-[background-color,backdrop-filter,border-color] duration-300',
        scrolled ? 'glass-panel' : 'bg-transparent border-transparent',
      )}
      style={{
        zIndex: zIndex.nav,
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}
    >
      {/* Logo — hidden while floating over the hero (hero shows its own), fades
          in once the bar solidifies. Kept in layout so centered links don't shift. */}
      <a
        href="#hero"
        onClick={(e) => handleNavClick(e, '#hero')}
        className={cn(
          'shrink-0 transition-opacity duration-300',
          scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!scrolled}
        tabIndex={scrolled ? 0 : -1}
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
