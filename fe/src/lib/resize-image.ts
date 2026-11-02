// Reduz as fotos do telemóvel (3-10 MB) no próprio browser antes do upload:
// o upload fica muito mais rápido em dados móveis e o servidor (Azure F1) tem menos trabalho.
// A conversão final para WebP é feita no Django (be/app/images.py).

const MAX_SIZE = 2048;
const JPEG_QUALITY = 0.9;

export async function resizeImageForUpload(file: File): Promise<File> {
    if (!file.type.startsWith("image/")) return file;

    try {
        // imageOrientation: aplica a rotação EXIF (fotos tiradas na vertical)
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));

        if (scale === 1 && file.type === "image/jpeg") {
            bitmap.close();
            return file;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) return file;
        ctx.fillStyle = "#fff"; // PNG com transparência
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
        if (!blob) return file;

        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
    } catch {
        // Ex.: HEIC num browser que não o lê. O servidor converte na mesma.
        return file;
    }
}
