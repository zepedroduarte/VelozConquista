// Loader do next/image para as fotos das viaturas: em vez de usar a otimização da Vercel
// (com quota mensal), escolhe a versão WebP já gerada pelo Django com o tamanho mais adequado.
// Convenção de nomes definida em be/app/images.py: foto.webp, foto-w960.webp, foto-w480.webp
// (as versões -w960/-w480 são recortadas a 4:3; para a foto inteira use <VehiclePhoto fullFrame />)
import type { ImageLoaderProps } from "next/image";

const VARIANT_WIDTHS = [480, 960];

/** Fotos já convertidas pelo Django. As antigas (.jpeg) continuam a usar o loader da Vercel. */
export function isPreOptimized(src: string): boolean {
    return src.includes(".blob.core.windows.net/") && src.toLowerCase().endsWith(".webp");
}

export default function vehiclePhotoLoader({ src, width }: ImageLoaderProps): string {
    const variant = VARIANT_WIDTHS.find((w) => width <= w);
    return variant ? `${src.slice(0, -".webp".length)}-w${variant}.webp` : src;
}
