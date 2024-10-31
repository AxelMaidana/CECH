import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


export default function ContentHeader({ logoSrc, titleLine1, titleLine2, loginButtonText }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    const loginModal = document.getElementById('login-modal');
    loginModal?.classList.remove('hidden');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
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

        <div className="flex items-center">
          {!user ? (
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
              <button
                onClick={handleLogin}
                className="bg-customCyan hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customCyan rounded-full text-customBlack font-extrabold text-[9px] sm:text-xs md:text-sm lg:text-sm px-2 py-1 h-7 w-26 sm:h-8 sm:w-32 md:h-9 md:w-36 lg:h-9 lg:w-40"
              >
                {loginButtonText}
              </button>
            </div>
          ) : (
            <div className="flex items-center relative" ref={dropdownRef}>
              <h1 className="text-md text-white font-bold hidden md:block">
                <div className="tracking-wider leading-tight">
                  <span>{userData?.name} {userData?.lastName}</span>
                  <span className="block text-xs text-cyan-400">
                    {userData?.role === 'admin' ? 'Administrador' : userData?.role === 'user' ? 'Usuario' : 'Invitado'}
                  </span>
                </div>
              </h1>
              <img
                src={userData?.profileImageUrl || 'https://i.pinimg.com/564x/f2/15/41/f21541d5d59eceb63be66d5f5eb6d42c.jpg'}
                alt="Avatar"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full cursor-pointer ml-4"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-52 w-48 bg-white rounded-lg shadow-xl z-50">
                  <ul className="p-2">
                    <li className="transform hover:scale-105 transition duration-200">
                      <a href="/perfil" className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                        <svg className="mr-2" data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: 'currentcolor' }}>
                          <path fillRule="evenodd" clipRule="evenodd" d="M7.75 0C5.95507 0 4.5 1.45507 4.5 3.25V3.75C4.5 5.54493 5.95507 7 7.75 7H8.25C10.0449 7 11.5 5.54493 11.5 3.75V3.25C11.5 1.45507 10.0449 0 8.25 0H7.75ZM6 3.25C6 2.2835 6.7835 1.5 7.75 1.5H8.25C9.2165 1.5 10 2.2835 10 3.25V3.75C10 4.7165 9.2165 5.5 8.25 5.5H7.75C6.7835 5.5 6 4.7165 6 3.75V3.25ZM2.5 14.5V13.1709C3.31958 11.5377 4.99308 10.5 6.82945 10.5H9.17055C11.0069 10.5 12.6804 11.5377 13.5 13.1709V14.5H2.5ZM6.82945 9C4.35483 9 2.10604 10.4388 1.06903 12.6857L1 12.8353V13V15.25V16H1.75H14.25H15V15.25V13V12.8353L14.931 12.6857C13.894 10.4388 11.6452 9 9.17055 9H6.82945Z" fill="currentColor"></path>
                        </svg>
                        Perfil  
                      </a>
                    </li>
                    {userData?.role === 'admin' && (
                      <li className="transform hover:scale-105 transition duration-200">
                        <a href="/admin/dashboard" className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                          <svg className="mr-2" data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: 'currentcolor' }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 1C0 0.447716 0.447715 0 1 0H15C15.5523 0 16 0.447716 16 1V10C16 10.5523 15.5523 11 15 11H12.5V9.5H14.5V1.5H1.5V9.5H3.5V11H1C0.447715 11 0 10.5523 0 10V1ZM8 14C6.84509 14 5.76659 14.5772 5.12596 15.5381L5 15.7271V16H3.5V15.5V15.2729L3.62596 15.084L3.87789 14.7061C4.79671 13.3278 6.34356 12.5 8 12.5C9.65644 12.5 11.2033 13.3278 12.1221 14.7061L12.374 15.084L12.5 15.2729V15.5V16H11V15.7271L10.874 15.5381C10.2334 14.5772 9.15491 14 8 14ZM7.75 6C6.50736 6 5.5 7.00736 5.5 8.25V8.75C5.5 9.99264 6.50736 11 7.75 11H8.25C9.49264 11 10.5 9.99264 10.5 8.75V8.25C10.5 7.00736 9.49264 6 8.25 6H7.75ZM7 8.25C7 7.83579 7.33579 7.5 7.75 7.5H8.25C8.66421 7.5 9 7.83579 9 8.25V8.75C9 9.16421 8.66421 9.5 8.25 9.5H7.75C7.33579 9.5 7 9.16421 7 8.75V8.25Z" fill="currentColor"></path>
                          </svg>
                          Dashboard
                        </a>
                      </li>
                    )}
                    <li className="transform hover:scale-105 transition duration-200">
                      <button onClick={handleLogout} className="flex items-center p-2 text-sm text-gray-900 rounded-lg hover:bg-gray-100 w-full text-left">
                        <svg className="mr-2" data-testid="geist-icon" height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" style={{ color: 'currentcolor' }}>
                          <path fillRule="evenodd" clipRule="evenodd" d="M2.5 13.5H6.75V15H2C1.44772 15 1 14.5523 1 14V2C1 1.44771 1.44772 1 2 1H6.75V2.5L2.5 2.5L2.5 13.5ZM12.4393 7.24999L10.4697 5.28031L9.93934 4.74998L11 3.68932L11.5303 4.21965L14.6036 7.29288C14.9941 7.6834 14.9941 8.31657 14.6036 8.70709L11.5303 11.7803L11 12.3106L9.93934 11.25L10.4697 10.7197L12.4393 8.74999L5.75 8.74999H5V7.24999H5.75L12.4393 7.24999Z" fill="currentColor"></path>
                        </svg>
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
    </header>
  );
}