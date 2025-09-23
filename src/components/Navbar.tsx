"use client";

import { useEffect, useState } from "react";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 nav-surface ${scrolled ? "nav-surface--scrolled" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <a href="/" className="flex items-center" aria-label="UNIFLOW Home">
            <Brand size="lg" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="/courses" className="text-text-secondary hover:text-text-primary transition-colors">Courses</a>
            <a href="/notes" className="text-text-secondary hover:text-text-primary transition-colors">Notes</a>
            <a href="/assignments" className="text-text-secondary hover:text-text-primary transition-colors">Assignments</a>
            <a href="/calendar" className="text-text-secondary hover:text-text-primary transition-colors">Calendar</a>

            <ThemeToggle />

            <a href="/login" className="btn-secondary">Sign In</a>
            <a href="/signup" className="btn-primary">Get Started</a>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
              aria-label="Open menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
              <a href="/courses" className="text-text-secondary hover:text-text-primary transition-colors">Courses</a>
              <a href="/notes" className="text-text-secondary hover:text-text-primary transition-colors">Notes</a>
              <a href="/calendar" className="text-text-secondary hover:text-text-primary transition-colors">Calendar</a>
              <div className="flex space-x-3 pt-4">
                <a href="/login" className="btn-secondary flex-1 text-center">Sign In</a>
                <a href="/signup" className="btn-primary flex-1 text-center">Get Started</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
