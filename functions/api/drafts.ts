export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const { results } = await db.prepare("SELECT id FROM content WHERE id != 'main'").all();
    
    return new Response(JSON.stringify({ drafts: results.map(r => r.id) }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
