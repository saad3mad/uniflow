"use client";

import { useEffect, useState } from "react";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();
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
          <Link href="/" className="flex items-center" aria-label="UNIFLOW Home">
            <Brand size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
                <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
                <a href="#why" className="text-text-secondary hover:text-text-primary transition-colors">Why Choose Us</a>
                <a href="#about" className="text-text-secondary hover:text-text-primary transition-colors">About</a>
                <ThemeToggle />
                <Link href="/auth/signin" className="btn-secondary">Login</Link>
                <Link href="/auth/register" className="btn-primary">Get Started</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                <Link href="/courses" className="text-text-secondary hover:text-text-primary transition-colors">Courses</Link>
                <Link href="/notes" className="text-text-secondary hover:text-text-primary transition-colors">Notes</Link>
                <Link href="/assignments" className="text-text-secondary hover:text-text-primary transition-colors">Assignments</Link>
                <Link href="/calendar" className="text-text-secondary hover:text-text-primary transition-colors">Calendar</Link>
                <ThemeToggle />
                <button onClick={signOut} className="btn-secondary">Logout</button>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors"
              aria-label="Open menu"
            >
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {!user ? (
                <>
                  <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">Home</Link>
                  <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
                  <a href="#why" className="text-text-secondary hover:text-text-primary transition-colors">Why Choose Us</a>
                  <a href="#about" className="text-text-secondary hover:text-text-primary transition-colors">About</a>
                  <div className="flex space-x-3 pt-4">
                    <Link href="/auth/signin" className="btn-secondary flex-1 text-center">Login</Link>
                    <Link href="/auth/register" className="btn-primary flex-1 text-center">Get Started</Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">Dashboard</Link>
                  <Link href="/courses" className="text-text-secondary hover:text-text-primary transition-colors">Courses</Link>
                  <Link href="/notes" className="text-text-secondary hover:text-text-primary transition-colors">Notes</Link>
                  <Link href="/calendar" className="text-text-secondary hover:text-text-primary transition-colors">Calendar</Link>
                  <button onClick={signOut} className="btn-secondary text-left">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
