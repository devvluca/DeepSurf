import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
// import Button from "../components/Button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-700 pt-16">
      <Header />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            Página não encontrada
          </h2>
          <p className="text-lg text-slate-200 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>s
        </div>
      </div>
    </div>
  );
};

export default NotFound;
