// Chamado pelo Django sempre que algo muda no admin (ver be/app/revalidation.py).
// Invalida a cache ISR das páginas afetadas para que a próxima visita já veja os dados novos.
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse, after } from "next/server";
import { submitInventoryToIndexNow } from "@/lib/indexnow";
import { timingSafeEqual } from "crypto";
import { CACHE_TAGS } from "@/lib/api-server";

const ALLOWED_TAGS = new Set<string>(Object.values(CACHE_TAGS));

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.REVALIDATE_SECRET;
    const received = request.headers.get("x-revalidate-secret");
    if (!secret || !received) return false;

    const a = Buffer.from(secret);
    const b = Buffer.from(received);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let tags: unknown;
    try {
        ({ tags } = await request.json());
    } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
        return NextResponse.json({ error: "Indique 'tags'" }, { status: 400 });
    }

    const revalidated = tags.filter((tag): tag is string => typeof tag === "string" && ALLOWED_TAGS.has(tag));

    // expire: 0 => a próxima visita recebe logo a versão nova (em vez de stale-while-revalidate)
    revalidated.forEach((tag) => revalidateTag(tag, { expire: 0 }));

    // Stock mudou → avisa os motores de busca, depois de responder ao Django
    if (revalidated.includes(CACHE_TAGS.vehicles)) after(submitInventoryToIndexNow);

    return NextResponse.json({ revalidated, now: Date.now() });
}
