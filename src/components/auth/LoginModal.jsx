import React, { useState } from 'react';
import { auth, db } from '../../firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar y obtener datos del usuario desde Firestore
      await checkLogin(user.uid);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
      } else {
        setError('Ha ocurrido un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  // Función para verificar los permisos del usuario
  const checkLogin = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Guardar permisos en localStorage o estado
        localStorage.setItem('userPermissions', JSON.stringify(userData.permissions || {}));
        window.location.href = '/';
      } else {
        setError('El usuario no tiene permisos asignados.');
      }
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      setError('Ha ocurrido un error al verificar los datos del usuario.');
    }
  };
  

  const closeModal = () => {
    document.getElementById('login-modal').classList.add('hidden');
    setError('');
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === 'login-modal') {
      closeModal();
    }
  };

  return (
    <div 
      id="login-modal" 
      className="flex justify-center items-center fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50" 
      onClick={handleOverlayClick}
    >
      <div className="bg-white text-customBlack p-6 mx-2 sm:p-8 md:p-10 rounded-3xl shadow-lg max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 translate-y-0 relative animate-fadeIn">
        
        <svg
          onClick={closeModal}
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-4 right-4 h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>

        <form onSubmit={handleLogin} className='flex flex-col py-4 gap-y-2 text-left'>
          <h2 className="text-3xl text-customBlue sm:text-4xl text-center font-bold mt-2 mb-6">INICIAR SESIÓN</h2>
          <div className='pb-3'>
            <label htmlFor="email" className="block text-lg font-bold">Correo Electrónico</label>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
          </div>
          <div className='pb-3'>
            <label htmlFor="password" className="block text-lg font-bold">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
          </div>

          <div className='items-center justify-center flex mt-2'>
            <button type="submit" className="bg-customBlue transition duration-300 hover:scale-105 text-white text-sm font-semibold px-6 py-3 rounded-xl w-fit">
              Iniciar Sesión
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
