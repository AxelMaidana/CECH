import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { usePermissions } from '../auth/PermissionsProvider';

interface Props {
  id: string;
}

export default function ContentHeader({ id }: Props) {    
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const { permissions, loading, userId } = usePermissions();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData(userDoc.data());
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe(); // para limpiar el listener cuando el componente se desmonte
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    permissions.editarCursos ?  (
      <button className="hover:scale-105 transition-all duration-300 ease-in-out mr-56">
      <a href={`./${id}/edit`} className="font-bold bg-customBlue text-white px-4 py-2 rounded-xl">Editar curso</a>
    </button>
    ) : (
      null
    )
  );
}
