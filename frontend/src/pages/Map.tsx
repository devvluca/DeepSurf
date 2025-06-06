import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Waves, Wind, Thermometer, Star, Eye } from 'lucide-react';

const Map = () => {
  const [selectedBeach, setSelectedBeach] = useState<string | null>(null);

  // Ordem e nomes atualizados conforme solicitado
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
      color: 'bg-blue-500'
    },
    {
      id: 'porto-de-galinhas',
      name: 'Porto de Galinhas',
      city: 'Ipojuca, PE',
      coordinates: { lat: -8.5083, lng: -35.0031 },
      surfability: 5,
      waveHeight: '2.2m',
      period: '12s',
      wind: '12 km/h SE',
      temperature: '28°C',
      description: 'Excelente para surfistas experientes.',
      color: 'bg-green-500'
    },
    {
      id: 'praia-cupe',
      name: 'Praia do Cupe',
      city: 'Ipojuca, PE',
      coordinates: { lat: -8.4746, lng: -34.9731 },
      surfability: 3,
      waveHeight: '1.3m',
      period: '8s',
      wind: '16 km/h E',
      temperature: '27°C',
      description: 'Ondas moderadas, ideal para todos os níveis.',
      color: 'bg-yellow-500'
    },
    {
      id: 'praia-pipa',
      name: 'Praia de Pipa',
      city: 'Tibau do Sul, RN',
      coordinates: { lat: -6.2333, lng: -35.0500 },
      surfability: 4,
      waveHeight: '1.7m',
      period: '11s',
      wind: '10 km/h NE',
      temperature: '26°C',
      description: 'Praia badalada com boas ondas.',
      color: 'bg-blue-500'
    },
    {
      id: 'fernando-noronha',
      name: 'Fernando de Noronha',
      city: 'Fernando de Noronha, PE',
      coordinates: { lat: -3.8571, lng: -32.4297 },
      surfability: 5,
      waveHeight: '2.5m',
      period: '14s',
      wind: '8 km/h E',
      temperature: '29°C',
      description: 'Condições perfeitas, paraíso do surf.',
      color: 'bg-green-500'
    },
    {
      id: 'praia-maracaipe',
      name: 'Praia de Maracaípe',
      city: 'Ipojuca, PE',
      coordinates: { lat: -8.5266, lng: -35.0086 },
      surfability: 2,
      waveHeight: '1.0m',
      period: '7s',
      wind: '18 km/h SE',
      temperature: '27°C',
      description: 'Ondas fracas, bom para iniciantes.',
      color: 'bg-red-500'
    },
    {
      id: 'enseada-dos-corais',
      name: 'Enseada dos Corais',
      city: 'Cabo de Santo Agostinho, PE',
      coordinates: { lat: -8.3472, lng: -34.9561 },
      surfability: 3,
      waveHeight: '1.4m',
      period: '9s',
      wind: '15 km/h E',
      temperature: '27°C',
      description: 'Ondas moderadas e ambiente familiar.',
      color: 'bg-yellow-500'
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

  // Zoom/Pan state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Adicionar estado para modo de edição
  const [editMode, setEditMode] = useState(false);
  const [draggingPin, setDraggingPin] = useState<string | null>(null);
  const [showAddPin, setShowAddPin] = useState(false);

  // Posições dos pins no SVG (inicialmente vazio)
  const [pinPositions, setPinPositions] = useState<Record<string, { x: number, y: number }>>({});

  const [tempPinPositions, setTempPinPositions] = useState<Record<string, { x: number, y: number }>>(pinPositions);

  // Adicionar pin no centro do mapa
  const addPin = (beachName: string) => {
    const newPin = { x: 0.5, y: 0.5 }; // Centro do mapa
    setPinPositions(prev => ({ ...prev, [beachName]: newPin }));
    setTempPinPositions(prev => ({ ...prev, [beachName]: newPin }));
    setShowAddPin(false);
    setEditMode(true); // Ativar modo de edição automaticamente
    console.log(`Pin "${beachName}" adicionado no centro. Use o modo de edição para posicioná-lo.`);
  };

  // Remover pin
  const removePin = (beachName: string) => {
    setPinPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[beachName];
      return newPositions;
    });
    setTempPinPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[beachName];
      return newPositions;
    });
  };

  // Praias que ainda não têm pins
  const availableBeaches = beaches.filter(beach => !pinPositions[beach.name]);

  // Mouse events for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editMode) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (editMode && draggingPin) {
      // Arrastar pin dentro do SVG
      const rect = e.currentTarget.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      
      // Mouse position relative to container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Converter para coordenadas do SVG (inverter a transformação)
      const svgX = (mouseX - containerWidth/2 - offset.x) / zoom + containerWidth/2;
      const svgY = (mouseY - containerHeight/2 - offset.y) / zoom + containerHeight/2;
      
      // Converter para percentual do viewBox SVG
      const percentX = svgX / containerWidth;
      const percentY = svgY / containerHeight;
      
      setTempPinPositions(prev => ({
        ...prev,
        [draggingPin]: { x: percentX, y: percentY }
      }));
      
      console.log(`Pin "${draggingPin}" movido para:`, { x: percentX, y: percentY });
      return;
    }
    
    if (!dragging || editMode) return;
    const dx = e.clientX - (dragStart.current?.x || 0);
    const dy = e.clientY - (dragStart.current?.y || 0);
    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    if (draggingPin) {
      console.log('Coordenadas finais de todos os pins:', tempPinPositions);
      setDraggingPin(null);
    }
    setDragging(false);
  };

  // Função para lidar com arrastar pins
  const handlePinMouseDown = (e: React.MouseEvent, beachName: string) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    setDraggingPin(beachName);
    console.log(`Começou a arrastar: ${beachName}`);
  };

  // Helper para converter classes Tailwind para cores hex
  const getColorFromClass = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981', 
      'bg-yellow-500': '#eab308',
      'bg-red-500': '#ef4444',
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316'
    };
    return colorMap[colorClass] || '#3b82f6';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
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
                <div
                  className="relative w-full h-[500px] flex items-center justify-center select-none overflow-hidden"
                  style={{ cursor: dragging ? 'grabbing' : editMode ? 'crosshair' : 'grab' }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={e => {
                    handleMouseUp();
                    document.body.style.overflow = 'auto';
                  }}
                  onWheel={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    let newZoom = zoom - e.deltaY * 0.001;
                    newZoom = Math.max(0.5, Math.min(2.5, newZoom));
                    setZoom(newZoom);
                  }}
                  onMouseEnter={() => {
                    document.body.style.overflow = 'hidden';
                  }}
                >
                  {/* SVG MAPA como fundo */}
                  <img
                    src="/img/mapa-brasil.svg"
                    alt="Mapa Cartoon Brasil"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                    style={{
                      transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`,
                      transition: dragging ? 'none' : 'transform 0.1s',
                    }}
                  />

                  {/* SVG OVERLAY para pins - aplica EXATAMENTE a mesma transformação */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                      transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`,
                      transition: dragging ? 'none' : 'transform 0.1s',
                    }}
                    viewBox="0 0 500 500"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Pins como elementos SVG */}
                    {beaches
                      .filter(beach => tempPinPositions[beach.name])
                      .map((beach) => {
                        const pos = tempPinPositions[beach.name];
                        const x = pos.x * 500; // Coordenadas do viewBox
                        const y = pos.y * 500;
                        
                        return (
                          <g key={beach.id}>
                            {/* Pin circle */}
                            <circle
                              cx={x}
                              cy={y}
                              r={editMode ? "15" : "12"}
                              className={`cursor-pointer transition-all ${
                                editMode ? 'stroke-red-500 stroke-4' : 'stroke-white stroke-2'
                              }`}
                              fill={getColorFromClass(beach.color)}
                              style={{ 
                                pointerEvents: 'auto',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                              }}
                              onMouseDown={(e) => editMode ? handlePinMouseDown(e as any, beach.name) : undefined}
                              onClick={(e) => {
                                if (!editMode) {
                                  setSelectedBeach(beach.id);
                                } else {
                                  e.preventDefault();
                                }
                              }}
                            />
                            {/* Star rating text */}
                            <text
                              x={x}
                              y={y + 2}
                              textAnchor="middle"
                              className="text-xs font-bold fill-white pointer-events-none select-none"
                              style={{ fontSize: '10px' }}
                            >
                              {beach.surfability}★
                            </text>
                            {/* Tooltip on hover (só se não estiver editando) */}
                            {!editMode && (
                              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                <rect
                                  x={x - 40}
                                  y={y - 35}
                                  width="80"
                                  height="20"
                                  rx="4"
                                  fill="white"
                                  stroke="#ccc"
                                />
                                <text
                                  x={x}
                                  y={y - 22}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-800"
                                  style={{ fontSize: '9px' }}
                                >
                                  {beach.name}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                  </svg>

                  {/* Zoom controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}>+</Button>
                    <Button size="icon" variant="outline" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>-</Button>
                    {/* Botão para modo de edição */}
                    <Button 
                      size="icon" 
                      variant={editMode ? "destructive" : "outline"}
                      onClick={() => {
                        setEditMode(!editMode);
                        if (!editMode) {
                          console.log('Modo de edição ativado - você pode arrastar os pins agora!');
                        } else {
                          console.log('Modo de edição desativado');
                        }
                      }}
                      title={editMode ? "Sair do modo edição" : "Modo edição: mover pins"}
                    >
                      {editMode ? "✓" : "✎"}
                    </Button>
                  </div>

                  {/* Menu para adicionar pins - movido para cima da legenda */}
                  {showAddPin && (
                    <div 
                      className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border p-3 z-20 w-64"
                      onWheel={(e) => e.stopPropagation()} // Impede o zoom do mapa quando scrollar na lista
                    >
                      <h4 className="font-medium text-sm mb-2">Escolha uma Praia</h4>
                      {availableBeaches.length > 0 ? (
                        <div 
                          className="space-y-2 max-h-48 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()} // Garantia extra
                        >
                          {availableBeaches.map(beach => (
                            <button
                              key={beach.id}
                              onClick={() => addPin(beach.name)}
                              className="w-full text-left p-2 rounded hover:bg-ocean-50 transition-colors text-sm border border-gray-100 hover:border-ocean-200"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{beach.name}</span>
                                <div className={`w-3 h-3 rounded-full ${beach.color}`}></div>
                              </div>
                              <div className="text-xs text-gray-500">{beach.city}</div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">🎉 Todos os pins foram adicionados!</p>
                          <p className="text-xs text-gray-400">Use o botão ✎ para editar posições</p>
                        </div>
                      )}
                      <button
                        onClick={() => setShowAddPin(false)}
                        className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  )}

                  {/* Botão de Adicionar Pin - Novo design em baixo */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={() => setShowAddPin(!showAddPin)}
                      className="bg-white hover:bg-ocean-50 transition-all duration-200 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-ocean-300 flex items-center space-x-3 group"
                    >
                      <div className="w-8 h-8 bg-ocean-gradient rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-bold text-lg">📍</span>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-800 text-sm">Adicionar Pin de Praia</div>
                        <div className="text-xs text-gray-500">Marque suas praias favoritas no mapa</div>
                      </div>
                      <div className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse"></div>
                    </button>
                  </div>

                  {/* Legenda */}
                  <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg w-fit">
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
                        <div className="flex-1">
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
                          {pinPositions[beach.name] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePin(beach.name);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs ml-2"
                              title="Remover pin"
                            >
                              ✕
                            </button>
                          )}
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
      <Footer />
    </div>
  );
};

export default Map;