// Chave do IndexNow (prova ao Bing que o site é nosso). Ver lib/indexnow.ts.
export function GET() {
    const key = process.env.INDEXNOW_KEY;
    if (!key) return new Response("Not found", { status: 404 });
    return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
