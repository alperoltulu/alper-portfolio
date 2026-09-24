export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'success', 
    message: 'Cloudflare Edge API bağlantısı hazır. (D1 bağlantısı ortam değişkenleri üzerinden sağlanacak)'
  }), {
    headers: { 'content-type': 'application/json' },
  });
}
