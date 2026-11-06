from django.db import migrations, models


def set_founded_year(apps, schema_editor):
    # O stand abriu em 2014 (12 anos em 2026); pode ser corrigido nas Definições do admin
    CompanySettings = apps.get_model('app', 'CompanySettings')
    CompanySettings.objects.filter(founded_year__isnull=True).update(founded_year=2014)


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0011_rename_preparation_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='companysettings',
            name='founded_year',
            field=models.PositiveSmallIntegerField(blank=True, null=True, verbose_name='Ano de abertura'),
        ),
        migrations.RunPython(set_founded_year, migrations.RunPython.noop),
    ]
