// IndexNow: avisa o Bing (e através dele o ChatGPT Search e o Copilot), Yandex, Seznam...
// de que o stock mudou, para as páginas novas serem indexadas em horas e não em semanas.
// Só corre se a variável INDEXNOW_KEY estiver definida na Vercel.
import "server-only";
import { getAllVehicles } from "./api-server";
import { SITE_URL } from "./site";
import { vehicleHref } from "./vehicle";

export async function submitInventoryToIndexNow() {
    const key = process.env.INDEXNOW_KEY;
    if (!key) return;

    try {
        const vehicles = await getAllVehicles();
        const urlList = [`${SITE_URL}/`, `${SITE_URL}/veiculos`, ...vehicles.map((v) => `${SITE_URL}${vehicleHref(v)}`)];

        const res = await fetch("https://api.indexnow.org/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
                host: new URL(SITE_URL).host,
                key,
                keyLocation: `${SITE_URL}/indexnow.txt`,
                urlList,
            }),
            cache: "no-store",
        });
        if (!res.ok && res.status !== 202) console.warn("IndexNow respondeu", res.status);
    } catch (error) {
        console.warn("IndexNow falhou:", error);
    }
}
