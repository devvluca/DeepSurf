import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ArrowRight, Waves, TrendingUp, MapPin, Bell, Wind, Thermometer, Activity, Star, Users, ArrowUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Função para converter direção textual para ângulo (graus)
function directionToDegrees(direction: string) {
  switch (direction) {
    case 'N': return 0;
    case 'NE': return 45;
    case 'E': return 90;
    case 'SE': return 135;
    case 'S': return 180;
    case 'SW': return 225;
    case 'W': return 270;
    case 'NW': return 315;
    default: return 0;
  }
}

// Função para calcular distância entre dois pontos (Haversine)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const beaches = [
  {
    id: 'praia-paiva',
    name: 'Praia do Paiva',
    lat: -8.3197,
    lng: -34.9632,
    conditions: {
      waveHeight: '1.8m',
      period: '10s',
      wind: '14 km/h E',
      temperature: '27°C',
      direction: 'E',
      quality: 'Bom',
      alert: 'Swell chegando em 2h',
      trend: 'Melhorando',
      statusColor: 'bg-green-500',
      statusText: 'Condições Excelentes',
      surfConditions: [
        { name: 'Altura da Onda', value: '1.8m', icon: Waves, color: 'text-ocean-600' },
        { name: 'Período', value: '10s', icon: Activity, color: 'text-ocean-500' },
        { name: 'Vento', value: '14 km/h E', icon: Wind, color: 'text-blue-600' },
        { name: 'Temperatura', value: '27°C', icon: Thermometer, color: 'text-orange-500' },
      ],
      swellData: [
        { time: '06:00', height: 1.0, direction: 'E', period: 8 },
        { time: '08:00', height: 1.3, direction: 'E', period: 9 },
        { time: '10:00', height: 1.8, direction: 'E', period: 10 },
        { time: '12:00', height: 1.7, direction: 'E', period: 10 },
        { time: '14:00', height: 1.5, direction: 'E', period: 9 },
        { time: '16:00', height: 1.6, direction: 'E', period: 10 },
        { time: '18:00', height: 1.8, direction: 'E', period: 10 }
      ],
      weeklyForecast: [
        { day: 'Seg', quality: 3, height: 1.5 },
        { day: 'Ter', quality: 4, height: 1.8 },
        { day: 'Qua', quality: 4, height: 1.9 },
        { day: 'Qui', quality: 4, height: 2.0 },
        { day: 'Sex', quality: 3, height: 1.7 },
        { day: 'Sáb', quality: 3, height: 1.6 },
        { day: 'Dom', quality: 3, height: 1.5 }
      ]
    }
  },
  {
    id: 'porto-de-galinhas',
    name: 'Porto de Galinhas',
    lat: -8.5083,
    lng: -35.0031,
    conditions: {
      waveHeight: '2.2m',
      period: '12s',
      wind: '12 km/h SE',
      temperature: '28°C',
      direction: 'SE',
      quality: 'Excelente',
      alert: 'Ondas grandes previstas',
      trend: 'Estável',
      statusColor: 'bg-green-600',
      statusText: 'Condições Perfeitas',
      surfConditions: [
        { name: 'Altura da Onda', value: '2.2m', icon: Waves, color: 'text-ocean-600' },
        { name: 'Período', value: '12s', icon: Activity, color: 'text-ocean-500' },
        { name: 'Vento', value: '12 km/h SE', icon: Wind, color: 'text-blue-600' },
        { name: 'Temperatura', value: '28°C', icon: Thermometer, color: 'text-orange-500' },
      ],
      swellData: [
        { time: '06:00', height: 1.5, direction: 'SE', period: 10 },
        { time: '08:00', height: 1.8, direction: 'SE', period: 11 },
        { time: '10:00', height: 2.0, direction: 'SE', period: 12 },
        { time: '12:00', height: 2.1, direction: 'SE', period: 12 },
        { time: '14:00', height: 2.2, direction: 'SE', period: 12 },
        { time: '16:00', height: 2.2, direction: 'SE', period: 12 },
        { time: '18:00', height: 2.1, direction: 'SE', period: 12 }
      ],
      weeklyForecast: [
        { day: 'Seg', quality: 4, height: 2.0 },
        { day: 'Ter', quality: 5, height: 2.2 },
        { day: 'Qua', quality: 5, height: 2.3 },
        { day: 'Qui', quality: 5, height: 2.4 },
        { day: 'Sex', quality: 4, height: 2.1 },
        { day: 'Sáb', quality: 4, height: 2.0 },
        { day: 'Dom', quality: 4, height: 2.0 }
      ]
    }
  },
  // ...adicione as demais praias com lat/lng...
];

// Hook para animar contagem de números (efeito bem suave, sem casas decimais na %)
function useCountUp(to: number, duration = 1800, suffix = '', isPercent = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      let progress = Math.min(elapsed / duration, 1);
      // Ease out quart para suavidade
      progress = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(progress * to);
      setValue(current >= to ? to : current);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setValue(to);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, isPercent]);
  return `${value}${suffix}`;
}

