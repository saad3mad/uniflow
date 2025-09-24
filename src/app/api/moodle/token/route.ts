import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const baseUrl = searchParams.get('baseUrl');
    const username = searchParams.get('username');
    const password = searchParams.get('password');
    
    if (!baseUrl || !username || !password) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }
    
    // Moodle token endpoint
    const tokenUrl = `${baseUrl}/login/token.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&service=moodle_mobile_app`;
    
    const res = await fetch(tokenUrl);
    const json = await res.json();
    
    if (json.error) {
      return new Response(JSON.stringify({ error: json.error }), { status: 400 });
    }
    
    return new Response(JSON.stringify({ token: json.token }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Token request failed' }), { status: 500 });
  }
}
