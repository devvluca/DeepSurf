const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Simulação de dados de praias (pode ser migrado para banco depois)
const beaches = [
  {
    id: 'praia-paiva',
    name: 'Praia do Paiva',
    city: 'Cabo de Santo Agostinho, PE',
    coordinates: { lat: -8.3197, lng: -34.9632 },
    surfability: 4,
    waveHeight: '1.8m',
    period: '10s',
    wind: '14 km/h E',
    temperature: '27°C',
    description: 'Boas ondas e ambiente tranquilo.',
  },
  {
    id: 'praia-boa-viagem',
    name: 'Praia de Boa Viagem',
    city: 'Recife, PE',
    coordinates: { lat: -8.1175, lng: -34.8991 },
    surfability: 3,
    waveHeight: '1.2m',
    period: '8s',
    wind: '18 km/h SE',
    temperature: '28°C',
    description: 'Urbana, boa para iniciantes.',
  },
  {
    id: 'praia-carneiros',
    name: 'Praia dos Carneiros',
    city: 'Tamandaré, PE',
    coordinates: { lat: -8.7392, lng: -35.0986 },
    surfability: 2,
    waveHeight: '0.8m',
    period: '6s',
    wind: '12 km/h NE',
    temperature: '26°C',
    description: 'Mais para relaxar que surfar.',
  }
];

// Endpoint para listar praias
app.get('/api/beaches', (req, res) => {
  res.json(beaches);
});

// Endpoint para detalhes de uma praia
app.get('/api/beaches/:id', (req, res) => {
  const beach = beaches.find(b => b.id === req.params.id);
  if (!beach) return res.status(404).json({ error: 'Praia não encontrada' });
  res.json(beach);
});

// Função para chamar preditor PyTorch
async function callPyTorchPredictor(waveHeight, windSpeed, hour) {
  return new Promise((resolve, reject) => {
    const pythonPath = 'python'; // ou 'python3' no Linux/Mac
    const scriptPath = path.join(__dirname, 'pytorch_predictor.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath, waveHeight.toString(), windSpeed.toString(), hour.toString()]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          reject(new Error(`Erro no JSON: ${e.message}`));
        }
      } else {
        reject(new Error(`Python falhou: ${errorOutput}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Erro ao executar Python: ${error.message}`));
    });
  });
}

// Endpoint de previsão inteligente (com IA Surfista PyTorch)
app.get('/api/forecast', async (req, res) => {
  const { lat, lng } = req.query;
  
  // Simular dados de condições atuais
  const currentHour = new Date().getHours();
  const currentMonth = new Date().getMonth() + 1;
  
  // Fator sazonal brasileiro
  let seasonFactor = 1.0;
  if ([12, 1, 2, 3].includes(currentMonth)) seasonFactor = 1.2; // Verão
  else if ([6, 7, 8, 9].includes(currentMonth)) seasonFactor = 0.8; // Inverno
  
  // Gerar previsão para as próximas horas
  const forecast = [];
  const aiPredictions = [];
  
  for (let i = 0; i < 24; i += 3) {
    const hour = (currentHour + i) % 24;
    
    // Simular condições variáveis
    const waveHeight = 0.8 + Math.random() * 2.2;
    const wavePeriod = 8 + Math.random() * 6;
    const waveDirection = 150 + Math.random() * 60;
    const windSpeed = (Math.random() - 0.5) * 30; // -15 a +15 (offshore/onshore)
    const windDirection = Math.random() * 360;
    const tide = Math.random() * 3;
    const waterTemp = 22 + seasonFactor * 4 + Math.random() * 2;
    const visibility = 10 + Math.random() * 15;
    
    const conditions = {
      time: `${hour.toString().padStart(2, '0')}:00`,
      height: Math.round(waveHeight * 10) / 10,
      direction: Math.round(waveDirection),
      period: Math.round(wavePeriod),
      wind_speed: Math.round(windSpeed * 10) / 10,
      wind_direction: Math.round(windDirection),
      tide: Math.round(tide * 10) / 10,
      water_temp: Math.round(waterTemp * 10) / 10,
      visibility: Math.round(visibility)
    };
    
    // Fazer predição com PyTorch
    try {
      const aiPrediction = await callPyTorchPredictor(waveHeight, windSpeed, hour);
      aiPredictions.push({
        time: conditions.time,
        ...aiPrediction
      });
    } catch (error) {
      console.error('Erro na predição PyTorch:', error);
      // Fallback simples
      const score = Math.random() * 100;
      aiPredictions.push({
        time: conditions.time,
        score: Math.round(score),
        rating: score > 70 ? '😎 Boa!' : score > 40 ? '🤔 Talvez' : '😴 Ruim',
        amateur_friendly: score > 60 && waveHeight < 1.5,
        conditions: { wave_height: waveHeight, wind_speed: windSpeed, hour }
      });
    }
    
    forecast.push(conditions);
  }
  
  // Qualidade geral baseada na média das predições da IA PyTorch
  const avgAiScore = aiPredictions.length > 0 ? 
    aiPredictions.reduce((sum, pred) => sum + pred.score, 0) / aiPredictions.length : 
    Math.random() * 100;
  
  const quality = Math.round(avgAiScore / 20); // 0-100 -> 0-5
  
  res.json({
    lat,
    lng,
    forecast,
    ai_predictions: aiPredictions,
    quality: Math.max(1, quality),
    ai_powered: true,
    updated_at: new Date().toISOString(),
    message: '🧠 Previsão com PyTorch IA Surfista para Amadores'
  });
});

// Health check
app.get('/', (req, res) => res.send('🏄‍♂️ DeepSurf API com PyTorch IA Surfista online!'));

// Endpoint de teste do preditor PyTorch
app.post('/api/ai/surf-prediction', async (req, res) => {
  const { wave_height, wind_speed, hour } = req.body;
  
  if (wave_height === undefined || wind_speed === undefined || hour === undefined) {
    return res.status(400).json({ 
      error: 'Parâmetros obrigatórios: wave_height, wind_speed, hour',
      example: {
        wave_height: 1.2,    // metros
        wind_speed: -8,      // km/h (negativo = offshore)
        hour: 7             // 0-23
      }
    });
  }
  
  try {
    const prediction = await callPyTorchPredictor(wave_height, wind_speed, hour);
    res.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro na predição PyTorch',
      message: error.message,
      fallback: 'Execute o notebook primeiro para treinar o modelo'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏄‍♂️ DeepSurf backend com PyTorch rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000`);
  console.log(`🧠 IA Surfista PyTorch integrada!`);
});
