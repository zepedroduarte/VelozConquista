'use client'

import Image, { ImageProps } from "next/image";
import vehiclePhotoLoader, { isPreOptimized, vehiclePhotoLoaderLarge } from "@/lib/image-loader";

type VehiclePhotoProps = ImageProps & {
    /** Foto inteira, sem recorte (ex.: ecrã inteiro). As versões pequenas são recortadas a 4:3. */
    fullFrame?: boolean;
    /** Pode usar o original em ecrãs grandes (foto principal da página da viatura). */
    large?: boolean;
};

// next/image para fotos de viaturas: usa as versões WebP geradas pelo Django quando existem.
export function VehiclePhoto({ alt, fullFrame = false, large = false, priority, ...props }: VehiclePhotoProps) {
    const preOptimized = typeof props.src === "string" && isPreOptimized(props.src);
    const loader = !preOptimized ? undefined
        : fullFrame ? ({ src }: { src: string }) => src
        : large ? vehiclePhotoLoaderLarge
        : vehiclePhotoLoader;

    return (
        <Image
            alt={alt}
            {...props}
            loader={loader}
            // A foto principal (LCP) é pedida logo no início, com prioridade alta
            preload={priority}
            fetchPriority={priority ? "high" : props.fetchPriority}
            loading={priority ? "eager" : props.loading}
        />
    );
}
