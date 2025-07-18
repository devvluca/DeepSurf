#!/usr/bin/env python3
"""
PyTorch Surf Predictor para Backend Node.js
Sistema simples para surfistas amadores
"""

import torch
import torch.nn as nn
import numpy as np
import json
import sys
from datetime import datetime

class SimpleSurferAI(nn.Module):
    """IA Surfista Simples - PyTorch para amadores"""
    
    def __init__(self):
        super(SimpleSurferAI, self).__init__()
        self.fc1 = nn.Linear(3, 10)
        self.fc2 = nn.Linear(10, 5) 
        self.fc3 = nn.Linear(5, 1)
        self.relu = nn.ReLU()
        self.sigmoid = nn.Sigmoid()
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.sigmoid(self.fc3(x))
        return x

class SurfPredictor:
    """Preditor de Surf para Backend"""
    
    def __init__(self, model_path='surfer_ai_model.pth'):
        self.model = SimpleSurferAI()
        self.model_path = model_path
        self.load_model()
        
    def load_model(self):
        """Carrega modelo treinado"""
        try:
            self.model.load_state_dict(torch.load(self.model_path, map_location='cpu'))
            self.model.eval()
            # print(f"Modelo carregado: {self.model_path}")  # Comentado para não atrapalhar JSON
        except FileNotFoundError:
            # print(f"Modelo nao encontrado: {self.model_path}")  # Comentado
            # print("Execute o notebook primeiro para treinar!")  # Comentado
            pass
            
    def predict(self, wave_height, wind_speed, hour_of_day):
        """
        Predição simples para amadores
        
        Args:
            wave_height: Altura da onda (0.3-2.0m ideal para amadores)
            wind_speed: Velocidade do vento (negativo = offshore)
            hour_of_day: Hora do dia (6-18 melhor luz)
        """
        # Normalizar dados
        wave_norm = wave_height / 3.0  # Máx 3m
        wind_norm = (wind_speed + 20) / 40  # -20 a +20
        hour_norm = hour_of_day / 24.0  # 0-24h
        
        # Tensor de entrada
        features = torch.tensor([wave_norm, wind_norm, hour_norm], dtype=torch.float32)
        
        with torch.no_grad():
            prediction = self.model(features.unsqueeze(0))
            score = prediction.item()
            
        return {
            'score': round(score * 100, 1),  # 0-100%
            'rating': self.get_rating(score),
            'amateur_friendly': score > 0.6 and wave_height < 1.5,
            'conditions': {
                'wave_height': wave_height,
                'wind_speed': wind_speed,
                'hour': hour_of_day
            },
            'tips': self.get_amateur_tips(wave_height, wind_speed, hour_of_day)
        }
    
    def get_rating(self, score):
        """Rating para amadores"""
        if score >= 0.8:
            return "Perfeito para amadores!"
        elif score >= 0.6:
            return "Boa para praticar!"
        elif score >= 0.4:
            return "Talvez..."
        else:
            return "Melhor ficar em casa"
    
    def get_amateur_tips(self, wave_height, wind_speed, hour_of_day):
        """Dicas para surfistas amadores"""
        tips = []
        
        if wave_height < 0.5:
            tips.append("Ondas pequenas: perfeito para iniciantes!")
        elif wave_height > 1.5:
            tips.append("Ondas grandes: cuidado se for iniciante")
            
        if wind_speed < -5:
            tips.append("Terral forte: condicoes limpas!")
        elif wind_speed > 10:
            tips.append("Vento onshore: ondas baguncadas")
            
        if 6 <= hour_of_day <= 9:
            tips.append("Manha cedo: menos crowd!")
        elif 16 <= hour_of_day <= 18:
            tips.append("Final da tarde: luz dourada!")
            
        return tips

def main():
    """Função principal para chamada do Node.js"""
    try:
        # Receber dados do Node.js via argumentos
        if len(sys.argv) != 4:
            raise ValueError("Uso: python pytorch_predictor.py <wave_height> <wind_speed> <hour>")
            
        wave_height = float(sys.argv[1])
        wind_speed = float(sys.argv[2])
        hour_of_day = int(sys.argv[3])
        
        # Fazer predição
        predictor = SurfPredictor()
        result = predictor.predict(wave_height, wind_speed, hour_of_day)
        
        # Retornar JSON para Node.js
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'score': 0,
            'rating': 'Erro na predicao',
            'amateur_friendly': False
        }
        print(json.dumps(error_result, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
