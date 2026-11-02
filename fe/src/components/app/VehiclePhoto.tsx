'use client'

import Image, { ImageProps } from "next/image";
import vehiclePhotoLoader, { isPreOptimized } from "@/lib/image-loader";

// next/image para fotos de viaturas: usa as versões WebP geradas pelo Django quando existem.
export function VehiclePhoto({ alt, ...props }: ImageProps) {
    const preOptimized = typeof props.src === "string" && isPreOptimized(props.src);
    return <Image alt={alt} {...props} loader={preOptimized ? vehiclePhotoLoader : undefined} />;
}
