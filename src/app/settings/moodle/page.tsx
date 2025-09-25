'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { RadioGroup, RadioGroupItem } from '@/components/UI/radio-group';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MoodleSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connection, setConnection] = useState<any>(null);
  const [connLoading, setConnLoading] = useState(false);
  
  // Connection form state
  const [baseUrl, setBaseUrl] = useState('');
  const [authMethod, setAuthMethod] = useState('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  
  const fetchConnection = useCallback(async () => {
    if (!user) return;
    setConnLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token;
      if (!accessToken) { setConnection(null); return; }
      const res = await fetch('/api/moodle/connection', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to load connection');
      setConnection(json.connection || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnLoading(false);
    }
  }, [user]);

  const verifyMoodle = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Get Moodle token
      let moodleToken = token;
      if (authMethod === 'password') {
        const res = await fetch(`/api/moodle/token?baseUrl=${encodeURIComponent(baseUrl)}&username=${username}&password=${password}`);
        const json = await res.json();
        if (!res.ok || !json.token) throw new Error(json.error || 'Failed to get token');
        moodleToken = json.token;
      }
      
      // 2. Verify token works
      const verifyRes = await fetch(`/api/moodle/verify?baseUrl=${encodeURIComponent(baseUrl)}&token=${moodleToken}`);
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.ok) throw new Error(verifyJson.error || 'Token verification failed');
      
      // 3. Store token securely via server API (encrypts server-side)
      const { data: sess } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');
      const saveRes = await fetch('/api/moodle/save-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ baseUrl, token: moodleToken, id: connection?.id })
      })
      const saveJson = await saveRes.json()
      if (!saveRes.ok || !saveJson.ok) throw new Error(saveJson.error || 'Failed to save connection')
      
      setSuccess('Successfully connected to Moodle!');
      fetchConnection();
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSync = async () => {
    if (!user || !connection) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: sess } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');
      const res = await fetch('/api/moodle/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ verify: true })
      });
      
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Sync failed');
      
      setSuccess(`Synced: ${json.counts?.courses || 0} courses, ${json.counts?.assignments || 0} assignments`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) fetchConnection();
  }, [user, fetchConnection]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader
        title="Moodle/eClass Integration"
        subtitle="Connect your academic accounts to sync courses and assignments"
      />
      
      <Card className="mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Connection Form */}
          <div>
            <h3 className="font-heading text-lg text-text-primary mb-4">
              {connection ? 'Update Connection' : 'Connect Account'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="baseUrl">Moodle/eClass Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-school.moodle.org"
                />
              </div>
              
              <RadioGroup value={authMethod} onValueChange={setAuthMethod} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="password" id="r1" />
                  <Label htmlFor="r1">Username & Password</Label>
                </div>
                {authMethod === 'password' && (
                  <div className="ml-6 space-y-3">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                    />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="token" id="r2" />
                  <Label htmlFor="r2">Use Existing Token</Label>
                </div>
                {authMethod === 'token' && (
                  <div className="ml-6">
                    <Input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Moodle API Token"
                    />
                  </div>
                )}
              </RadioGroup>
              
              <Button 
                onClick={verifyMoodle}
                disabled={loading}
                className="w-full"
              >
                {connection ? 'Update Connection' : 'Connect to Moodle'}
              </Button>
            </div>
          </div>
          
          {/* Connection Status */}
          <div>
            <h3 className="font-heading text-lg text-text-primary mb-4">
              Connection Status
            </h3>
            
            {connLoading ? (
              <div className="text-sm text-text-secondary">Checking connection…</div>
            ) : connection ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-500">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  <span>Connected to {connection.moodle_base_url}</span>
                </div>
                
                <div className="text-sm text-text-secondary">
                  <p>Last verified: {new Date(connection.last_verified_at).toLocaleString()}</p>
                  <Button 
                    variant="outline" 
                    onClick={verifyMoodle}
                    disabled={loading}
                    className="mt-3"
                  >
                    Re-verify Connection
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleSync}
                    disabled={loading}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-yellow-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                <span>No active Moodle connection</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="mt-6">
          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-sm p-3 bg-green-50 rounded-lg">
              {success}
            </div>
          )}
        </div>
      </Card>
      
      <div className="text-sm text-text-secondary">
        <p className="mb-2">How to find your Moodle token:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Log in to your Moodle/eClass account</li>
          <li>Go to Preferences → Security keys</li>
          <li>Generate a new token or use an existing one</li>
        </ol>
      </div>
    </div>
  );
}