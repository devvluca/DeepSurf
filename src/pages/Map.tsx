
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Waves, Wind, Thermometer, Star, Eye } from 'lucide-react';

const Map = () => {
  const [selectedBeach, setSelectedBeach] = useState<string | null>(null);

  const beaches = [
    {
      id: '1',
      name: 'Praia do Futuro',
      city: 'Fortaleza, CE',
      coordinates: { lat: -3.7222, lng: -38.4856 },
      surfability: 5,
      waveHeight: '2.1m',
      period: '12s',
      wind: '15 km/h SW',
      temperature: '24°C',
      description: 'Condições excelentes para surf com ondas consistentes',
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Praia de Iracema',
      city: 'Fortaleza, CE',
      coordinates: { lat: -3.7188, lng: -38.5200 },
      surfability: 3,
      waveHeight: '1.5m',
      period: '8s',
      wind: '20 km/h E',
      temperature: '25°C',
      description: 'Condições moderadas, ideal para iniciantes',
      color: 'bg-yellow-500'
    },
    {
      id: '3',
      name: 'Praia de Copacabana',
      city: 'Rio de Janeiro, RJ',
      coordinates: { lat: -22.9711, lng: -43.1822 },
      surfability: 4,
      waveHeight: '1.8m',
      period: '10s',
      wind: '12 km/h S',
      temperature: '22°C',
      description: 'Boas condições com vento favorável',
      color: 'bg-blue-500'
    },
    {
      id: '4',
      name: 'Praia da Joaquina',
      city: 'Florianópolis, SC',
      coordinates: { lat: -27.6289, lng: -48.4486 },
      surfability: 5,
      waveHeight: '2.5m',
      period: '14s',
      wind: '10 km/h SW',
      temperature: '19°C',
      description: 'Condições perfeitas para surf profissional',
      color: 'bg-green-600'
    },
    {
      id: '5',
      name: 'Praia de Itacoatiara',
      city: 'Niterói, RJ',
      coordinates: { lat: -22.9644, lng: -43.0489 },
      surfability: 2,
      waveHeight: '0.8m',
      period: '6s',
      wind: '25 km/h N',
      temperature: '23°C',
      description: 'Condições fracas devido ao vento forte',
      color: 'bg-red-500'
    },
    {
      id: '6',
      name: 'Praia do Rosa',
      city: 'Imbituba, SC',
      coordinates: { lat: -28.1744, lng: -48.6389 },
      surfability: 4,
      waveHeight: '2.0m',
      period: '11s',
      wind: '8 km/h SW',
      temperature: '18°C',
      description: 'Ondas consistentes com pouco vento',
      color: 'bg-blue-500'
    }
  ];

  const getSurfabilityText = (level: number) => {
    switch (level) {
      case 5: return 'Excelente';
      case 4: return 'Bom';
      case 3: return 'Moderado';
      case 2: return 'Fraco';
      case 1: return 'Muito Fraco';
      default: return 'Sem dados';
    }
  };

  const getSurfabilityColor = (level: number) => {
    switch (level) {
      case 5: return 'text-green-600 bg-green-100';
      case 4: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 1: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Mapa de Surfabilidade
          </h1>
          <p className="text-lg text-gray-600">
            Visualize as condições de surf em tempo real nas principais praias do Brasil
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-ocean-600" />
                  Mapa Interativo
                </CardTitle>
                <CardDescription>
                  Clique nos marcadores para ver detalhes das condições
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                {/* Simplified Map Representation */}
                <div className="relative bg-blue-50 rounded-lg h-full overflow-hidden">
                  {/* Brazil-like coastline representation */}
                  <div className="absolute inset-4 bg-gradient-to-b from-green-100 to-yellow-100 rounded-lg opacity-60"></div>
                  
                  {/* Beach markers positioned roughly like Brazilian coast */}
                  {beaches.map((beach) => (
                    <div
                      key={beach.id}
                      className={`absolute w-6 h-6 rounded-full cursor-pointer shadow-lg border-2 border-white hover:scale-110 transition-transform ${beach.color}`}
                      style={{
                        top: beach.name.includes('Fortaleza') ? '15%' :
                             beach.name.includes('Rio') ? '60%' :
                             beach.name.includes('Florianópolis') || beach.name.includes('Imbituba') ? '85%' :
                             beach.name.includes('Niterói') ? '58%' : '50%',
                        left: beach.name.includes('Fortaleza') ? '30%' :
                              beach.name.includes('Rio') || beach.name.includes('Niterói') ? '70%' :
                              beach.name.includes('Florianópolis') || beach.name.includes('Imbituba') ? '60%' : '50%'
                      }}
                      onClick={() => setSelectedBeach(beach.id)}
                      title={beach.name}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-medium shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        {beach.name}
                      </div>
                    </div>
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-semibold mb-2 text-sm">Legenda</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Excelente (5★)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Bom (4★)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Moderado (3★)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Fraco (1-2★)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Beach Details Sidebar */}
          <div className="space-y-6">
            {/* Selected Beach Details */}
            {selectedBeach && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Detalhes da Praia</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedBeach(null)}
                    >
                      ×
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const beach = beaches.find(b => b.id === selectedBeach);
                    if (!beach) return null;
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-lg">{beach.name}</h3>
                          <p className="text-gray-600">{beach.city}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getSurfabilityColor(beach.surfability)}>
                            <Star className="h-3 w-3 mr-1" />
                            {getSurfabilityText(beach.surfability)}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-700">{beach.description}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Waves className="h-4 w-4 text-ocean-600" />
                            <div>
                              <p className="font-medium">{beach.waveHeight}</p>
                              <p className="text-gray-500">Altura</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Wind className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{beach.wind}</p>
                              <p className="text-gray-500">Vento</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Waves className="h-4 w-4 text-teal-600" />
                            <div>
                              <p className="font-medium">{beach.period}</p>
                              <p className="text-gray-500">Período</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Thermometer className="h-4 w-4 text-orange-600" />
                            <div>
                              <p className="font-medium">{beach.temperature}</p>
                              <p className="text-gray-500">Temperatura</p>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-ocean-gradient text-white">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Previsão Detalhada
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Beach List */}
            <Card>
              <CardHeader>
                <CardTitle>Praias Monitoradas</CardTitle>
                <CardDescription>
                  Clique para ver detalhes no mapa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {beaches.map((beach) => (
                    <div
                      key={beach.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedBeach === beach.id ? 'bg-ocean-50 border border-ocean-200' : 'bg-white border'
                      }`}
                      onClick={() => setSelectedBeach(beach.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{beach.name}</h4>
                          <p className="text-xs text-gray-500">{beach.city}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className={getSurfabilityColor(beach.surfability)}
                          >
                            {beach.surfability}★
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${beach.color}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Waves className="h-3 w-3" />
                          <span>{beach.waveHeight}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Wind className="h-3 w-3" />
                          <span>{beach.wind}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
