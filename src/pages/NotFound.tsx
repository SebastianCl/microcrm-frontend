import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Error 404: El usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-foreground mb-6">¡Ups! Esta página no existe.</p>
      <p className="text-muted-foreground mb-8 max-w-md">
        La página que estás buscando puede haber sido eliminada, cambiado de nombre o estar temporalmente no disponible.
      </p>
      <Button asChild>
        <Link to="/">Volver al Panel</Link>
      </Button>
    </div>
  );
};

export default NotFound;
