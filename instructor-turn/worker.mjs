// Deploy separately as a Cloudflare Worker, NOT as client-side JavaScript.
// Set TURN_TOKEN via a Worker secret. Never paste it into this file or your Pages repository.
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (
      !env.SITE_ORIGIN ||
      origin !== env.SITE_ORIGIN ||
      new URL(request.url).pathname !== "/turn"
    )
      return new Response("Not permitted", { status: 403 });
    const headers = {
      "Access-Control-Allow-Origin": origin,
      Vary: "Origin",
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    };
    if (request.method === "OPTIONS")
      return new Response(null, {
        status: 204,
        headers: {
          ...headers,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers });
    if (!env.LIMITER || !env.TURN_KEY_ID || !env.TURN_TOKEN)
      return Response.json(
        { error: "Relay not configured" },
        { status: 503, headers },
      );
    const ip = request.headers.get("CF-Connecting-IP");
    if (!ip || !(await env.LIMITER.limit({ key: ip })).success)
      return Response.json({ error: "Try later" }, { status: 429, headers });
    try {
      const reply = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(env.TURN_KEY_ID)}/credentials/generate-ice-servers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.TURN_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ttl: 3600 }),
        },
      );
      if (!reply.ok) throw Error();
      const { iceServers } = await reply.json();
      if (!Array.isArray(iceServers)) throw Error();
      return Response.json({ iceServers }, { headers });
    } catch {
      return Response.json(
        { error: "Relay credentials unavailable" },
        { status: 502, headers },
      );
    }
  },
};
