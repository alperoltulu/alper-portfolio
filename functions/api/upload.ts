export async function onRequestPost(context: any) {
  try {
    const formData = await context.request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    const bucket = context.env.BUCKET;
    if (!bucket) {
      return new Response(JSON.stringify({ error: "R2 BUCKET binding is missing" }), { status: 500 });
    }

    // Generate safe unique filename
    const ext = file.name.split('.').pop() || 'bin';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${Date.now()}-${safeName}`;

    await bucket.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    return new Response(JSON.stringify({ url: `/cdn/${fileName}` }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
