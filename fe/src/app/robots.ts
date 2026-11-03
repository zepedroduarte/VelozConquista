import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE = ["/admin", "/login", "/api/"];

// /robots.txt — tudo público exceto o back-office. Os robôs dos assistentes de IA
// (ChatGPT, Claude, Perplexity, Gemini...) são autorizados explicitamente, para que
// o stand possa ser recomendado quando alguém pergunta por carros usados em Loures.
export default function robots(): MetadataRoute.Robots {
    const aiBots = [
        "GPTBot", "OAI-SearchBot", "ChatGPT-User",
        "ClaudeBot", "Claude-SearchBot", "Claude-User",
        "PerplexityBot", "Perplexity-User",
        "Google-Extended", "Applebot-Extended", "Bingbot",
    ];

    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: PRIVATE },
            { userAgent: aiBots, allow: "/", disallow: PRIVATE },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
