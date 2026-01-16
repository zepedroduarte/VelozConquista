import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'be.settings')
django.setup()

from app.models import CompanySettings, VehicleData, Customer, Logs, Messages

def run():
    # print("⚠️  A iniciar limpeza e configuração da Base de Dados...")

    # Logs.objects.all().delete()
    # Messages.objects.all().delete()
    # Customer.objects.all().delete()
    # VehicleData.objects.all().delete()
    
    # print("✅ Limpeza concluída.")

    print("⚙️  A configurar empresa...")
    
    settings, created = CompanySettings.objects.get_or_create(pk=1)
    
    settings.name = "Veloz Conquista"
    settings.description = "A Veloz Conquista é uma empresa do setor automóvel, especializada no comércio de viaturas semi-novas e usadas. Com sede na Ponte de Lousa, em Loures, a Veloz Conquista conta com profissionais com elevado know-how da área de negócio, oferecendo propostas de valor competitivas, bem como a possibilidade de financiamento e todo o apoio na sua intermediação."
    settings.phone = "918 630 374"
    settings.email = "velozconquista@gmail.com"
    settings.address = "Estrada De Santa Eulalia 1, Ponte De Lousa, 2670-351 Loures"
    settings.facebook_url = "https://www.facebook.com/velozconquistalda"
    settings.instagram_url = "https://www.instagram.com/velozconquista/"
    
    settings.save()
    
    print(f"✅ Sucesso! Empresa '{settings.name}' configurada.")

if __name__ == '__main__':
    run()