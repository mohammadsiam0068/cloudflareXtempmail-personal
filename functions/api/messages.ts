interface Env {
  DB: D1Database;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) return json({ error: "Missing email" }, 400);

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, to_address, from_address, from_name, subject, preview, has_attachments, is_read, received_at FROM emails WHERE to_address = ? ORDER BY received_at DESC LIMIT 50"
    ).bind(email).all();
    return json(results || []);
  }

  if (request.method === "DELETE") {
    await env.DB.prepare(
      "DELETE FROM attachments WHERE email_id IN (SELECT id FROM emails WHERE to_address = ?)"
    ).bind(email).run();
    await env.DB.prepare(
      "DELETE FROM emails WHERE to_address = ?"
    ).bind(email).run();
    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, 405);
};
