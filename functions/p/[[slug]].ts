export async function onRequestGet(context) {
  // Bura tnel grevi grr. /p/ne-yazarsan-yaz, arka planda Next.js'in retip
  // out/p.html olarak kard statik sayfay browser'a sylemeden dndrr.
  const url = new URL(context.request.url);
  return context.env.ASSETS.fetch(new URL('/p.html', url.origin));
}
