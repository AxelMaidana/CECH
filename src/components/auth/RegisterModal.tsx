import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/client';

export const initializeModalMiembro = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden'); // Inicializa el modal oculto.
};

export const openModalMiembro = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden'); // Abre el modal cuando se hace clic.
};

export const closeModalMiembro = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden'); // Cierra el modal.
};

const RegisterModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [lastname, setLastname] = useState('');
  const [role, setRole] = useState('user'); // Valor predeterminado
  const [dni, setDni] = useState('');
  const [matricula, setMatricula] = useState('');
  const [lugarDeOrigen, setLugarDeOrigen] = useState('');
  const [infoExtra, setInfoExtra] = useState('');
  const [image, setImage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !name || !lastname) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;

      const userData = {
        name,
        lastname,
        email,
        birthday,
        dni,
        matricula,
        lugarDeOrigen,
        infoExtra,
        role,
        image: image || '',
        permissions: {
          verDashboardAdmin: false,
          verCursos: false,
          verNoticias: false,
          verMatriculados: false,
          agregarCurso: false,
          agregarNoticia: false,
          agregarMatriculado: false,
          agregarMiembro: false,
          editarNoticias: false,
          editarMiembro: false,
          editarCursos: false,
          editarPanelActAcademica: false,
          editarPanelMatriculado: false,
          editarPanelBecas: false,
          editarPanelTramites: false,
          editarPanelDictamenes: false,
          editarPanelContacto: false,
          editarPanelInfoInstitucional: false,
          editarPanelNoticias: false,
          eliminarCurso: false,
          eliminarNoticia: false,
          eliminarMiembro: false,
          modificarPermisos: false,
        },
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('Usuario creado exitosamente:', user.uid);
      closeModalMiembro('register-modal');
      resetForm();
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert(`Error al registrarse: ${error.message}`);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setBirthday('');
    setLastname('');
    setRole('user');
    setDni('');
    setMatricula('');
    setLugarDeOrigen('');
    setInfoExtra('');
    setImage('');
  };

  return (
    <div>
      <button
        onClick={() => openModalMiembro('register-modal')}
        className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-white px-4 py-2 rounded-xl text-md font-semibold"
      >
        Agregar Miembro
      </button>

      <div
        id="register-modal"
        className="flex justify-center items-center fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden"
      >
        <div className="bg-white text-customBlack p-6 mx-2 sm:p-8 md:p-10 rounded-3xl shadow-lg max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100 translate-y-0 relative animate-fadeIn">
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

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <h2 className="text-3xl text-customBlue sm:text-4xl text-center font-bold col-span-2 mt-2 mb-6 uppercase">Inscribir a un Miembro</h2>

            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
              required
            />
            <input
              type="date"
              placeholder="Fecha de nacimiento"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
            <input
              type="text"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
            <input
              type="text"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
            <input
              type="text"
              placeholder="Lugar de Origen"
              value={lugarDeOrigen}
              onChange={(e) => setLugarDeOrigen(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
            <input
              type="text"
              placeholder="Información Extra"
              value={infoExtra}
              onChange={(e) => setInfoExtra(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border outline-none border-customBlack rounded-2xl w-full p-2"
              required
            />

            <div className='flex justify-end col-span-2 mt-4 mb-6'>
              <button
                type="submit"
                className="bg-[#187498] transition duration-300 hover:scale-105 text-white text-md font-semibold px-6 py-3 rounded-xl w-full sm:w-fit mt-4"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
