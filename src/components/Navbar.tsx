"use client";

import { useEffect, useState } from "react";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSyncNow() {
    if (!user || syncing) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      // Find first active Moodle connection for this user
      const { data: conns, error } = await supabase
        .from('moodle_connections')
        .select('moodle_base_url')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1);
      if (error) throw error;
      if (!conns || conns.length === 0) {
        setSyncMsg('No active Moodle connection. Redirecting to connect…')
        router.push('/settings/moodle')
        return
      }

      const baseUrl = conns[0].moodle_base_url as string;
      const res = await fetch('/api/moodle/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ baseUrl, verify: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Sync failed');
      setSyncMsg(`Synced ${json.counts?.courses ?? 0} courses, ${json.counts?.assignments ?? 0} assignments`);
    } catch (e: any) {
      setSyncMsg(e.message || 'Sync error');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 4000);
    }
  }

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
                <button
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="btn-secondary inline-flex items-center gap-2"
                  title="Sync Moodle now"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing…
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-4 h-4" />
                      Sync Now
                    </>
                  )}
                </button>
                {syncMsg && (
                  <span className="text-xs text-text-secondary ml-2">{syncMsg}</span>
                )}
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
