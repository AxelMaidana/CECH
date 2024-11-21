import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase/client';  // Asegúrate de tener la configuración de Firebase

const auth = getAuth(app);  // Obtenemos la instancia de autenticación

interface AutenticacionProps {
  children: React.ReactNode;
}

const Autenticacion = ({ children }: AutenticacionProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Almacenamos el usuario logueado
      } else {
        setUser(null); // Si no hay usuario, set null
      }
      setLoading(false); // Terminamos de cargar el estado
    });

    // Limpiar el observador al desmontar el componente
    return () => unsubscribe();
  }, []);

  if (loading) return <div></div>;

  if (!user) {
    // Si no hay usuario, redirigimos a la página de acceso denegado
    window.location.href = '/noLoggedIn';
    return null; // No renderizamos nada mientras redirige
  }

  // Si hay un usuario, mostramos el contenido
  return <div className="flex flex-col">{children}</div>;
};

export default Autenticacion;
