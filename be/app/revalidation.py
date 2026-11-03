"""
On-demand ISR revalidation.

Whenever content changes (via the API or the Django admin) we tell the Next.js
frontend which cache tags are stale, so the public site is updated within seconds
while visitors keep getting static pages served from the Vercel CDN.

Required environment variables:
    FRONTEND_REVALIDATE_URL  e.g. https://veloz-conquista.vercel.app/api/revalidate
    REVALIDATE_SECRET        same value as on Vercel
"""
import logging
import os
import threading

import requests
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import (
    BodyStyle, CompanySettings, FuelType, LegalInfo, Status, TractionType,
    TransmissionType, Vehicle, VehicleData, VehicleImage,
)

logger = logging.getLogger(__name__)

TAG_VEHICLES = "vehicles"
TAG_COMPANY = "company"
TAG_ATTRIBUTES = "vehicle-attributes"
TAG_LEGAL = "legal"

# model -> tags that become stale when it changes
MODEL_TAGS = {
    Vehicle: [TAG_VEHICLES],
    VehicleData: [TAG_VEHICLES],
    VehicleImage: [TAG_VEHICLES],
    CompanySettings: [TAG_COMPANY],
    LegalInfo: [TAG_LEGAL],
    BodyStyle: [TAG_ATTRIBUTES, TAG_VEHICLES],
    FuelType: [TAG_ATTRIBUTES, TAG_VEHICLES],
    TransmissionType: [TAG_ATTRIBUTES, TAG_VEHICLES],
    TractionType: [TAG_ATTRIBUTES, TAG_VEHICLES],
    Status: [TAG_ATTRIBUTES, TAG_VEHICLES],
}

_pending = threading.local()


def _send(tags):
    url = os.getenv("FRONTEND_REVALIDATE_URL")
    secret = os.getenv("REVALIDATE_SECRET")
    if not url or not secret:
        return

    try:
        response = requests.post(
            url,
            json={"tags": sorted(tags)},
            headers={"x-revalidate-secret": secret},
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        # Never break the admin because of the frontend; the hourly ISR fallback covers it.
        logger.warning("Revalidation failed for %s: %s", tags, exc)


def _flush():
    tags = getattr(_pending, "tags", set())
    _pending.tags = set()
    if tags:
        threading.Thread(target=_send, args=(tags,), daemon=True).start()


def request_revalidation(*tags):
    """Queue tags and send them once, after the current DB transaction commits."""
    first_in_batch = not getattr(_pending, "tags", None)
    if first_in_batch:
        _pending.tags = set()
    _pending.tags.update(tags)
    # Outside a transaction on_commit runs immediately, so register it after queueing the tags.
    if first_in_batch:
        transaction.on_commit(_flush)


@receiver(post_save)
@receiver(post_delete)
def revalidate_on_change(sender, **kwargs):
    tags = MODEL_TAGS.get(sender)
    if tags:
        request_revalidation(*tags)
