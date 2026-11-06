from django.db import migrations

OLD = "Em Preparação"
NEW = "Em Preparação / Oficina"


def rename(apps, schema_editor):
    # Os estados não têm ecrã de edição no back-office, por isso o nome muda aqui
    Status = apps.get_model('app', 'Status')
    Status.objects.filter(name__iexact=OLD).update(name=NEW)


def undo(apps, schema_editor):
    Status = apps.get_model('app', 'Status')
    Status.objects.filter(name=NEW).update(name=OLD)


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_sale_commission'),
    ]

    operations = [
        migrations.RunPython(rename, undo),
    ]
