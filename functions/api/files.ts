export async function onRequestGet(context: any) {
  try {
    const bucket = context.env.BUCKET;
    if (!bucket) {
      return new Response(JSON.stringify({ error: "R2 BUCKET binding is missing" }), { status: 500 });
    }

    const listed = await bucket.list({ limit: 100 });
    const files = listed.objects.map((obj: any) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded
    }));

    // Sort newest first
    files.sort((a: any, b: any) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());

    return new Response(JSON.stringify({ files }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
