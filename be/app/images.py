"""
Automatic image optimisation for vehicle photos.

Any upload (JPG, PNG, HEIC from an iPhone, ...) is:
  1. rotated according to its EXIF orientation (phone photos come in sideways otherwise)
  2. stripped of all metadata (including GPS location)
  3. resized so the longest side is at most MAX_SIZE px
  4. saved as WebP, plus smaller WebP variants used by the frontend on mobile:

      vehicles/<car>/<photo>.webp        (MAX_SIZE)
      vehicles/<car>/<photo>-w960.webp
      vehicles/<car>/<photo>-w480.webp

The frontend image loader (fe/src/lib/image-loader.ts) relies on this naming.
"""
import io
import logging
import os

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

logger = logging.getLogger(__name__)

try:
    # iPhone photos (HEIC/HEIF)
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:  # pragma: no cover
    pass

MAX_SIZE = 1600
VARIANT_WIDTHS = (480, 960)
WEBP_QUALITY = 75  # measured on the site's photos: ~10-35% smaller than the JPEGs with no visible loss


def variant_name(name, width):
    base, _ = os.path.splitext(name)
    return f"{base}-w{width}.webp"


def _to_webp(img):
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
    return buffer.getvalue()


def _resized(img, max_width=None, max_size=None):
    img = img.copy()
    if max_size:
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    if max_width and img.width > max_width:
        height = round(img.height * max_width / img.width)
        img = img.resize((max_width, height), Image.Resampling.LANCZOS)
    return img


def optimize(file):
    """Return (ContentFile with the optimised WebP, PIL image) from any uploaded image."""
    file.seek(0)
    with Image.open(file) as source:
        img = ImageOps.exif_transpose(source)
        # Re-creating the image drops EXIF/GPS/ICC metadata.
        img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
        img = _resized(img, max_size=MAX_SIZE)

    base = os.path.splitext(os.path.basename(file.name))[0]
    return ContentFile(_to_webp(img), name=f"{base}.webp"), img


def save_variants(img, name, storage):
    """Create the smaller WebP versions next to the main image."""
    for width in VARIANT_WIDTHS:
        path = variant_name(name, width)
        content = ContentFile(_to_webp(_resized(img, max_width=width)))
        if storage.exists(path):
            storage.delete(path)
        storage.save(path, content)


def delete_variants(name, storage):
    for width in VARIANT_WIDTHS:
        try:
            storage.delete(variant_name(name, width))
        except Exception as exc:  # never block a delete because of a missing variant
            logger.warning("Could not delete variant of %s: %s", name, exc)
