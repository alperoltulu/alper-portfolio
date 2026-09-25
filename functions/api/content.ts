export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const { results } = await db.prepare("SELECT * FROM content WHERE id = 'main'").all();
    
    if (results && results.length > 0) {
      return new Response(JSON.stringify({ data: JSON.parse(results[0].data) }), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ data: null }), {
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
    const dataString = JSON.stringify(body.data);

    await db.prepare(
      `INSERT INTO content (id, data) VALUES ('main', ?) 
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`
    ).bind(dataString).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
