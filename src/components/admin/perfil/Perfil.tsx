import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PermissionsDropdown } from './PermissionsDropdown';
import CoursesDropdown from './CoursesDropdown';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteUser } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { updateEmail } from 'firebase/auth';

export default function UserProfile({ userId }) {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    address: '',
    dni: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false); 
  const [newPassword, setNewPassword] = useState('');
  const [imagePreview, setImagePreview] = useState(''); // Estado para previsualizar la imagen
  const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const data = userDoc.data();
        if (data) {
          setUserData(data);
          setFormData({
            name: data.name || '',
            lastname: data.lastname || '',
            email: data.email || '',
            address: data.address || '',
            dni: data.dni || '',
          });
          setImagePreview(data.profileImageUrl || ''); // Establecer la imagen de perfil si existe
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      console.error("No userId provided");
      setLoading(false);
    }
  }, [userId]);

  const handleImageClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement; 
      const file = target.files?.[0]; 
      if (!file) return;

      // Previsualizar la imagen seleccionada
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Actualizar la URL de la imagen para previsualizarla
      };
      reader.readAsDataURL(file); // Cargar la imagen como URL de datos

      setSelectedImage(file); // Guardar la imagen seleccionada en el estado
    };

    fileInput.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleChangePassword = async () => {
    if (!newPassword) {
      alert('Por favor, ingrese una nueva contraseña.');
      return;
    }

    const user = auth.currentUser;

    if (user) {
      try {
        await user.updatePassword(newPassword); 
        alert('Contraseña actualizada exitosamente');
        setIsPasswordEditing(false);
      } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        alert('Error al actualizar la contraseña');
      }
    } else {
      alert('No se ha encontrado un usuario autenticado');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isPasswordEditing) {
        await handleChangePassword(); 
      }

      // Guardar los datos del formulario
      await updateDoc(doc(db, 'users', userId), formData); 

      // Subir la imagen si se seleccionó una
      if (selectedImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `profile_images/${userId}/${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        const imageUrl = await getDownloadURL(imageRef);

        // Actualizar la URL de la imagen en la base de datos
        await updateDoc(doc(db, 'users', userId), {
          profileImageUrl: imageUrl,
        });
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert('Error al actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      alert('No se ha encontrado un usuario autenticado.');
      return;
    }
  
    if (formData.email === '') {
      alert('Por favor, ingrese un correo electrónico válido.');
      return;
    }
  
    try {
      await updateEmail(user, formData.email); // Actualiza el correo en Firebase Authentication
      await updateDoc(doc(db, 'users', userId), { email: formData.email }); // Actualiza el correo en Firestore
      alert('Correo electrónico actualizado exitosamente.');
    } catch (error) {
      console.error('Error al cambiar el correo:', error);
      alert('Hubo un error al intentar cambiar el correo.');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const user = getAuth().currentUser;
  
      // Verificar si el usuario está autenticado
      if (!user) {
        alert('No se ha encontrado un usuario autenticado');
        return;
      }
  
      // Obtener los permisos del usuario autenticado desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
  
      // Verificar si tiene el permiso 'eliminarMiembro' o si está intentando eliminar su propia cuenta
      if (userData?.permissions?.eliminarMiembro || user.uid === userId) {
        // Eliminar el usuario de Firestore
        await deleteDoc(doc(db, 'users', userId)); // Elimina los datos del usuario en Firestore
  
        // Eliminar el usuario de Firebase Authentication
        const authUser = getAuth().currentUser; // Obtener el usuario autenticado actual
  
        if (authUser) {
          // Si el usuario está autenticado, eliminarlo
          await deleteUser(authUser);  // Eliminar la cuenta de Firebase Authentication
  
          alert('Usuario eliminado exitosamente.');
          window.location.href = '/admin/dashboard'; // Redirigir después de la eliminación
        } else {
          alert('El usuario no está autenticado.');
        }
      } else {
        alert('No tienes permiso para eliminar este usuario.');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Error al eliminar el usuario.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 mb-auto rounded-3xl shadow-md bg-white">
        <h1 className="text-4xl text-customBlack font-bold uppercase mb-12 text-center">
          Cargando...
        </h1>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 mb-auto rounded-3xl shadow-md bg-white ">
      <h1 className="text-4xl text-customBlack font-bold uppercase mb-12 text-center">
        {userData.name} {userData.lastname}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex flex-col items-center md:col-span-1">
        <div className="relative flex flex-col items-center rounded-full overflow-hidden cursor-pointer">
          <img
            src={imagePreview || 'https://i.pinimg.com/564x/f2/15/41/f21541d5d59eceb63be66d5f5eb6d42c.jpg'}
            alt="Imagen de perfil"
            className="w-32 h-32 md:w-60 md:h-60 object-cover mb-2 rounded-full shadow-md shadow-gray-300"  // Asegúrate de que el contenedor de la imagen sea circular también
          />
          <div
            className="absolute inset-0 w-32 h-32 md:w-60 md:h-60 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleImageClick}
          >
            <img src="/media/SubirImagen.png" alt="Subir imagen" className="w-16 h-16 md:w-24 md:h-24 text-white" />
          </div>
        </div>
        <div className='flex justify-between items-center gap-2'>
        <button
            onClick={handleSave}
            className="w-fit p-1 mt-4 mb-6 bg-[#187498] text-white rounded-full hover:bg-cyan-600 hover:scale-105 transition-all duration-200"
            disabled={saving}
            title="Guardar cambios" // Agregado para mostrar el texto al hacer hover
          >
            {saving ? (
              <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"></path>
              </svg>
            ) : (
              <div className=''>
                <svg data-testid="geist-icon" className="w-5 h-5 p-1" strokeLinejoin="round" viewBox="0 0 16 16"><path fillRule="evenodd" clipRule="evenodd" d="M1.5 4.875C1.5 3.01104 3.01104 1.5 4.875 1.5C6.20018 1.5 7.34838 2.26364 7.901 3.37829C8.1902 3.96162 8.79547 4.5 9.60112 4.5H12.25C13.4926 4.5 14.5 5.50736 14.5 6.75C14.5 7.42688 14.202 8.03329 13.7276 8.44689L13.1622 8.93972L14.1479 10.0704L14.7133 9.57758C15.5006 8.89123 16 7.8785 16 6.75C16 4.67893 14.3211 3 12.25 3H9.60112C9.51183 3 9.35322 2.93049 9.2449 2.71201C8.44888 1.1064 6.79184 0 4.875 0C2.18261 0 0 2.18261 0 4.875V6.40385C0 7.69502 0.598275 8.84699 1.52982 9.59656L2.11415 10.0667L3.0545 8.89808L2.47018 8.42791C1.87727 7.95083 1.5 7.22166 1.5 6.40385V4.875ZM7.29289 7.39645C7.68342 7.00592 8.31658 7.00592 8.70711 7.39645L11.7803 10.4697L12.3107 11L11.25 12.0607L10.7197 11.5303L8.75 9.56066V15.25V16H7.25V15.25V9.56066L5.28033 11.5303L4.75 12.0607L3.68934 11L4.21967 10.4697L7.29289 7.39645Z" fill="currentColor"></path></svg>
              </div>
            )}
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-fit p-1 mt-4 mb-6 bg-red-500 border-red text-white rounded-full hover:bg-red-400 hover:scale-110 transition-all duration-200"
            disabled={saving}
            title="Eliminar usuario" // Agregado para mostrar el texto al hacer hover
          >
            {saving ? (
              <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z"></path>
              </svg>
            ) : (
              
              <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="red"
              className="bg-red-600 rounded-full transition-colors duration-300"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path>
              <path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"></path>
              <path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"></path>
            </svg>
            
              
            )}
          </button>
        </div>
      </div>

        <div className="md:col-span-2">
          <div className="mb-6">
            <PermissionsDropdown permissions={userData.permissions} />
          </div>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="nombres" className="block text-sm font-semibold text-gray-700">Nombres</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Nombres"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 px-4 py-2"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">Apellidos</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Apellidos"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 px-4 py-2"
                value={formData.lastname}
                onChange={handleChange}
              />
            </div>

            <div>
              <div className='flex items-center gap-2 justify-between'>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Correo Electrónico
                </label>
                 {/* Botón para cambiar el correo 
                  <button
                  onClick={handleChangeEmail}
                  className="text-[#187498] text-sm hover:text-blue-400 hover:underline"
                  title="Actualizar correo"
                >
                  Actualizar correo
                </button>
                 */}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2 outline-none pointer-events-none"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
              
              </div>
              <input
                type={isPasswordEditing ? 'password' : 'text'}
                id="password"
                name="password"
                placeholder="Contraseña"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 px-4 py-2"
                value={isPasswordEditing ? newPassword : '********'}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={!isPasswordEditing}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Dirección"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 px-4 py-2"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-semibold text-gray-700">DNI</label>
              <input
                type="text"
                id="dni"
                name="dni"
                placeholder="DNI"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 px-4 py-2"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>
          </form>
          
        </div>
      </div>

      <CoursesDropdown userId={userId} />
      
      {/* Modal de confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar eliminación</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
