import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Github, Linkedin, Bug, Waves, Brain, Database, MapPin, Heart } from 'lucide-react';

const About = () => {
  const technologies = [
    { name: 'React', type: 'Frontend' },
    { name: 'Machine Learning', type: 'IA' },
    { name: 'OpenWeather API', type: 'Dados' },
    { name: 'Surfline API', type: 'Dados' },
    { name: 'TensorFlow', type: 'IA' },
    { name: 'PostgreSQL', type: 'Banco' },
    { name: 'Redis', type: 'Cache' },
    { name: 'Docker', type: 'Infra' }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Inteligência Artificial',
      description: 'Algoritmos de machine learning que aprendem com padrões históricos para prever condições futuras'
    },
    {
      icon: Database,
      title: 'Big Data',
      description: 'Processamento de milhões de pontos de dados meteorológicos e oceanográficos em tempo real'
    },
    {
      icon: MapPin,
      title: 'Geolocalização Precisa',
      description: 'Mapeamento detalhado de spots de surf com análise localizada de condições'
    },
    {
      icon: Waves,
      title: 'Previsões Avançadas',
      description: 'Modelos preditivos que consideram vento, swell, maré e batimetria'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-16">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Sobre a DeepSurf
          </h1>
          <p className="text-lg text-ocean-100">
            Conheça nossa missão e tecnologia por trás das melhores previsões de surf
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Heart className="h-6 w-6 mr-2 text-ocean-300" />
                Nossa Missão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ocean-100 leading-relaxed">
                Democratizar o acesso a previsões precisas de surf, combinando tecnologia de ponta com paixão pelo oceano. 
                Queremos que todo surfista tenha as informações necessárias para encontrar a onda perfeita.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Waves className="h-6 w-6 mr-2 text-ocean-300" />
                Nossa Visão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ocean-100 leading-relaxed">
                Ser a plataforma líder mundial em previsão de ondas, criando uma comunidade global de surfistas 
                conectados pela tecnologia e pelo amor ao surf.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Founder Section */}
        <Card className="mb-16 bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white">Fundador & Desenvolvedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="w-32 h-32 bg-ocean-gradient rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">LA</span>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Luca Aguiar</h3>
                <p className="text-ocean-300 font-medium mb-4">Engenheiro de Software & Surfista</p>
                <p className="text-ocean-100 leading-relaxed mb-6">
                  Desenvolvedor full-stack apaixonado por tecnologia e surf. Com mais de 3 anos de experiência 
                  em desenvolvimento de software e 2 anos surfando, decidiu combinar suas duas paixões para 
                  criar a DeepSurf. Especialista em machine learning e análise de dados meteorológicos.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <Button variant="outline" size="sm" className="bg-ocean-700/50 border-ocean-500 text-ocean-100 hover:bg-ocean-600/50">
                    <Mail className="h-4 w-4 mr-2" />
                    lucanobre1@gmail.com
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-ocean-700/50 border-ocean-500 text-ocean-100 hover:bg-ocean-600/50"
                    asChild
                  >
                    <a
                      href="https://www.linkedin.com/in/lucaaguiar/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-ocean-700/50 border-ocean-500 text-ocean-100 hover:bg-ocean-600/50"
                    asChild
                  >
                    <a
                      href="https://github.com/devvluca"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-16 bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white">Tecnologias & APIs</CardTitle>
            <CardDescription className="text-center text-ocean-100">
              Stack tecnológico utilizado para criar a melhor experiência de previsão de surf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center">
                  <Badge variant="outline" className="mb-2 bg-ocean-700/50 border-ocean-500 text-ocean-200">
                    {tech.type}
                  </Badge>
                  <p className="font-medium text-white">{tech.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-16 bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white">Como Funciona</CardTitle>
            <CardDescription className="text-center text-ocean-100">
              Tecnologia avançada por trás das nossas previsões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-ocean-700/50 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-ocean-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-ocean-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bug Report */}
        <Card className="mb-16 bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-white">
              <Bug className="h-6 w-6 mr-2 text-red-400" />
              Reporte de Bugs & Feedback
            </CardTitle>
            <CardDescription className="text-center text-ocean-100">
              Encontrou algum problema ou tem sugestões? Nos ajude a melhorar!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-ocean-100 mb-6">
              Sua opinião é fundamental para o desenvolvimento da DeepSurf. Reporte bugs, 
              sugira melhorias ou compartilhe sua experiência conosco.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                asChild
              >
                <a
                  href="https://wa.me/5581995167157?text=Ol%C3%A1%2C%20encontrei%20um%20bug%20no%20DeepSurf%20e%20gostaria%20de%20reportar%3A%20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Reportar Bug
                </a>
              </Button>
              <Button
                variant="outline"
                className="bg-ocean-700/50 border-ocean-500 text-ocean-100 hover:bg-ocean-600/50"
                asChild
              >
                <a
                  href="https://wa.me/5581995167157?text=Ol%C3%A1!%20Tenho%20uma%20sugest%C3%A3o%20para%20o%20DeepSurf%3A%20"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Enviar Feedback
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Information */}
        <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white">API DeepSurf</CardTitle>
            <CardDescription className="text-center text-ocean-100">
              Integre nossas previsões em sua aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <code className="text-green-400 text-sm">
                GET https://api.deepsurf.com/v1/forecast?lat=-23.5505&lng=-46.6333
              </code>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-ocean-300 mb-2">REST API</div>
                <p className="text-ocean-100 text-sm">Interface RESTful simples e intuitiva</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ocean-300 mb-2">JSON</div>
                <p className="text-ocean-100 text-sm">Dados estruturados em formato JSON</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ocean-300 mb-2">Rate Limit</div>
                <p className="text-ocean-100 text-sm">1000 requests/hora no plano gratuito</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button className="bg-ocean-gradient text-white hover:opacity-90">
                Documentação da API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default About;
