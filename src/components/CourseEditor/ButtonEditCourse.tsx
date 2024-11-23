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
      <button
  className="
    hover:scale-105 
    transition-all 
    duration-300 
    ease-in-out 
    mr-2 
    md:mr-10 
    lg:mr-20 
    xl:mr-56
  "
>
  <a
    href={`./${id}/edit`}
    className="
      flex 
      items-center 
      justify-center 
      font-bold 
      bg-customBlue 
      text-white 
      px-4 
      py-2 
      rounded-xl
      gap-2
    "
  >
    {/* SVG visible en móvil */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5 block md:hidden"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 3.487c.387-.387.92-.584 1.462-.583.543.002 1.077.2 1.465.588l.882.882c.388.388.586.922.588 1.465.002.543-.196 1.076-.583 1.463L7.125 20.73a4.5 4.5 0 01-1.697 1.08l-4.104 1.368 1.368-4.105a4.5 4.5 0 011.08-1.697L16.862 3.487z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25L15.75 4.5"
      />
    </svg>
    {/* Texto visible en pantallas medianas y mayores */}
    <span className="hidden md:block">Editar curso</span>
  </a>
</button>

    ) : (
      null
    )
  );
}
