import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { PermissionsDropdown } from './PermissionsDropdown';
import CoursesDropdown from './CoursesDropdown';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const profileDefaults = {
    permissions: [
      { id: "editProfiles", label: "Puede editar perfiles", checked: false },
      { id: "editCourses", label: "Puede editar cursos", checked: false },
      { id: "beNominator", label: "Puede ser nominador", checked: false },
      { id: "seeOwnCourses", label: "Puede ver sus propios cursos", checked: false },
      { id: "seeAllCourses", label: "Puede ver todos los cursos", checked: false },
    ],
    courses: [
      { id: 1, name: "Curso de algo", action: "Inscripción" },
      { id: 2, name: "Curso de algo", action: "Descargar certificado" },
      { id: 3, name: "Curso de algo", action: "Descargar certificado" },
    ]
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data) {
          setUserData(data);
        }
      } else {
        window.location.href = '/noLoggedIn';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div id="admin-dashboard-loading">Loading...</div>;
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 mb-auto rounded-3xl shadow-md bg-white">
      <h1 className="text-4xl text-customBlack font-bold uppercase mb-12 text-center">
        {userData.name} {userData.lastName}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center md:col-span-1">
          <img 
            src={userData.profileImageUrl || 'https://i.pinimg.com/enabled_lo/564x/1e/f6/42/1ef642c4c5864a930b260941dff37711.jpg'}
            alt="Imagen de perfil" 
            className="w-32 h-32 md:w-60 md:h-60 rounded-full object-cover mb-2" 
          />
          <div className="flex justify-center space-x-4 mb-2">
            <button className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full shadow hover:bg-gray-200 transition duration-300">
              <img className="w-4 h-4" src="https://img.icons8.com/material/24/upload--v1.png" alt="upload--v1" />
            </button>
            <button className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full shadow hover:bg-gray-200 transition duration-300">
              <img className="w-4 h-4" src="https://img.icons8.com/material/24/visible--v1.png" alt="visible--v1" />
            </button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="mb-6">
            {/* Pasando los permisos como prop */}
            <PermissionsDropdown permissions={profileDefaults.permissions}/>
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="nombres" className="block text-sm font-semibold text-gray-700">Nombres</label>
            <input 
              type="text" 
              id="nombres" 
              name="nombres" 
              placeholder="Nombres"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value={userData.name} 
              readOnly 
            />
          </div>

          <div>
            <label htmlFor="apellidos" className="block text-sm font-semibold text-gray-700">Apellidos</label>
            <input 
              type="text" 
              id="apellidos" 
              name="apellidos" 
              placeholder="Apellidos"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value={userData.lastName} 
              readOnly 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>         
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Correo Electrónico"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value={userData.email} 
              readOnly 
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
              <button className="text-sm font-light underline">Editar</button>
            </div>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Contraseña"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value="********" 
              readOnly 
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700">Dirección</label>    
            <input 
              type="text" 
              id="direccion" 
              name="direccion" 
              placeholder="Dirección"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value={userData.address} 
              readOnly 
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-semibold text-gray-700">DNI</label>
            <input 
              type="text" 
              id="dni" 
              name="dni" 
              placeholder="DNI"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 cursor-not-allowed" 
              value={userData.dni} 
              readOnly 
            />
          </div>
        </form>
          
        </div>

      </div>
      <CoursesDropdown courses={profileDefaults.courses} />
    </div>
  );  
}
