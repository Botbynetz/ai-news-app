export async function GET() {
  const token = process.env.NEXT_PUBLIC_GSC_VERIFICATION || '';
  if (!token) {
    return new Response('Not configured', { status: 404 });
  }
  const body = `${token}.html`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
