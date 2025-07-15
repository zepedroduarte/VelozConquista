import os
from django.utils.text import slugify

def vehicle_image_upload_path(instance, filename):
    vehicle_data = instance.vehicle_data 
    make = slugify(vehicle_data.make)
    model = slugify(vehicle_data.model)
    license_plate = slugify(vehicle_data.license_plate)

    ext = os.path.splitext(filename)[1]
    new_filename = f"{make}_{model}_{license_plate}{ext}"
    return f"vehicle_images/{make}_{model}_{license_plate}/{new_filename}"
