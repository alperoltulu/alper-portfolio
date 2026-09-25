export async function onRequestGet(context: any) {
  try {
    const pathArray = context.params.path;
    if (!pathArray || pathArray.length === 0) {
      return new Response("Not found", { status: 404 });
    }
    
    const filePath = pathArray.join("/");
    const bucket = context.env.BUCKET;
    
    if (!bucket) {
      return new Response("R2 BUCKET binding missing", { status: 500 });
    }

    const object = await bucket.get(filePath);
    
    if (!object) {
      return new Response("File not found in CDN", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    
    // Add cache headers for performance
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
