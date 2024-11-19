import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../../firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Definir el contexto
interface Permissions {
  verDashboardAdmin: boolean,
  verCursos: boolean,
  verNoticias: boolean,
  verMatriculados: boolean,
  agregarCurso: boolean,
  eliminarCurso: boolean,
  editarNoticias: boolean,
  agregarNoticia: boolean,
  eliminarNoticia: boolean,
  agregarMatriculado: boolean,
  editarCursos: boolean,
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
  userId: string | null;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Crear el proveedor del contexto
export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permissions>(
    {
      verDashboardAdmin: false,
        verCursos: false,
        verNoticias: false,
        verMatriculados: false,
        agregarCurso: false,
        agregarNoticia: false,
        agregarMatriculado: false,
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
    }
  );
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
            setPermissions(userData.permissions || { verDashboardAdmin: false,
              verCursos: false,
              verNoticias: false,
              verMatriculados: false,
              agregarCurso: false,
              agregarNoticia: false,
              agregarMatriculado: false,
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
        setPermissions({ verDashboardAdmin: false,
          verCursos: false,
          verNoticias: false,
          verMatriculados: false,
          agregarCurso: false,
          agregarNoticia: false,
          agregarMatriculado: false,
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
    <PermissionsContext.Provider value={{ permissions, loading, userId }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook para usar el contexto en otros componentes
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions debe ser usado dentro de un PermissionsProvider');
  }
  return context;
};
