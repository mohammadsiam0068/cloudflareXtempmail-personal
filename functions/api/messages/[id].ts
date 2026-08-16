interface Env {
  DB: D1Database;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const id = params.id as string;
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email || !id) return json({ error: "Missing params" }, 400);

  const result = await env.DB.prepare(
    "SELECT * FROM emails WHERE id = ? AND to_address = ?"
  ).bind(id, email).first();

  if (!result) return json({ error: "Not found" }, 404);

  await env.DB.prepare(
    "UPDATE emails SET is_read = 1 WHERE id = ?"
  ).bind(id).run();

  // Fetch attachments metadata
  const { results: attachments } = await env.DB.prepare(
    "SELECT id, filename, content_type, size FROM attachments WHERE email_id = ?"
  ).bind(id).all();

  return json({ ...result, attachments: attachments || [] });
};
