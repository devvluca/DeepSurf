import React from 'react';

const Footer = () => (
  <footer className="bg-navy-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <img 
              src="/img/deepsurf.png" 
              alt="DeepSurf Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold">DeepSurf</span>
          </div>
          <p className="text-gray-300">
            Análise inteligente de ondas com dados climáticos avançados.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Produto</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors">Mapa de Ondas</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Previsões</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Empresa</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Suporte</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
        <p>&copy; 2025 DeepSurf. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;