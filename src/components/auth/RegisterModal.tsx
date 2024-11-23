import React, { useState } from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/client';

export const initializeModalMiembro = (modalId: string) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden'); // Inicializa el modal oculto.
};

export const openModalMiembro = (modalId: string) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden'); // Abre el modal cuando se hace clic.
};

export const closeModalMiembro = (modalId: string) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden'); // Cierra el modal.
};

const RegisterModal = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [dni, setDni] = useState('');
  const [matricula, setMatricula] = useState('');
  const [lugarDeOrigen, setLugarDeOrigen] = useState('');
  const [infoExtra, setInfoExtra] = useState('');
  const [image, setImage] = useState('');

  // Permisos predeterminados
  const defaultPermissions = {
    verDashboardAdmin: false,
    verCursos: false,
    verNoticias: false,
    verMatriculados: false,
    agregarCurso: false,
    agregarNoticia: false,
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
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !lastname) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      // Datos del usuario a guardar en Firestore
      const userData = {
        name,
        lastname,
        email,
        birthday,
        dni,
        matricula,
        lugarDeOrigen,
        infoExtra,
        image: image || '',
        createdAt: new Date(),
        permissions: defaultPermissions, // Asignamos los permisos predeterminados
      };

      // Guardar los datos del usuario en Firestore
      await setDoc(doc(db, 'users', email), userData);
      console.log('Usuario guardado exitosamente en Firestore:', email);
      closeModalMiembro('register-modal');
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error('Error al registrar:', error);
      alert(`Error al registrar: ${error.message}`);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setLastname('');
    setBirthday('');
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
        <span className="block sm:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h12M12 6v12" />
          </svg>
        </span>
        <span className="hidden sm:block">Agregar miembro</span>
      </button>

      <div
        id="register-modal"
        className="flex justify-center items-center fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden"
      >
        <div className="bg-white text-customBlack p-6 mx-2 sm:p-8 md:p-10 rounded-3xl shadow-lg max-w-sm sm:max-w-md lg:max-w-4xl w-full transform transition-all duration-300 scale-100 opacity-100 translate-y-0 relative animate-fadeIn">
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
            <h2 className="text-2xl md:text-3xl text-customBlue font-bold col-span-1 sm:col-span-2 mt-2 mb-6 text-center uppercase">
              Inscribir a un Miembro
            </h2>

            <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" required />
            <input type="text" placeholder="Apellido" value={lastname} onChange={(e) => setLastname(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" required />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" required />
            <input type="date" placeholder="Fecha de nacimiento" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" />
            <input type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" />
            <input type="text" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" />
            <input type="text" placeholder="Lugar de Origen" value={lugarDeOrigen} onChange={(e) => setLugarDeOrigen(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" />
            <input type="text" placeholder="Cargo que ocupa" value={infoExtra} onChange={(e) => setInfoExtra(e.target.value)} className="border outline-none border-customBlack rounded-2xl w-full p-2" />

            <div className="flex justify-end col-span-1 sm:col-span-2 mt-4">
              <button type="submit" className="w-full sm:w-fit bg-[#187498] text-white px-4 py-2 rounded-xl hover:scale-105 transition duration-300 ease-in-out">
                Registrar Miembro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;