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

/**
 * Nunca devolve o original (~230 KB, sem recorte): num iPhone (ecrã 3x) os cartões pediriam
 * imagens com mais de 960 px e cada um descarregava a foto inteira. Acima de 960 usa a -w960.
 */
export default function vehiclePhotoLoader({ src, width }: ImageLoaderProps): string {
    const variant = VARIANT_WIDTHS.find((w) => width <= w) ?? VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1];
    return `${src.slice(0, -".webp".length)}-w${variant}.webp`;
}

/**
 * Foto grande da página da viatura: o original só em ecrãs de computador retina (> 1200 px).
 * Um telemóvel 3x pede 1080/1200 e fica com a -w960.
 */
export function vehiclePhotoLoaderLarge({ src, width }: ImageLoaderProps): string {
    return width > 1200 ? src : vehiclePhotoLoader({ src, width });
}
