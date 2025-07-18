"""
Web Scraper SIMPLES do Surf Guru
Pega dados reais de surf do Brasil
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json

class SurfGuruScraper:
    def __init__(self):
        self.base_url = "https://www.surfguru.com.br"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def get_spot_data(self, spot_name="rio-de-janeiro"):
        """
        Pega dados básicos de um spot
        """
        try:
            url = f"{self.base_url}/previsao-surf/{spot_name}"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Tentar extrair dados básicos
                data = {
                    'wave_height': self._extract_wave_height(soup),
                    'wind_speed': self._extract_wind_speed(soup),
                    'wind_direction': self._extract_wind_direction(soup),
                    'quality': self._extract_quality(soup),
                    'timestamp': time.strftime('%Y-%m-%d %H:%M')
                }
                
                return data
            else:
                print(f"Erro ao acessar {url}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Erro no scraping: {e}")
            return None
    
    def _extract_wave_height(self, soup):
        """Extrai altura das ondas"""
        try:
            # Procurar por elementos que contenham altura
            wave_elements = soup.find_all(text=lambda x: x and 'm' in str(x))
            for element in wave_elements:
                if any(char.isdigit() for char in element):
                    # Extrair número seguido de 'm'
                    import re
                    match = re.search(r'(\d+\.?\d*)\s*m', element)
                    if match:
                        return float(match.group(1))
            return 1.0  # Default
        except:
            return 1.0
    
    def _extract_wind_speed(self, soup):
        """Extrai velocidade do vento"""
        try:
            # Procurar por km/h
            wind_elements = soup.find_all(text=lambda x: x and 'km/h' in str(x))
            for element in wind_elements:
                import re
                match = re.search(r'(\d+)\s*km/h', element)
                if match:
                    return int(match.group(1))
            return 10  # Default
        except:
            return 10
    
    def _extract_wind_direction(self, soup):
        """Extrai direção do vento"""
        try:
            # Procurar por direções como NE, SW, etc.
            directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
            for direction in directions:
                if soup.find(text=lambda x: x and direction in str(x)):
                    # Converter para offshore/onshore simplificado
                    if direction in ['NE', 'E', 'SE']:
                        return 'offshore'  # Bom para a costa brasileira
                    else:
                        return 'onshore'   # Ruim
            return 'offshore'  # Default otimista
        except:
            return 'offshore'
    
    def _extract_quality(self, soup):
        """Extrai qualidade geral"""
        try:
            # Procurar por estrelas ou qualidade
            quality_indicators = ['excelente', 'bom', 'regular', 'ruim']
            text = soup.get_text().lower()
            
            for i, indicator in enumerate(quality_indicators):
                if indicator in text:
                    return len(quality_indicators) - i  # 4=excelente, 1=ruim
            
            return 2  # Default médio
        except:
            return 2

def simulate_surf_guru_data():
    """
    Simula dados do Surf Guru para desenvolvimento
    (use quando não conseguir fazer scraping real)
    """
    import random
    import numpy as np
    
    spots = ['rio-de-janeiro', 'florianopolis', 'salvador', 'fortaleza', 'natal']
    data = []
    
    for _ in range(50):  # 50 medições simuladas
        spot_data = {
            'spot': random.choice(spots),
            'wave_height': round(np.random.normal(1.2, 0.4), 1),
            'wind_speed': random.randint(5, 25),
            'wind_direction': random.choice(['offshore', 'onshore']),
            'quality': random.randint(1, 4),
            'hour': random.randint(6, 18),
            'timestamp': f"2025-07-{random.randint(10, 20)} {random.randint(6, 18):02d}:00"
        }
        
        # Lógica simples: surfista amador gosta de...
        should_surf = 0
        
        # Ondas pequenas a médias
        if 0.5 <= spot_data['wave_height'] <= 1.8:
            should_surf += 1
            
        # Vento offshore
        if spot_data['wind_direction'] == 'offshore':
            should_surf += 1
            
        # Vento não muito forte
        if spot_data['wind_speed'] <= 15:
            should_surf += 1
            
        # Manhã
        if 6 <= spot_data['hour'] <= 10:
            should_surf += 1
        
        spot_data['should_surf'] = 1 if should_surf >= 2 else 0
        data.append(spot_data)
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Teste simples
    scraper = SurfGuruScraper()
    
    print("🌊 Testando scraper do Surf Guru...")
    
    # Tentar scraping real
    data = scraper.get_spot_data("rio-de-janeiro")
    
    if data:
        print("✅ Dados obtidos:")
        for key, value in data.items():
            print(f"   {key}: {value}")
    else:
        print("⚠️ Scraping real falhou, usando dados simulados...")
        df = simulate_surf_guru_data()
        print(f"📊 {len(df)} registros simulados criados")
        print(df.head())
