import { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function OnOffButton({ userId, courseId }) {
  const [isOn, setIsOn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingChange, setPendingChange] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  useEffect(() => {
    const fetchUserPermission = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Verificar si ya hay un archivo cargado
        const certificadoURL = userData?.permissionsCourse?.[courseId]?.certificadoCourse || '';
        setFileUploaded(!!certificadoURL);

        // Verificar el permiso para ver el certificado
        const coursePermission = userData?.permissionsCourse?.[courseId]?.verCertificado || false;
        setIsOn(coursePermission);
      } catch (error) {
        console.error('Error fetching user permission:', error);
      }
    };

    fetchUserPermission();
  }, [userId, courseId]);

  const togglePermission = () => {
    setPendingChange(!isOn);
    setShowModal(true);
  };

  const confirmChange = async () => {
    const newPermission = !isOn;
    setIsOn(newPermission);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`permissionsCourse.${courseId}.verCertificado`]: newPermission
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error updating permission:', error);
      setShowModal(false);
    }
  };

  const cancelChange = () => {
    setShowModal(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Generar una referencia única para el archivo
      const fileRef = ref(storage, `certificados/${userId}/${courseId}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // Guardar URL en Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`permissionsCourse.${courseId}.certificadoCourse`]: url
      });

      setFileUploaded(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-y-4">
      {/* Mostrar el botón para subir certificado si aún no se ha subido */}
      {!fileUploaded && (
        <div className="w-full text-center">
          <label htmlFor={`upload-cert-${courseId}`} className="cursor-pointer bg-white/90 text-customBlack shadow-md px-4 py-1 rounded-full text-xs font-semibold">
            {uploading ? 'Subiendo...' : 'Subir Certificado'}
          </label>
          <input
            id={`upload-cert-${courseId}`}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Mostrar el botón OnOff después de subir el certificado */}
      {fileUploaded && (
        <div className="flex flex-grid gap-2 items-center">
          <h1 className="hidden md:block font-normal">Ver Certificado</h1>
          <div className="relative w-16 h-6">
            <button
              onClick={togglePermission}
              className={`w-full h-full flex items-center rounded-full shadow-md p-1 transition-all duration-300 ${
                isOn ? 'bg-customGreen justify-end' : 'bg-red-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 transform"></div>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para el botón OnOff */}
      {showModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96">
            <h3 className="text-center text-2xl font-bold mb-4">¿Estás seguro?</h3>
            <p className="mb-4">Estás a punto de hacer visible el botón de "Ver Certificado". ¿Deseas continuar?</p>
            <div className="flex justify-between">
              <button
                onClick={cancelChange}
                className="bg-white/90 hover:scale-105 transition duration-300 ease-in-out text-customBlack px-4 py-2 rounded-xl text-md font-semibold shadow-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmChange}
                className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-white px-4 py-2 rounded-xl text-md font-semibold shadow-lg"
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
