const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imdbId } = await req.json();

    if (!imdbId || typeof imdbId !== "string") {
      return new Response(JSON.stringify({ kpId: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kpKey = Deno.env.get("KP_KEY");
    if (!kpKey) {
      console.error("[kp-lookup] KP_KEY secret not set");
      return new Response(JSON.stringify({ kpId: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(
      `https://api.kinopoisk.dev/v1.4/movie?externalId.imdb=${imdbId}&limit=1`,
      { headers: { "X-API-KEY": kpKey } },
    );

    if (!resp.ok) {
      console.error("[kp-lookup] kinopoisk.dev error", resp.status);
      return new Response(JSON.stringify({ kpId: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const kpId: number | null = data?.docs?.[0]?.id ?? null;

    return new Response(JSON.stringify({ kpId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[kp-lookup]", err);
    return new Response(JSON.stringify({ kpId: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
