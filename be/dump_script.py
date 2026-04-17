import os
import django
from django.core.management import call_command

os.environ['DATABASE_URL'] = 'sqlite:///db.sqlite3'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'be.settings')
django.setup()

with open('datadump.json', 'w', encoding='utf-8') as f:
    call_command(
        'dumpdata', 
        format='json', 
        indent=4, 
        use_natural_foreign_keys=True, 
        exclude=['contenttypes', 'auth.Permission'], 
        stdout=f
    )
print("Dump completed perfectly.")
