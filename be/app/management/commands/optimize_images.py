"""
Convert vehicle photos uploaded before the automatic optimisation existed.

    python manage.py optimize_images --dry-run   # only lists what would change
    python manage.py optimize_images             # converts everything

Safe to run more than once: photos already converted are skipped.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from app import images
from app.models import VehicleImage


class Command(BaseCommand):
    help = "Converte as fotos existentes para WebP otimizado e cria as versões pequenas."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Mostra o que seria feito, sem alterar nada.")

    def handle(self, *args, dry_run=False, **options):
        converted = variants_only = skipped = failed = 0
        saved_bytes = 0

        # A single transaction => the public site is revalidated once at the end.
        with transaction.atomic():
            for photo in VehicleImage.objects.select_related("vehicle_data").order_by("id"):
                name = photo.image.name
                storage = photo.image.storage
                is_webp = name.lower().endswith(".webp")

                if is_webp and storage.exists(images.variant_name(name, images.VARIANT_WIDTHS[0])):
                    skipped += 1
                    continue

                if dry_run:
                    self.stdout.write(f"  {'variantes' if is_webp else 'converter'}: {name}")
                    continue

                try:
                    old_size = storage.size(name)
                    with photo.image.open("rb"):
                        content, optimized = images.optimize(photo.image)

                    if is_webp:
                        variants_only += 1
                    else:
                        # django_cleanup deletes the old JPG/PNG once the new file is saved.
                        photo.image.save(content.name, content, save=False)
                        photo.save(update_fields=["image"])
                        saved_bytes += old_size - content.size
                        converted += 1

                    images.save_variants(optimized, photo.image.name, storage)
                    self.stdout.write(self.style.SUCCESS(f"  OK  {name} -> {photo.image.name}"))
                except Exception as exc:
                    failed += 1
                    self.stdout.write(self.style.ERROR(f"  ERRO {name}: {exc}"))

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run: nada foi alterado."))
            return

        self.stdout.write(self.style.SUCCESS(
            f"Convertidas: {converted} | Só variantes: {variants_only} | Já otimizadas: {skipped} | "
            f"Erros: {failed} | Espaço poupado: {saved_bytes / 1024 / 1024:.1f} MB"
        ))
