import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const { results } = await db.prepare("SELECT * FROM content WHERE id = 'main'").all();
    
    if (results && results.length > 0) {
      return NextResponse.json({ data: JSON.parse(results[0].data) });
    } else {
      return NextResponse.json({ data: null });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getRequestContext().env.DB;
    if (!db) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const dataString = JSON.stringify(body.data);

    // D1 Upsert (Ekle veya Guncelle)
    await db.prepare(
      `INSERT INTO content (id, data) VALUES ('main', ?) 
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`
    ).bind(dataString).run();

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
