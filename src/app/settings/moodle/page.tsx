"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/UI/use-toast";

export default function MoodleSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diag, setDiag] = useState<any | null>(null);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Moodle Connection</h1>
        <p className="text-text-secondary">Please sign in to manage your Moodle connection.</p>
      </div>
    );
  }

  async function handleConnectAndSync() {
    setLoading(true);
    setError(null);
    setMsg(null);
    try {
      // ensure we have a valid session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("You are not signed in. Please sign in and try again.");
      // basic validation
      if (!/^https?:\/\//i.test(baseUrl.trim())) {
        throw new Error("Please enter a valid Moodle base URL starting with http(s)://");
      }
      // Connect via Supabase Edge Function
      const { data: connectData, error: connectError } = await supabase.functions.invoke("moodle-connect", {
        body: { baseUrl: baseUrl, username, password },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (connectError) throw connectError;
      setMsg("Connected to Moodle successfully.");
      toast({ title: "Connected", description: "Moodle connection saved." });

      // Sync via Supabase Edge Function
      const { data: syncData, error: syncError } = await supabase.functions.invoke("moodle-sync", {
        body: { baseUrl: baseUrl, verify: true },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (syncError) throw syncError;
      setMsg("Sync started/completed successfully.");
      toast({ title: "Synced", description: "Your Moodle data has been synchronized." });
    } catch (e: any) {
      setError(e.message || "Operation failed");
      toast({ title: "Failed", description: e.message || "Operation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function runDiagnostics() {
    setDiagLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const { data, error } = await supabase.functions.invoke("diag", {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (error) throw error;
      setDiag(data);
      toast({ title: "Diagnostics", description: "Diagnostics completed. See results below." });
    } catch (e: any) {
      setDiag(null);
      setError(e.message || "Diagnostics failed");
      toast({ title: "Diagnostics failed", description: e.message || "Diagnostics failed", variant: "destructive" });
    } finally {
      setDiagLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Moodle Connection</h1>

      <div className="space-y-4 bg-background-secondary p-4 rounded-lg border border-border">
        <div>
          <label className="block text-sm mb-1">Moodle Base URL</label>
          <input
            className="w-full px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary border border-border"
            placeholder="https://your.moodle.site"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary border border-border"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary border border-border"
              placeholder="your-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleConnectAndSync}
          disabled={loading || !baseUrl || !username || !password}
          className="btn-primary w-full md:w-auto"
        >
          {loading ? "Connecting & Syncing…" : "Connect & Sync"}
        </button>
        <div className="pt-2 flex flex-col md:flex-row gap-2">
          <button
            onClick={runDiagnostics}
            disabled={diagLoading}
            className="btn-secondary w-full md:w-auto"
            aria-busy={diagLoading}
          >
            {diagLoading ? "Running Diagnostics…" : "Run Diagnostics"}
          </button>
        </div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <p className="text-xs text-text-secondary mt-4">
        Your credentials are used only to obtain a Moodle web service token which is encrypted and stored securely.
      </p>

      {diag && (
        <div className="mt-6 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-background-secondary font-medium">Diagnostics Result</div>
          <pre className="p-4 text-xs overflow-auto">
{JSON.stringify(diag, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
