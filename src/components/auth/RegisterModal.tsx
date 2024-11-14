import React, { useState } from 'react';
import { auth, db } from '../../firebase/client';
import {getAuth ,createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

// Abre el modal
export const initializeModalMiembro = (modalId) => {
  document.getElementById(modalId)?.classList.add('hidden');
};

// Inicializar el modal en hidden y abrirlo
export const openModalMiembro = (modalId) => {
  document.getElementById(modalId)?.classList.remove('hidden');
};

// Cierra el modal
export const closeModalMiembro = (modalId) => {
  document.getElementById(modalId)?.classList.add('hidden');
};

const RegisterModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [lastname, setLastname] = useState('');
  const [role, setRole] = useState('');
  const [dni, setDni] = useState('');
  const [matricula, setMatricula] = useState('');
  const [lugarDeOrigen, setLugarDeOrigen] = useState('');
  const [infoExtra, setInfoExtra] = useState('');

const handleRegister = async (e) => {
  e.preventDefault();

  try {
    // Crea el nuevo usuario en Firebase sin loguearse automáticamente
    const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
    const user = userCredential.user;

    // Actualiza el perfil del nuevo usuario (por ejemplo, el nombre)
    await updateProfile(user, { displayName: name });

    // Define los permisos predeterminados para el nuevo usuario
    const permisosPredeterminados = {
      verCursos: false,
      editarCursos: false,
      agregarCurso: false,
      eliminarCurso: false,
      verNoticias: false,
      editarNoticias: false,
      agregarNoticia: false,
      eliminarNoticia: false,
      verMatriculados: false,
      agregarMatriculado: false,
      editarPanelTramites: false,
      editarPanelDictamenes: false,
      editarPanelInfoInstitucional: false,
      agregarMiembro: false,
      eliminarMiembro: false,
      editarMiembro: false,
      modificarPermisos: false,
    };

    // Guarda los datos del nuevo usuario en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      birthday,
      lastname,
      role,
      dni,
      matricula,
      lugarDeOrigen,
      infoExtra,
      permissions: permisosPredeterminados,
    });

    // Cierra el modal
    closeModalMiembro('register-modal');

    // Limpia los campos del formulario
    setEmail('');
    setPassword('');
    setName('');
    setBirthday('');
    setLastname('');
    setRole('');
    setDni('');
    setMatricula('');
    setLugarDeOrigen('');
    setInfoExtra('');

    // Actualiza el estado o recarga la página si es necesario
    window.location.reload();

  } catch (error) {
    console.error('Error al registrarse:', error);
    alert(`Error al registrarse: ${error.message}`);
  }
};

  

  return (
    <div id="register-modal" className="flex justify-center items-center fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
      <div className="bg-white text-customBlack p-6 mx-2 sm:p-8 md:p-10 rounded-3xl shadow-lg max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 translate-y-0 relative animate-fadeIn">
        
        <svg
          onClick={() => closeModalMiembro('register-modal')}
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-4 right-4 h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>

        <form onSubmit={handleRegister} className="flex flex-col py-4 gap-y-2 text-left">
          <h2 className="text-3xl text-customBlue sm:text-4xl text-center font-bold mt-2 mb-6">Registrarse</h2>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="text"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="text"
            placeholder="Lugar de Origen"
            value={lugarDeOrigen}
            onChange={(e) => setLugarDeOrigen(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <input
            type="text"
            placeholder="Información Extra"
            value={infoExtra}
            onChange={(e) => setInfoExtra(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border outline-none border-customBlack rounded-2xl w-full p-2 mb-4"
          />
          <button type="submit" className="bg-customBlue transition duration-300 hover:scale-105 text-white text-sm font-semibold px-6 py-3 rounded-xl w-full mt-4">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
