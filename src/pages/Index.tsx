import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Waves, TrendingUp, MapPin, Bell, Wind, Thermometer, Timer, Activity, Star, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedBeach, setSelectedBeach] = useState('praia-paiva');
  const navigate = useNavigate();

  const beaches = [
    { id: 'praia-paiva', name: 'Praia do Paiva' },
    { id: 'porto-de-galinhas', name: 'Porto de Galinhas' },
    { id: 'praia-cupe', name: 'Praia do Cupe' },
    { id: 'praia-pipa', name: 'Praia de Pipa' },
    { id: 'fernando-noronha', name: 'Fernando de Noronha' },
    { id: 'praia-maracaipe', name: 'Praia de Maracaípe' }
  ];

  const swellData = [
    { time: '06:00', height: 1.2, direction: 'SW', period: 8 },
    { time: '08:00', height: 1.8, direction: 'SW', period: 10 },
    { time: '10:00', height: 2.1, direction: 'S', period: 12 },
    { time: '12:00', height: 1.9, direction: 'S', period: 11 },
    { time: '14:00', height: 1.5, direction: 'SE', period: 9 },
    { time: '16:00', height: 1.8, direction: 'SE', period: 10 },
    { time: '18:00', height: 2.3, direction: 'S', period: 13 }
  ];

  // Corrija o nome do array para weeklyQualityData
  const weeklyForecast = [
    { day: 'Seg', quality: 3, height: 1.5 },
    { day: 'Ter', quality: 4, height: 2.1 },
    { day: 'Qua', quality: 5, height: 2.8 },
    { day: 'Qui', quality: 5, height: 3.2 },
    { day: 'Sex', quality: 4, height: 2.5 },
    { day: 'Sáb', quality: 3, height: 2.0 },
    { day: 'Dom', quality: 3, height: 1.8 }
  ];

  const currentConditions = {
    waveHeight: '2.1m',
    period: '12s',
    wind: '15 km/h NE',
    temperature: '28°C'
  };

  const getBeachName = () => {
    return beaches.find(beach => beach.id === selectedBeach)?.name || 'Praia do Futuro';
  };

  const surfConditions = [
    { name: 'Altura da Onda', value: '2.1m', icon: Waves, color: 'text-ocean-600' },
    { name: 'Período', value: '12s', icon: Activity, color: 'text-ocean-500' },
    { name: 'Vento', value: '15 km/h SW', icon: Wind, color: 'text-blue-600' },
    { name: 'Temperatura', value: '24°C', icon: Thermometer, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-600 min-h-screen flex items-center">
        <div className="absolute inset-0 wave-animation opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  Previsões de Ondas
                  <span className="block text-ocean-200">Baseadas em IA</span>
                </h1>
                <p className="text-xl text-ocean-100 max-w-lg">
                  Análise avançada de dados climáticos para encontrar as melhores condições de surf. 
                  Tecnologia de ponta para surfistas que buscam a onda perfeita.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-ocean-900 hover:bg-ocean-50 text-lg px-8 py-4">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white/10 text-lg px-8 py-4"
                >
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 text-ocean-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-sm">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm">Praias Monitoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm">Alertas em Tempo Real</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Waves className="h-5 w-5 mr-2 text-ocean-300" />
                      Condições Atuais - {getBeachName()}
                    </div>
                    <Select value={selectedBeach} onValueChange={setSelectedBeach}>
                      <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {beaches.map((beach) => (
                          <SelectItem key={beach.id} value={beach.id}>
                            {beach.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">2.1m</div>
                        <div className="text-ocean-200 text-sm">Altura</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">12s</div>
                        <div className="text-ocean-200 text-sm">Período</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">SW</div>
                        <div className="text-ocean-200 text-sm">Direção</div>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white text-center py-2 rounded-lg font-medium">
                      Condições Excelentes
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 text-center">
                    <Bell className="h-8 w-8 text-ocean-300 mx-auto mb-2" />
                    <div className="text-white font-medium">Alerta Ativo</div>
                    <div className="text-ocean-200 text-sm">Swell chegando em 2h</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-ocean-300 mx-auto mb-2" />
                    <div className="text-white font-medium">Tendência</div>
                    <div className="text-ocean-200 text-sm">Melhorando</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* Current Conditions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Condições Atuais - Praia do Futuro
            </h2>
            <p className="text-lg text-gray-600">
              Dados em tempo real das melhores praias do Brasil
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {surfConditions.map((condition, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <condition.icon className={`h-8 w-8 mx-auto mb-2 ${condition.color}`} />
                  <p className="text-2xl font-bold text-gray-900">{condition.value}</p>
                  <p className="text-sm text-gray-600">{condition.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-ocean-600" />
                  Previsão do Swell - Hoje
                </CardTitle>
                <CardDescription>
                  Altura das ondas ao longo do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={swellData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}m`, 'Altura']}
                      labelFormatter={(label) => `Horário: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="height" 
                      stroke="#0284c7" 
                      fill="url(#oceanGradient)" 
                    />
                    <defs>
                      <linearGradient id="oceanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Previsão Semanal
                </CardTitle>
                <CardDescription>
                  Qualidade das ondas (1-5 estrelas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'height' ? `${value}m` : `${value} estrelas`, 
                        name === 'height' ? 'Altura' : 'Qualidade'
                      ]}
                    />
                    <Bar dataKey="height" fill="#0284c7" />
                    <Bar dataKey="quality" fill="#eab308" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features + CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tecnologia Avançada para Surfistas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos dados meteorológicos, inteligência artificial e análise preditiva para oferecer as melhores previsões de surf do mercado.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Waves className="h-12 w-12 text-ocean-600 mb-4" />
                <CardTitle>Análise de Ondas em Tempo Real</CardTitle>
                <CardDescription>
                  Dados atualizados a cada hora com precisão de até 95% usando sensores oceânicos e satélites.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-ocean-600 mb-4" />
                <CardTitle>Mapeamento Inteligente</CardTitle>
                <CardDescription>
                  Visualize condições de surf em centenas de praias com indicadores de qualidade personalizados.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-ocean-600 mb-4" />
                <CardTitle>Recomendações Personalizadas</CardTitle>
                <CardDescription>
                  IA que aprende suas preferências e nível de habilidade para sugerir as melhores sessões.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA merged here, no colored background */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Pronto para Surfar as Melhores Ondas?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Junte-se a milhares de surfistas que já usam a DeepSurf para encontrar as condições perfeitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-ocean-800 hover:bg-blue-50 text-lg px-8 py-4"
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-ocean-800 text-ocean-800 bg-transparent hover:bg-ocean-50 text-lg px-8 py-4"
                onClick={() => navigate('/map')}
              >
                Explorar Mapa
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Embute o Footer no final */}
      <Footer />
    </div>
  );
};

export default Index;