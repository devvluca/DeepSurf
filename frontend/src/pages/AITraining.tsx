import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Activity, Waves, ArrowLeft, Play, Pause, RotateCcw, Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const AITrainingPage = () => {
  const navigate = useNavigate();
  
  const [aiData, setAiData] = useState({
    isTraining: false,
    epoch: 0,
    loss: 0.8,
    accuracy: 0.65,
    predictions: [] as any[],
    realTimeConditions: {
      waveHeight: 1.2,
      wind: 8,
      hour: 9,
      probability: 0.73
    }
  });

  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);

  // Simular treinamento da IA em tempo real
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (aiData.isTraining) {
      interval = setInterval(() => {
        setAiData(prev => {
          const newEpoch = prev.epoch + 1;
          const newLoss = Math.max(0.05, prev.loss - Math.random() * 0.015);
          const newAccuracy = Math.min(0.98, prev.accuracy + Math.random() * 0.008);
          
          // Atualizar histórico de treinamento
          setTrainingHistory(current => [
            ...current.slice(-49), // Manter últimos 50 pontos
            {
              epoch: newEpoch,
              loss: newLoss,
              accuracy: newAccuracy,
              time: new Date().toLocaleTimeString()
            }
          ]);
          
          return {
            ...prev,
            epoch: newEpoch,
            loss: newLoss,
            accuracy: newAccuracy,
            isTraining: newEpoch < 100,
            predictions: [
              ...prev.predictions.slice(-9),
              {
                time: new Date().toLocaleTimeString(),
                probability: 0.3 + Math.random() * 0.7,
                shouldSurf: Math.random() > 0.5,
                conditions: {
                  waveHeight: 0.5 + Math.random() * 2,
                  wind: -15 + Math.random() * 30,
                  hour: Math.floor(Math.random() * 24)
                }
              }
            ]
          };
        });
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [aiData.isTraining]);

  const startTraining = () => {
    setAiData(prev => ({ ...prev, isTraining: true }));
  };

  const stopTraining = () => {
    setAiData(prev => ({ ...prev, isTraining: false }));
  };

  const resetTraining = () => {
    setAiData({
      isTraining: false,
      epoch: 0,
      loss: 0.8,
      accuracy: 0.65,
      predictions: [],
      realTimeConditions: {
        waveHeight: 1.2,
        wind: 8,
        hour: 9,
        probability: 0.73
      }
    });
    setTrainingHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Button 
              variant="outline"
              className="mb-6 bg-ocean-900 text-white border-ocean-700 hover:bg-ocean-800 hover:border-ocean-600"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
            
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-ocean-300 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                IA Surfista em Ação
              </h1>
              <Zap className="h-12 w-12 text-yellow-300 ml-4 animate-pulse" />
            </div>
            <p className="text-xl text-ocean-100 max-w-3xl mx-auto">
              Veja nossa inteligência artificial PyTorch aprendendo a prever as melhores condições de surf em tempo real. 
              Um modelo simples e educativo feito especialmente para surfistas amadores.
            </p>
          </div>

          {/* Controles de Treinamento */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              onClick={startTraining}
              disabled={aiData.isTraining}
              className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600 disabled:text-gray-300 px-6 py-3 font-semibold"
            >
              <Play className="h-4 w-4 mr-2" />
              {aiData.epoch === 0 ? 'Iniciar Treinamento' : 'Continuar'}
            </Button>
            <Button 
              onClick={stopTraining}
              disabled={!aiData.isTraining}
              variant="outline"
              className="bg-ocean-900 text-white border-ocean-700 hover:bg-ocean-800 hover:border-ocean-600 disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400 px-6 py-3 font-semibold"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
            <Button 
              onClick={resetTraining}
              variant="outline"
              className="bg-ocean-900 text-white border-ocean-700 hover:bg-ocean-800 hover:border-ocean-600 px-6 py-3 font-semibold"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Principal */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Status da IA */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Brain className="h-5 w-5 mr-2 text-ocean-300" />
                  Status da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-ocean-100">Estado:</span>
                  <Badge className={aiData.isTraining ? "bg-yellow-500" : "bg-green-500"}>
                    {aiData.isTraining ? "Treinando" : "Pronta"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-100">Época:</span>
                  <span className="text-white font-mono">{aiData.epoch}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-100">Precisão:</span>
                  <span className="text-green-400 font-mono">{(aiData.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ocean-100">Loss:</span>
                  <span className="text-blue-400 font-mono">{aiData.loss.toFixed(3)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Predição Atual */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Waves className="h-5 w-5 mr-2 text-ocean-300" />
                  Predição Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {(aiData.realTimeConditions.probability * 100).toFixed(0)}%
                  </div>
                  <div className="text-ocean-100 text-sm">
                    Probabilidade de Surfar
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ocean-100">Ondas: {aiData.realTimeConditions.waveHeight}m</span>
                    <span className="text-ocean-100">Vento: {aiData.realTimeConditions.wind}km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ocean-100">Hora: {aiData.realTimeConditions.hour}h</span>
                    <Badge className={aiData.realTimeConditions.probability > 0.6 ? "bg-green-500" : "bg-red-500"}>
                      {aiData.realTimeConditions.probability > 0.6 ? "Vai!" : "Não vai"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas do Modelo */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="h-5 w-5 mr-2 text-ocean-300" />
                  Arquitetura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-ocean-300">PyTorch</div>
                    <div className="text-xs text-ocean-100">Framework</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">3</div>
                    <div className="text-xs text-ocean-100">Features</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">10</div>
                    <div className="text-xs text-ocean-100">Neurônios</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">ReLU</div>
                    <div className="text-xs text-ocean-100">Ativação</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Zap className="h-5 w-5 mr-2 text-yellow-300" />
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ocean-100">Época</span>
                    <span className="text-white">{aiData.epoch}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-ocean-500 to-ocean-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${aiData.epoch}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ocean-100">Precisão</span>
                    <span className="text-white">{(aiData.accuracy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${aiData.accuracy * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Treinamento */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="text-white">Progresso do Treinamento</CardTitle>
                <CardDescription className="text-ocean-100">
                  Evolução da precisão e loss em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,230,253,0.2)" />
                    <XAxis dataKey="epoch" tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(12,74,110,0.9)', 
                        border: '1px solid rgba(186,230,253,0.3)', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Precisão" />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} name="Loss" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Predições Recentes */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="text-white">Predições em Tempo Real</CardTitle>
                <CardDescription className="text-ocean-100">
                  Últimas predições da IA para condições de surf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {aiData.predictions.slice(-8).reverse().map((pred, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-ocean-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${pred.shouldSurf ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white text-sm font-mono">{pred.time}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{(pred.probability * 100).toFixed(0)}%</div>
                        <div className="text-xs text-ocean-100">
                          {pred.shouldSurf ? "Surfar" : "Não surfar"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {aiData.predictions.length === 0 && (
                    <div className="text-center text-ocean-100 py-8">
                      Inicie o treinamento para ver as predições
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info da IA */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-ocean-800/40 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Brain className="h-5 w-5 text-ocean-300" />
              <span className="text-white text-sm">
                IA treinada com <strong>PyTorch</strong> • Modelo simples para surfistas amadores
              </span>
              <Zap className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
            
            <div className="max-w-3xl mx-auto text-ocean-100">
              <p className="mb-4">
                <strong>Como funciona:</strong> Nossa IA usa apenas 3 features simples (altura da onda, vento e hora do dia) 
                para prever se vale a pena surfar. É um modelo educativo que mostra como o deep learning pode ser aplicado 
                de forma prática no surf.
              </p>
              <p>
                <strong>Para amadores:</strong> Focamos em ondas pequenas (0.5-2m) e condições offshore, 
                perfeitas para quem está começando no surf ou prefere sessões mais tranquilas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AITrainingPage;
