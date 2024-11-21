import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase/client';  // Asegúrate de tener la configuración de Firebase

const db = getFirestore(app);
const auth = getAuth(app);  // Obtenemos la instancia de autenticación

interface PermisosDelUsuarioProps {
  permiso: string;
  children: React.ReactNode;
}

const PermisosDelUsuario = ({ permiso, children }: PermisosDelUsuarioProps) => {
  const [userPermissions, setUserPermissions] = useState<Map<string, boolean> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchPermissions = async () => {
          try {
            const userDocRef = doc(db, 'users', user.uid); // Usamos user.uid para obtener el documento del usuario
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const data = userDoc.data();
              const permissions = data.permissions;

              // Verificamos que permissions sea un Map
              if (permissions && permissions instanceof Object && !Array.isArray(permissions)) {
                setUserPermissions(new Map(Object.entries(permissions))); // Convertimos a un Map
              } else {
                setError('El campo permissions no es un Map.');
              }
            }
          } catch (error) {
            setError('Error al obtener los permisos.');
          }
          setLoading(false);
        };

        fetchPermissions();
      } else {

        setLoading(false);
      }
    });

    // Limpiar el observador al desmontar el componente
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  // Verificamos que userPermissions sea un Map y si tiene el permiso
  if (userPermissions && userPermissions.has(permiso) && userPermissions.get(permiso)) {
    return <div className='flex flex-col'>{children}</div>;
  }

  return window.location.href = '/noLoggedIn';
};

export default PermisosDelUsuario;
