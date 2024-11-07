// components/auth/RouteGuard.tsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function RouteGuard({ children }) {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role;
        
        if (role === 'admin') {
          setHasAccess(true);
        } else if (role === 'user') {
          setHasAccess(true);
        }
      } else {
        window.location.href = '/noLoggedIn'; // Redirige si no hay usuario logueado
      }
    });

    return () => unsubscribe();
  }, []);

  if (!hasAccess) return null; // No renderiza el contenido si no tiene acceso

  return <>{children}</>;
}
