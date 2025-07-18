#!/usr/bin/env python3
"""
Script simples para treinar o modelo PyTorch IA Surfista
"""

import torch
import torch.nn as nn
import numpy as np
import pandas as pd
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

def generate_training_data(n_samples=1000):
    """Gera dados sintéticos para treinamento"""
    np.random.seed(42)
    
    # Features: wave_height, wind_speed, hour_of_day
    wave_height = np.random.uniform(0.3, 2.5, n_samples)  # 0.3m a 2.5m
    wind_speed = np.random.uniform(-20, 20, n_samples)    # -20 a +20 km/h
    hour_of_day = np.random.randint(6, 20, n_samples)     # 6h às 19h
    
    # Target: should_surf (baseado em regras simples para amadores)
    should_surf = []
    for i in range(n_samples):
        score = 0
        
        # Ondas ideais para amadores: 0.5m a 1.5m
        if 0.5 <= wave_height[i] <= 1.5:
            score += 0.4
        elif wave_height[i] < 0.5:
            score += 0.1  # Muito pequena
        else:
            score += 0.2  # Muito grande para amador
            
        # Vento offshore é melhor (negativo)
        if wind_speed[i] < -5:
            score += 0.3  # Terral forte
        elif -5 <= wind_speed[i] <= 5:
            score += 0.2  # Vento leve
        else:
            score += 0.1  # Onshore
            
        # Horários melhores: manhã cedo e final da tarde
        if 6 <= hour_of_day[i] <= 9 or 16 <= hour_of_day[i] <= 18:
            score += 0.3
        else:
            score += 0.1
            
        # Adicionar ruído
        score += np.random.normal(0, 0.1)
        score = max(0, min(1, score))  # Clamp entre 0 e 1
        
        should_surf.append(score)
    
    return np.column_stack([wave_height, wind_speed, hour_of_day]), np.array(should_surf)

def train_model():
    """Treina o modelo e salva"""
    print("🏄‍♂️ Iniciando treinamento da IA Surfista...")
    
    # Gerar dados
    X, y = generate_training_data(1000)
    
    # Normalizar features
    X_norm = X.copy()
    X_norm[:, 0] = X_norm[:, 0] / 3.0  # wave_height / 3.0
    X_norm[:, 1] = (X_norm[:, 1] + 20) / 40  # wind_speed normalizado
    X_norm[:, 2] = X_norm[:, 2] / 24.0  # hour / 24.0
    
    # Converter para tensores
    X_tensor = torch.tensor(X_norm, dtype=torch.float32)
    y_tensor = torch.tensor(y, dtype=torch.float32).unsqueeze(1)
    
    # Criar modelo
    model = SimpleSurferAI()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # Treinamento
    epochs = 100
    print(f"📚 Treinando por {epochs} épocas...")
    
    for epoch in range(epochs):
        # Forward pass
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 20 == 0:
            print(f"Época {epoch+1}/{epochs}, Loss: {loss.item():.4f}")
    
    # Salvar modelo
    model_path = 'surfer_ai_model.pth'
    torch.save(model.state_dict(), model_path)
    print(f"✅ Modelo salvo em: {model_path}")
    
    # Teste rápido
    test_wave = 1.2  # 1.2m
    test_wind = -8   # -8 km/h (offshore)
    test_hour = 7    # 7h da manhã
    
    test_input = torch.tensor([test_wave/3.0, (test_wind+20)/40, test_hour/24.0], dtype=torch.float32).unsqueeze(0)
    
    model.eval()
    with torch.no_grad():
        prediction = model(test_input)
        print(f"🧠 Teste: Ondas {test_wave}m, Vento {test_wind}km/h, {test_hour}h")
        print(f"📊 Probabilidade de surfar: {prediction.item()*100:.1f}%")
    
    print("🚀 Modelo pronto para uso!")

if __name__ == '__main__':
    train_model()
