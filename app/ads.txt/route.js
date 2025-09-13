import fs from 'fs';
import path from 'path';

export async function GET() {
  const env = process.env.ADSENSE_TXT || '';
  if (env && env.trim().length > 0) {
    return new Response(env, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  // fallback to public/ads.txt if present
  try {
    const p = path.join(process.cwd(), 'public', 'ads.txt');
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  } catch (e) {
    // ignore
  }

  return new Response('# ads.txt not configured. set ADSENSE_TXT env var or create public/ads.txt', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
