import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from app.models import (
    CompanySettings, VehicleData, Customer, Logs, Messages, 
    FuelType, TransmissionType, TractionType, BodyStyle, Status
)

class Command(BaseCommand):
    help = 'Popula a base de dados com configurações iniciais e dados estáticos'

    def handle(self, *args, **options):
        self.stdout.write("⚠️  A iniciar configuração da Base de Dados...")

        # --- FASE 1: Limpeza (OPCIONAL - Cuidado em Produção!) ---
        # Se quiseres mesmo limpar tudo, descomenta as linhas abaixo.
        # self.stdout.write("🗑️  A limpar dados antigos...")
        # Logs.objects.all().delete()
        # Messages.objects.all().delete()
        # Customer.objects.all().delete()
        # VehicleData.objects.all().delete()
        # self.stdout.write("✅ Limpeza concluída.")

        self.stdout.write("🔐 A verificar superuser...")
        
        User = get_user_model()
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'velozconquista')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD') 

        if password and User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            self.stdout.write(f"✅ Password do utilizador '{username}' atualizada forçosamente!")
        else:
            self.stdout.write("⚠️ Não foi possível atualizar a password (variável em falta ou user não existe).")

        # --- FASE 2: Dados Estáticos (Combustíveis, Caixas, etc.) ---
        self.stdout.write("⚙️  A criar dados estáticos (Fuel, Transmission, etc)...")

        fuel_types = ["Diesel", "Gasolina", "Elétrico", "Híbrido (Gasolina)", "Híbrido (Diesel)", "GPL"]
        for name in fuel_types:
            FuelType.objects.get_or_create(name=name)

        transmissions = ["Manual", "Automática"]
        for name in transmissions:
            TransmissionType.objects.get_or_create(name=name)

        tractions = ["Dianteira", "Traseira", "Integral"]
        for name in tractions:
            TractionType.objects.get_or_create(name=name)

        body_styles = ["Cabrio", "Carrinha", "Citadino", "Coupé", "Monovolume", "Pequeno Citadino", "Sedan", "SUV / TT", "Utilitário"]
        for name in body_styles:
            BodyStyle.objects.get_or_create(name=name)

        statuses = ["Disponível", "Reservado", "Vendido"]
        for name in statuses:
            Status.objects.get_or_create(name=name)

        self.stdout.write("✅ Dados estáticos criados.")

        # --- FASE 3: Configuração da Empresa ---
        self.stdout.write("🏢 A configurar Veloz Conquista...")
        
        # update_or_create: Se já existir (id=1), atualiza os dados. Se não, cria.
        settings, created = CompanySettings.objects.update_or_create(
            pk=1,
            defaults={
                "name": "Veloz Conquista",
                "description": "A Veloz Conquista é uma empresa do setor automóvel...",
                "phone": "918 630 374",
                "email": "velozconquista@gmail.com",
                "address": "Estrada De Santa Eulalia 1, Ponte De Lousa, 2670-351 Loures",
                "facebook_url": "https://www.facebook.com/velozconquistalda",
                "instagram_url": "https://www.instagram.com/velozconquista/"
            }
        )
        
        self.stdout.write(f"✅ Sucesso! Empresa '{settings.name}' configurada.")