import { signPut, EVENT_PREFIX } from "./_r2.js";

export default async (req, context) => {
  try {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const { contentType, originalName } = await req.json();
    if (!contentType) return new Response(JSON.stringify({ error: "Missing contentType" }), { status: 400 });

    const date = new Date().toISOString().slice(0, 10);
    const uuid = crypto.randomUUID();
    const safeName = (originalName || "upload").replace(/[^a-z0-9_.-]/gi, "_");
    const key = `${EVENT_PREFIX}/${date}/${uuid}-${safeName}`;

    const url = await signPut(key, contentType);
    return Response.json({ url, key });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};