const Index = () => {
  const [selectedBeach, setSelectedBeach] = useState(beaches[0].id);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyBeaches, setNearbyBeaches] = useState(beaches);
  const navigate = useNavigate();

  // Solicita localização do usuário ao carregar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserLocation(null); // Usuário negou ou erro
        }
      );
    }
  }, []);

  // Filtra praias próximas (raio de 100km)
  useEffect(() => {
    if (userLocation) {
      const filtered = beaches.filter(b =>
        getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng) < 100
      );
      setNearbyBeaches(filtered.length > 0 ? filtered : beaches);
      if (filtered.length > 0) setSelectedBeach(filtered[0].id);
    } else {
      setNearbyBeaches(beaches);
    }
  }, [userLocation]);

  const beach = nearbyBeaches.find(b => b.id === selectedBeach);

  // Animações dos números
  const count95 = useCountUp(95, 1200, '%', true);
  const count500 = useCountUp(500, 1200, '+');
  const count247 = useCountUp(24, 1200, '/7');

  // Estado para controlar o hover manualmente
  const [balloonHovered, setBalloonHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Mantém o zoom enquanto mouse está na box OU dropdown aberto
  const isZoomed = balloonHovered || dropdownOpen;

  // Handler para manter o zoom enquanto o dropdown está aberto
  const handleDropdownOpenChange = (open: boolean) => {
    setBalloonHovered(open || balloonHovered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-600 min-h-screen flex items-center">
        {/* Banner de fundo */}
        <img
          src="/img/banner.jpg"
          alt="Banner DeepSurf"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        />
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
                  <div className="text-2xl font-bold text-white transition-all duration-700">{count95}</div>
                  <div className="text-sm">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white transition-all duration-700">{count500}</div>
                  <div className="text-sm">Praias Monitoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white transition-all duration-700">{count247}</div>
                  <div className="text-sm">Alertas em Tempo Real</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div
                className={`transition-transform duration-200${isZoomed ? ' scale-105' : ''}`}
                style={{ willChange: 'transform' }}
                tabIndex={0}
                onMouseEnter={() => setBalloonHovered(true)}
                onMouseLeave={() => setBalloonHovered(false)}
                onFocus={() => setBalloonHovered(true)}
                onBlur={() => setBalloonHovered(false)}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <Waves className="h-5 w-5 mr-2 text-ocean-300" />
                        <span className="text-lg font-semibold">Condições Atuais - </span>
                        <Select
                          value={selectedBeach}
                          onValueChange={setSelectedBeach}
                          // @ts-ignore
                          onOpenChange={setDropdownOpen}
                        >
                          <SelectTrigger
                            className="w-auto bg-transparent border-none p-0 h-auto min-h-0 text-white font-semibold text-lg hover:underline focus:ring-0 focus:border-none shadow-none ml-1"
                            tabIndex={-1}
                          >
                            <span className="underline cursor-pointer">{beach?.name}</span>
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {nearbyBeaches.map((beach) => (
                              <SelectItem key={beach.id} value={beach.id}>
                                {beach.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-white">{beach?.conditions.waveHeight}</div>
                          <div className="text-ocean-200 text-sm">Altura</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{beach?.conditions.period}</div>
                          <div className="text-ocean-200 text-sm">Período</div>
                        </div>
                        <div>
                          <div className="flex justify-center items-center">
                            <ArrowUp
                              className="h-7 w-7 text-white"
                              style={{
                                transform: `rotate(${directionToDegrees(beach?.conditions.direction || 'E')}deg)`
                              }}
                            />
                          </div>
                          <div className="text-ocean-200 text-sm">Direção</div>
                        </div>
                      </div>
                      <div className={`${beach?.conditions.statusColor} text-white text-center py-2 rounded-lg font-medium`}>
                        {beach?.conditions.statusText}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 transform transition-transform duration-200 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Bell className="h-8 w-8 text-ocean-300 mx-auto mb-2" />
                    <div className="text-white font-medium">Alerta Ativo</div>
                    <div className="text-ocean-200 text-sm">{beach?.conditions.alert}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 transform transition-transform duration-200 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-ocean-300 mx-auto mb-2" />
                    <div className="text-white font-medium">Tendência</div>
                    <div className="text-ocean-200 text-sm">{beach?.conditions.trend}</div>
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
              Condições Atuais - {beach?.name}
            </h2>
            <p className="text-lg text-gray-600">
              Dados em tempo real das melhores praias do Brasil
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {beach?.conditions.surfConditions.map((condition, index) => (
              <Card
                key={index}
                className="text-center bg-white/80 border border-blue-100 transition-shadow transition-transform duration-500 hover:shadow-md hover:scale-105 shadow-blue-100 hover:shadow-blue-200"
              >
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
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={beach?.conditions.swellData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 4]} /> {/* Aumenta o eixo Y para até 4m */}
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
                  <BarChart data={beach?.conditions.weeklyForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} allowDecimals={false} />
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
            <Card className="bg-white/80 border border-blue-100 transition-shadow transition-transform duration-500 hover:shadow-md hover:scale-105 shadow-blue-100 hover:shadow-blue-200">
              <CardHeader>
                <Waves className="h-12 w-12 text-ocean-600 mb-4" />
                <CardTitle>Análise de Ondas em Tempo Real</CardTitle>
                <CardDescription>
                  Dados atualizados a cada hora com precisão de até 95% usando sensores oceânicos e satélites.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 border border-blue-100 transition-shadow transition-transform duration-500 hover:shadow-md hover:scale-105 shadow-blue-100 hover:shadow-blue-200">
              <CardHeader>
                <MapPin className="h-12 w-12 text-ocean-600 mb-4" />
                <CardTitle>Mapeamento Inteligente</CardTitle>
                <CardDescription>
                  Visualize condições de surf em centenas de praias com indicadores de qualidade personalizados.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 border border-blue-100 transition-shadow transition-transform duration-500 hover:shadow-md hover:scale-105 shadow-blue-100 hover:shadow-blue-200">
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