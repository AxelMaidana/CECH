import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ViewCondition from './ViewCondition';

interface Props {
  children: React.ReactNode;
}

export default function ContentHeader({ children }: Props) {    
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
    userData?.role === 'admin' ? <>{children}</> : <>{children}</>
  );
}
