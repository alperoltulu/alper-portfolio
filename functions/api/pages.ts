export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const { results } = await db.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).all();
      if (results && results.length > 0) {
        return new Response(JSON.stringify({ data: results[0] }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    } else {
      const { results } = await db.prepare("SELECT * FROM pages ORDER BY created_at DESC").all();
      return new Response(JSON.stringify({ data: results || [] }), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const db = context.env.DB;
    const request = context.request;
    const body = await request.json();

    const { slug, title, content } = body;
    if (!slug || !title) {
       return new Response(JSON.stringify({ error: "Slug and title are required" }), { status: 400 });
    }

    await db.prepare(
      `INSERT INTO pages (slug, title, content) VALUES (?, ?, ?) 
       ON CONFLICT(slug) DO UPDATE SET title = excluded.title, content = excluded.content`
    ).bind(slug, title, content || "").run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) return new Response("Missing slug", { status: 400 });

    await db.prepare("DELETE FROM pages WHERE slug = ?").bind(slug).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
