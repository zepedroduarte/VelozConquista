import os
from django.utils.text import slugify

def vehicle_image_upload_path(instance, filename):
    make = instance.vehicle_data.make
    model = instance.vehicle_data.model
    plate = instance.vehicle_data.license_plate
    
    safe_make = slugify(make)
    safe_model = slugify(model)
    safe_plate = slugify(plate)
    
    name, ext = os.path.splitext(filename)
    
    safe_filename = slugify(name)
    
    return f"vehicles/{safe_make}-{safe_model}-{safe_plate}/{safe_filename}{ext}"
