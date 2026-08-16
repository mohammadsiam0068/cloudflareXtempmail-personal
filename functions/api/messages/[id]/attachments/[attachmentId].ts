// GET /api/messages/:id/attachments/:attachmentId
interface Env {
  DB: D1Database;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const attachmentId = params.attachmentId as string;
  if (!attachmentId) {
    return new Response(JSON.stringify({ error: "Missing attachment ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const attachment = await env.DB.prepare(
    "SELECT * FROM attachments WHERE id = ?"
  ).bind(attachmentId).first();

  if (!attachment) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const binary = Uint8Array.from(atob(attachment.content_base64 as string), c => c.charCodeAt(0));
  return new Response(binary, {
    headers: {
      "Content-Type": attachment.content_type as string,
      "Content-Disposition": `attachment; filename="${attachment.filename}"`,
      ...corsHeaders,
    },
  });
};
