import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import NavAdmin from '../layout/NavAdmin.tsx';
import NavUser from '../layout/Nav.tsx';


export default function ContentHeader() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);


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

  }, []);

  return (
    // depende del rol mostrar el nav correspondiente
    userData?.role === 'admin' ? <NavAdmin /> : <NavUser />
   
  );
}