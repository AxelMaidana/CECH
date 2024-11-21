import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/client'; // Asegúrate de configurar tu Firebase

interface Permissions {
  [key: string]: boolean; // Permisos específicos por pageId
  verDashboardAdmin: boolean,
  verCursos: boolean,
  verNoticias: boolean,
  verMatriculados: boolean,
  agregarCurso: boolean,
  eliminarCurso: boolean,
  editarNoticias: boolean,
  agregarNoticia: boolean,
  eliminarNoticia: boolean,
  editarPanelActAcademica: boolean,
  editarPanelMatriculado: boolean,
  editarPanelBecas: boolean,
  editarPanelContacto: boolean,
  editarPanelTramites: boolean,
  editarPanelDictamenes: boolean,
  editarPanelInfoInstitucional: boolean,
  editarPanelNoticias: boolean,
  agregarMiembro: boolean,
  eliminarMiembro: boolean,
  editarMiembro: boolean,
  modificarPermisos: boolean,
}

interface PermissionsContextType {
  permissions: Permissions;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState<Permissions>({
    verDashboardAdmin: false,
        verCursos: false,
        verNoticias: false,
        verMatriculados: false,
        agregarCurso: false,
        agregarNoticia: false,
        agregarMiembro: false,
        editarNoticias: false,
        editarMiembro: false,
        editarCursos: false,
        editarPanelActAcademica: false,
        editarPanelMatriculado: false,
        editarPanelBecas: false,
        editarPanelTramites: false,
        editarPanelDictamenes: false,
        editarPanelContacto: false,
        editarPanelInfoInstitucional: false,
        editarPanelNoticias: false,
        eliminarCurso: false,
        eliminarNoticia: false,
        eliminarMiembro: false,
        modificarPermisos: false,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, 'users', user.uid);

        const unsubscribePermissions = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            const userPermissions = userData.permissions || {};
            setPermissions((prevPermissions) => ({
              ...prevPermissions,
              ...userPermissions,
            }));
          } else {
            console.log('No se encontró el documento del usuario');
          }
          setLoading(false);
        }, (error) => {
          console.error('Error al obtener permisos:', error);
          setLoading(false);
        });

        return () => unsubscribePermissions();
      } else {
        setUserId(null);
        setPermissions({
          verDashboardAdmin: false,
        verCursos: false,
        verNoticias: false,
        verMatriculados: false,
        agregarCurso: false,
        agregarNoticia: false,
        agregarMiembro: false,
        editarNoticias: false,
        editarMiembro: false,
        editarCursos: false,
        editarPanelActAcademica: false,
        editarPanelMatriculado: false,
        editarPanelBecas: false,
        editarPanelTramites: false,
        editarPanelDictamenes: false,
        editarPanelContacto: false,
        editarPanelInfoInstitucional: false,
        editarPanelNoticias: false,
        eliminarCurso: false,
        eliminarNoticia: false,
        eliminarMiembro: false,
        modificarPermisos: false,
        });
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions debe estar dentro de PermissionsProvider');
  }
  return context;
};
