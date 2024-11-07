import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import PageView from './PageView';

interface Props {
  children: React.ReactNode;
  id: string; // Propiedad que recibe `pageId`
}

export default function ContentHeader({ children, id }: Props) {    
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUserData(userDoc.data());
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    userData?.role === 'admin' ? <>{children}</> : <PageView pageId={id} />
  );
}
