import React, { useState } from 'react';
import { auth, db } from '../../firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

// Abre el modal
export const initializeModal = (modalId: string) => {
  document.getElementById(modalId)?.classList.add('hidden');
};

// Inicializar el modal en hidden y abrirlo
export const openModal = (modalId: string) => {
  document.getElementById(modalId)?.classList.remove('hidden');
};

// Cierra el modal
export const closeModal = (modalId: string) => {
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
      // Crea el usuario en Firebase, pero no inicies sesión automáticamente.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
  
      // Guarda los datos en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        birthday,
        lastname,
        role,
        dni,
        matricula,
        lugarDeOrigen,
        infoExtra,
      }, { merge: true });
  
      // Cierra el modal
      closeModal('register-modal');
      
      // Limpiar los campos del formulario
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
  
      // Opcional: refrescar la página (si es necesario)
      window.location.reload();
  
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert(`Error al registrarse: ${error.message}`); // Muestra un mensaje de error al usuario
    }
  };
  

  return (
    <div id="register-modal" className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Registrarse</h3>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="Lugar de Origen"
            value={lugarDeOrigen}
            onChange={(e) => setLugarDeOrigen(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="text"
            placeholder="Información Extra"
            value={infoExtra}
            onChange={(e) => setInfoExtra(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Registrarse
          </button>
        </form>
        <button
          onClick={() => closeModal('register-modal')}
          className="mt-4 w-full bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
