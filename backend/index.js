const express = require('express');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node');
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
  // ...adicione as demais praias aqui, igual ao seu Map.tsx...
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

// Endpoint de previsão (simulado, pronto para integrar ML ou APIs externas)
app.get('/api/forecast', (req, res) => {
  // Exemplo: integrar OpenWeather, Surfline, TensorFlow, etc.
  // Aqui retorna dados mockados
  const { lat, lng } = req.query;
  res.json({
    lat,
    lng,
    forecast: [
      { time: '06:00', height: 1.2, direction: 'SW', period: 8 },
      { time: '08:00', height: 1.8, direction: 'SW', period: 10 },
      { time: '10:00', height: 2.1, direction: 'S', period: 12 },
      // ...mais dados...
    ],
    quality: Math.floor(Math.random() * 5) + 1,
    updatedAt: new Date().toISOString(),
  });
});

// Health check
app.get('/', (req, res) => res.send('DeepSurf API online'));

let mlModel = null;

// Carrega o modelo TensorFlow.js ao iniciar o servidor
async function loadModel() {
  const modelPath = path.join(__dirname, 'ml', 'model', 'model.json');
  try {
    mlModel = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Modelo TensorFlow carregado!');
  } catch (err) {
    console.warn('Não foi possível carregar o modelo TensorFlow:', err.message);
  }
}
loadModel();

// Endpoint de previsão com ML (exemplo)
app.post('/api/ml/predict', async (req, res) => {
  if (!mlModel) {
    return res.status(503).json({ error: 'Modelo ML não carregado' });
  }
  // Espera receber features no body, ex: { features: [altura, periodo, vento, ...] }
  const { features } = req.body;
  if (!features || !Array.isArray(features)) {
    return res.status(400).json({ error: 'Envie um array features no body' });
  }
  try {
    const input = tf.tensor2d([features]);
    const prediction = mlModel.predict(input);
    const output = prediction.dataSync();
    res.json({ prediction: output[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao prever com TensorFlow', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`DeepSurf backend rodando em http://localhost:${PORT}`);
});
