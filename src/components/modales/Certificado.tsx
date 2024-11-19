import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/client';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import emailjs from 'emailjs-com';
import './animateModal.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { arrayUnion } from 'firebase/firestore';

const Certificadoo = ({ postId, postTitulo }: { postId: string; postTitulo: string }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    comprobante: null as File | null,
    previewUrl: '' as string | null,
  });

  const [formErrors, setFormErrors] = useState({
    nombre: false,
    apellido: false,
    dni: false,
    fechaNacimiento: false,
    comprobante: false,
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCertificateGranted, setIsCertificateGranted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            nombre: userData.name || '',
            apellido: userData.lastname || '',
            dni: userData.dni || '',
            fechaNacimiento: userData.birthday || '',
            comprobante: null,
            previewUrl: '',
          });

          const permissions = userData.permissionsCourse || [];
          if (Array.isArray(permissions) && permissions.includes(postId)) {
            setIsCertificateGranted(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, comprobante: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, previewUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, previewUrl: null }));
    }
  };

  const validateForm = () => {
    const errors = {
      nombre: formData.nombre.trim() === '',
      apellido: formData.apellido.trim() === '',
      dni: formData.dni.trim() === '',
      fechaNacimiento: formData.fechaNacimiento.trim() === '',
    };
    return !Object.values(errors).includes(true);
  };

  const validateFileUpload = () => {
    if (currentStep === 2 && !formData.comprobante) {
      setFormErrors((prev) => ({ ...prev, comprobante: true }));
      alert('Por favor, sube un comprobante.');
      return false;
    }
    return true;
  };

  const uploadFileToFirebase = async (file: File) => {
    const storage = getStorage();
    const storageRef = ref(storage, 'comprobantes/' + file.name);

    try {
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      return fileUrl;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !validateFileUpload()) return;

    setLoading(true);
    try {
      const formEmailData = {
        ...formData,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        fechaNacimiento: formData.fechaNacimiento,
        comprobante: formData.comprobante ? formData.comprobante.name : 'No se adjuntó comprobante',
        postId,
        postTitulo,

      };

      if (formData.comprobante) {
        const fileUrl = await uploadFileToFirebase(formData.comprobante);
        formEmailData.comprobante = fileUrl || '';
      }

      await emailjs.send('service_73wz0kg', 'template_omqhezu', formEmailData, '7g3zGf4-OkGD6aRO2');

      const userRef = doc(db, 'users', auth.currentUser?.uid || '');
      await updateDoc(userRef, {
        permissionsCourse: arrayUnion(postId),
      });

      setIsSubmitted(true);
      setIsSuccess(true);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Hubo un error al enviar la solicitud. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (validateForm()) setCurrentStep(2);
  };

  const handlePreviousStep = () => setCurrentStep(1);

  return (
    <>
      <button
        className="flex items-center justify-center px-6 py-3 text-white text-2xl font-semibold bg-[#187498] rounded-2xl hover:scale-105 transition-all duration-300 ease-in-out"
        onClick={() => setCurrentStep(1)} // Abre el modal en el paso 1
        disabled={isSubmitted || isCertificateGranted} // Deshabilitar el botón si ya se envió la solicitud o el certificado fue otorgado
      >
        {isSubmitted ? 'Esperando aprobación...' : isCertificateGranted ? 'Certificado otorgado' : 'Solicitar Certificado'}
      </button>

      {/* Modal de Certificado */}
      <div
        id="certificat-stepOne-modal"
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 ${currentStep === 0 ? 'hidden' : ''}`}
      >
        <div className="bg-white text-customBlack p-6 md:p-8 rounded-3xl shadow-lg max-w-md md:max-w-xl w-full transform transition-transform duration-300 scale-95 translate-y-4">
          <button
            className="absolute top-1 right-4 text-customBlack font-semibold text-xl"
            onClick={() => setCurrentStep(0)}
          >
            x
          </button>
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center w-full">
              <button
                className={`flex-1 h-12 text-sm md:text-base rounded-2xl ${currentStep === 1 ? 'text-white bg-customBlue' : 'text-customBlue border-2 border-customBlue'} flex items-center justify-center font-semibold cursor-pointer`}
                onClick={() => setCurrentStep(1)}
              >
                Formulario
              </button>
              <div className="w-20 border-t border-customBlue mx-2"></div>
              <button
                className={`flex-1 h-12 text-sm md:text-base rounded-2xl ${currentStep === 2 ? 'text-white bg-customBlue' : 'text-customBlue border-2 border-customBlue'} flex items-center justify-center font-semibold cursor-pointer`}
                onClick={() => currentStep === 1 && validateForm() ? setCurrentStep(2) : null} // Solo pasa al paso 2 si el formulario es válido
              >
                Pago
              </button>
            </div>
          </div>

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl md:text-3xl text-center font-bold mt-2 mb-6 text-CustomBlack">SOLICITUD DE CERTIFICADO</h2>
              {/* Formulario paso 1 */}
              <div className="mb-4">
                <label htmlFor="nombre" className="text-CustomBlack font-semibold text-xl">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.nombre && <p className="text-red-500 text-sm">Por favor ingrese su nombre.</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="apellido" className="text-CustomBlack font-semibold text-xl">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.apellido && <p className="text-red-500 text-sm">Por favor ingrese su apellido.</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="dni" className="text-CustomBlack font-semibold text-xl">DNI</label>
                <input
                  type="number"
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.dni && <p className="text-red-500 text-sm">Por favor ingrese su DNI.</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="fechaNacimiento" className="text-CustomBlack font-semibold text-xl">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.fechaNacimiento && <p className="text-red-500 text-sm">Por favor ingrese su fecha de nacimiento.</p>}
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={handleNextStep}
                  className="bg-[#187498] text-white text-xl rounded-2xl px-8 py-2 w-1/2"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

                  {/* Formulario paso 2 */}
                  {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl md:text-3xl text-center font-bold mt-2 mb-6 text-CustomBlack">
                      SOLICITUD DE CERTIFICADO
                    </h2>

                    {/* Datos bancarios */}
                    <div className="mb-6">
                      <label className="block text-CustomBlack font-bold text-lg mb-2">Datos bancarios</label>
                      <label className="block text-CustomBlack font-semibold">
                        <span className="font-bold">Razón social:</span> Colegio de Enfermería del Chaco
                      </label>
                      <label className="block text-CustomBlack font-semibold">
                        <span className="font-bold">CUIT:</span> 30-1234567-8
                      </label>
                      <label className="block text-CustomBlack font-semibold">
                        <span className="font-bold">CBU:</span> 124023230241248940423
                      </label>
                      <label className="block text-CustomBlack font-semibold mb-2">
                        <span className="font-bold">Alias:</span> CECH.INSTITUTO
                      </label>

                      {/* Área para subir el comprobante */}
                      <label className="block text-CustomBlack font-bold mb-2">Comprobante</label>
                      <div
                        className="w-full h-32 border-2 border-gray-300 border-dashed rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:border-[#187498] cursor-pointer"
                        onClick={() => document.getElementById('fileInput').click()} // Vincula el clic al input oculto
                      >
                        {formData.previewUrl ? (
                          <img
                            src={formData.previewUrl}
                            alt="Vista previa"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span>Haz clic o arrastra una imagen aquí</span>
                        )}
                      </div>
                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload} // Función para manejar el cambio de archivo
                        style={{ display: 'none' }} // Oculta el input
                      />
                    </div>

                    {/* Botones para continuar o cancelar */}
                    <div className="flex justify-between mt-8">
                      <button
                        className="text-[#187498] font-semibold"
                        onClick={handlePreviousStep}
                      >
                        Volver
                      </button>
                      <button
                        className="text-white bg-[#187498] px-6 py-3 rounded-2xl"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? 'Enviando...' : 'Enviar solicitud'}
                      </button>
                    </div>
                  </div>
                )}
        </div>
      </div>

      {/* Modal de éxito */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-center text-black rounded-3xl p-6 w-96">
            <h2 className="text-xl md:text-3xl font-bold mb-4">¡Solicitud enviada exitosamente!</h2>
            <button
              className="bg-[#187498] text-white text-xl rounded-2xl px-8 py-2"
              onClick={() => setIsSuccess(false)} // Cerrar modal
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Certificadoo;
