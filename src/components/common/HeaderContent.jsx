import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoginModal from '../auth/LoginModal'; // Asegúrate de importar el modal

export default function ContentHeader({ logoSrc, titleLine1, titleLine2, loginButtonText }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Establecer el usuario autenticado
        setUser(currentUser);

        // Obtener datos adicionales del usuario desde Firestore (si es necesario)
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data()); // Almacena los datos de Firestore en el estado
        } else {
          setUserData(null); // Si no hay documento de usuario en Firestore, establecer userData como null
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false); // Detener el estado de carga
    });

    return () => {
      unsubscribe(); // Limpiar el observador cuando el componente se desmonte
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Redirigir al home después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-customBlue text-white py-2">
      <div className="container flex flex-row justify-between items-center mx-auto px-2 space-x-0">
        <div className="flex items-center text-left md:flex-row md:items-center gap-2 md:gap-4">
          <a href="/">
            <img src={logoSrc} alt="Logo CECH" width={96} height={96} className="h-14 w-auto sm:h-[4.5rem] md:h-20 lg:h-24" />
          </a>
          <a href="/" className="md:block">
            <h1 className="text-left text-xs tracking-wide font-medium leading-tight sm:text-lg sm:leading-5 md:text-xl md:leading-6 lg:text-2xl lg:leading-7">
              {titleLine1}
              <br />
              <span className="block text-left md:text-left">
                {titleLine2}
              </span>
            </h1>
          </a>
        </div>

        <div className="flex items-center my-auto">
          {loading ? (
            <div className="flex items-center space-x-3 mb-auto">
              <div className="hidden lg:visible">
                <div className="bg-gray-300 animate-pulse rounded-md h-5 w-16 mb-1"></div>
                <div className="bg-gray-300 animate-pulse rounded-md h-3 w-20"></div>
              </div>
              <div className="bg-gray-300 animate-pulse rounded-full h-16 w-16"></div>
            </div>
          ) : !user ? (
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
              <button
                onClick={() => document.getElementById('login-modal').classList.remove('hidden')}
                className="bg-customCyan hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customCyan rounded-full text-customBlack font-extrabold text-[9px] sm:text-xs md:text-sm lg:text-sm px-2 py-1 h-7 w-26 sm:h-8 sm:w-32 md:h-9 md:w-36 lg:h-9 lg:w-40"
              >
                {loginButtonText}
              </button>
            </div>
          ) : (
            <div className="flex items-center relative" ref={dropdownRef}>
              <h1 className="text-md text-white font-bold hidden md:block">
                <div className="tracking-wider leading-tight">
                  {/* Muestra el uid del usuario directamente desde currentUser */}
                  <span>{userData.name} {userData.lastname}</span>
                  <span className="block text-xs text-cyan-400">
                    {userData?.infoExtra}
                  </span>
                </div>
              </h1>
              <img
                src={userData?.profileImageUrl || 'https://i.pinimg.com/564x/f2/15/41/f21541d5d59eceb63be66d5f5eb6d42c.jpg'}
                alt="Avatar"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover cursor-pointer ml-4"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-52 w-48 bg-white rounded-lg shadow-xl z-50">
                  <ul className="p-2">
                    <li className="transform hover:scale-105 transition duration-200">
                      <a href={`/perfil/${user.uid}`} className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                        Perfil
                      </a>
                    </li>
                    {/* Solo muestra el link si tiene el permiso de verDashboardAdmin */}
                   { userData?.permissions.verDashboardAdmin && (
                      <li className="transform hover:scale-105 transition duration-200">
                        <a href="/admin/dashboard" className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                          Gestor de Miembros
                        </a>
                      </li>
                    )}
                    <li className="transform hover:scale-105 transition duration-200">
                      <button onClick={handleLogout} className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LoginModal /> {/* Mostrar modal de login */}
    </header>
  );
}
