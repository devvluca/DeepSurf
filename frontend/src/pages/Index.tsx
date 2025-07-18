import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Waves, TrendingUp, MapPin, Bell, Wind, Thermometer, Activity, Star, Users, ArrowUp, Brain, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';
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
  const [nearbyBeaches, setNearbyBeaches] = useState(beaches);
  const navigate = useNavigate();

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
      <section className="relative overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-600 min-h-screen flex items-center pt-16">
        {/* Banner de fundo */}
        <img
          src="/img/banner.jpg"
          alt="Banner DeepSurf"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        />
        <div className="absolute inset-0 wave-animation opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-3 sm:space-y-4" data-aos="fade-right" data-aos-delay="200">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  <span className="relative inline-block">
                    Ondas Perfeitas
                    {/* Animação de onda fluida */}
                    <span className="inline-block ml-2 relative">
                      <svg 
                        width="35" 
                        height="24" 
                        viewBox="0 0 35 24" 
                        className="inline-block align-middle"
                      >
                        <defs>
                          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#87ceeb" />
                            <stop offset="50%" stopColor="#bae6fd" />
                            <stop offset="100%" stopColor="#87ceeb" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M3,12 Q8,6 13,12 T23,12 T33,12"
                          stroke="url(#waveGradient)"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          className="animate-wave-flow"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="1.5"
                          fill="#87ceeb"
                          className="animate-pulse"
                          opacity="0.8"
                        />
                        <circle
                          cx="18"
                          cy="16"
                          r="1"
                          fill="#bae6fd"
                          className="animate-bounce"
                          opacity="0.6"
                        />
                        <circle
                          cx="28"
                          cy="8"
                          r="1.2"
                          fill="#87ceeb"
                          className="animate-pulse"
                          opacity="0.7"
                        />
                      </svg>
                    </span>
                  </span>
                  <span className="block text-ocean-200">Baseadas em IA</span>
                </h1>
                <p className="text-lg sm:text-xl text-ocean-100 max-w-lg mx-auto lg:mx-0">
                  Análise avançada de dados climáticos para encontrar as melhores condições de surf. 
                  Tecnologia de ponta para surfistas que buscam a onda perfeita.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start" data-aos="fade-right" data-aos-delay="400">
                <Button 
                  size="lg" 
                  className="bg-white text-ocean-900 hover:bg-ocean-50 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  onClick={() => navigate('/ai-training')}
                >
                  <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Ver IA Funcionando
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-transparent hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  onClick={() => navigate('/profile')}
                >
                  Perfil
                </Button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-8 text-ocean-200" data-aos="fade-right" data-aos-delay="600">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white transition-all duration-700">{count95}</div>
                  <div className="text-xs sm:text-sm">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white transition-all duration-700">{count500}</div>
                  <div className="text-xs sm:text-sm">Praias Monitoradas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white transition-all duration-700">{count247}</div>
                  <div className="text-xs sm:text-sm">Alertas em Tempo Real</div>
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
                data-aos="zoom-in"
                data-aos-delay="300"
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
                            {beaches.map((beach) => (
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
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 transform transition-transform duration-200 hover:scale-105" data-aos="fade-left" data-aos-delay="500">
                  <CardContent className="p-4 text-center">
                    <Bell className="h-8 w-8 text-ocean-300 mx-auto mb-2" />
                    <div className="text-white font-medium">Alerta Ativo</div>
                    <div className="text-ocean-200 text-sm">{beach?.conditions.alert}</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 transform transition-transform duration-200 hover:scale-105" data-aos="fade-left" data-aos-delay="600">
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
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Condições Atuais - {beach?.name}
            </h2>
            <p className="text-base sm:text-lg text-ocean-100">
              Dados em tempo real das melhores praias do Brasil
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {beach?.conditions.surfConditions.map((condition, index) => (
              <Card
                key={index}
                className="text-center bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-all duration-500 hover:bg-ocean-700/50 hover:scale-105"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <condition.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-ocean-200" />
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{condition.value}</p>
                  <p className="text-xs sm:text-sm text-ocean-100">{condition.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-transform duration-200 hover:scale-105" data-aos="fade-up" data-aos-delay="200">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="h-5 w-5 mr-2 text-ocean-200" />
                  Previsão do Swell - Hoje
                </CardTitle>
                <CardDescription className="text-ocean-100">
                  Altura das ondas ao longo do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={beach?.conditions.swellData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,230,253,0.2)" />
                    <XAxis dataKey="time" tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <YAxis domain={[0, 4]} tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}m`, 'Altura']}
                      labelFormatter={(label) => `Horário: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(12,74,110,0.9)', 
                        border: '1px solid rgba(186,230,253,0.3)', 
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="height" 
                      stroke="#bae6fd" 
                      fill="url(#oceanBalancedGradient)" 
                    />
                    <defs>
                      <linearGradient id="oceanBalancedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#bae6fd" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#bae6fd" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-transform duration-200 hover:scale-105" data-aos="fade-up" data-aos-delay="400">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Star className="h-5 w-5 mr-2 text-yellow-300" />
                  Previsão Semanal
                </CardTitle>
                <CardDescription className="text-ocean-100">
                  Qualidade das ondas (1-5 estrelas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={beach?.conditions.weeklyForecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,230,253,0.2)" />
                    <XAxis dataKey="day" tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} allowDecimals={false} tick={{ fill: '#bae6fd', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'height' ? `${value}m` : `${value} estrelas`, 
                        name === 'height' ? 'Altura' : 'Qualidade'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'rgba(12,74,110,0.9)', 
                        border: '1px solid rgba(186,230,253,0.3)', 
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px'
                      }}
                    />
                    <Bar dataKey="height" fill="#bae6fd" />
                    <Bar dataKey="quality" fill="#fde047" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features + CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16" data-aos="fade-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Tecnologia Avançada para Surfistas
            </h2>
            <p className="text-base sm:text-lg text-ocean-100 max-w-2xl mx-auto">
              Combinamos dados meteorológicos, inteligência artificial e análise preditiva para oferecer as melhores previsões de surf do mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-all duration-500 hover:bg-ocean-700/50 hover:scale-105" data-aos="fade-up" data-aos-delay="100">
              <CardHeader className="text-center sm:text-left">
                <Waves className="h-10 w-10 sm:h-12 sm:w-12 text-ocean-200 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-white text-lg sm:text-xl">Análise de Ondas em Tempo Real</CardTitle>
                <CardDescription className="text-ocean-100 text-sm sm:text-base">
                  Dados atualizados a cada hora com precisão de até 95% usando sensores oceânicos e satélites.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-all duration-500 hover:bg-ocean-700/50 hover:scale-105" data-aos="fade-up" data-aos-delay="200">
              <CardHeader className="text-center sm:text-left">
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-ocean-200 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-white text-lg sm:text-xl">Mapeamento Inteligente</CardTitle>
                <CardDescription className="text-ocean-100 text-sm sm:text-base">
                  Visualize condições de surf em centenas de praias com indicadores de qualidade personalizados.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30 transition-all duration-500 hover:bg-ocean-700/50 hover:scale-105" data-aos="fade-up" data-aos-delay="300">
              <CardHeader className="text-center sm:text-left">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-ocean-200 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-white text-lg sm:text-xl">Recomendações Personalizadas</CardTitle>
                <CardDescription className="text-ocean-100 text-sm sm:text-base">
                  IA que aprende suas preferências e nível de habilidade para sugerir as melhores sessões.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA merged here, no colored background */}
          <div className="max-w-4xl mx-auto text-center" data-aos="fade-up" data-aos-delay="400">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Pronto para Surfar as Melhores Ondas?
            </h2>
            <p className="text-lg sm:text-xl text-ocean-100 mb-6 sm:mb-8">
              Junte-se a milhares de surfistas que já usam a DeepSurf para encontrar as condições perfeitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-ocean-800 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
                onClick={() => navigate('/account')}
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-transparent hover:bg-white/10 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 font-semibold w-full sm:w-auto"
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