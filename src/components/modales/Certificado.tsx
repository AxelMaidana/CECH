import React, { useState } from 'react';
import { db } from '../../firebase/client'; // Asegúrate de importar tu configuración de Firebase
import { addDoc, collection } from 'firebase/firestore';
import './animateModal.css';

const Certificadoo = ({ postId, postTitulo }: { postId: string; postTitulo: string }) => {
  const [currentStep, setCurrentStep] = useState(0); // Empieza en el paso 1 (Formulario)
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
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Para controlar la visibilidad del modal de éxito

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
    setFormErrors(errors);
    return !Object.values(errors).includes(true);
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep(2); // Cambia al paso 2 (Pago)
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1); // Cambia al paso 1 (Formulario)
  };

  const handleCloseModal = () => {
    setCurrentStep(0);
    setFormData({
      nombre: '',
      apellido: '',
      dni: '',
      fechaNacimiento: '',
      comprobante: null,
      previewUrl: null,
    });
    setFormErrors({
      nombre: false,
      apellido: false,
      dni: false,
      fechaNacimiento: false,
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const docData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        fechaNacimiento: formData.fechaNacimiento,
        postId,
        postTitulo,
        timestamp: new Date(),
      };

      const collectionRef = collection(db, 'peticiondecertificado');
      await addDoc(collectionRef, docData);

      setIsSuccess(true); // Mostrar el modal de éxito
    } catch (error) {
      console.error('Error al guardar la solicitud:', error);
      alert('Hubo un error al guardar la solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        className="flex items-center justify-center px-6 py-3 text-white text-2xl font-semibold bg-[#187498] rounded-2xl hover:scale-105 transition-all duration-300 ease-in-out"
        onClick={() => setCurrentStep(1)} // Abre el modal en el paso 1
      >
        Solicitar Certificado
      </button>

      {/* Modal de Certificado */}
      <div
        id="certificat-stepOne-modal"
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all duration-300 ${
          currentStep === 0 ? 'hidden' : ''
        }`}
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
              <div className='mb-4'>
                <label htmlFor="nombre" className='text-CustomBlack font-semibold text-xl'>Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none" 
                />
                {formErrors.nombre && <span className="text-red-500">Este campo es obligatorio</span>}
              </div>
              <div className='mb-4'>
                <label htmlFor="apellido" className='text-CustomBlack font-semibold text-xl'>Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.apellido && <span className="text-red-500">Este campo es obligatorio</span>}
              </div>
              <div className='mb-4'>
                <label htmlFor="dni" className='text-CustomBlack font-semibold text-xl'>DNI</label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.dni && <span className="text-red-500">Este campo es obligatorio</span>}
              </div>
              <div className='mb-4'>
                <label htmlFor="fechaNacimiento" className='text-CustomBlack font-semibold text-xl'>Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                  className="border border-customBlack rounded-2xl p-2 w-full mb-2 outline-none"
                />
                {formErrors.fechaNacimiento && <span className="text-red-500">Este campo es obligatorio</span>}
              </div>

              <div className="mt-8 text-end">
                <button className="hover:scale-105 transition duration-300 ease-in-out text-[#187498] font-semibold underline" onClick={handleNextStep}>Siguiente</button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl md:text-3xl text-center font-bold mt-2 mb-6 text-CustomBlack">Vista Previa del Comprobante</h2>
              {/* Vista previa del archivo */}
              {formData.previewUrl && (
                <div className="mb-6">
                  <img src={formData.previewUrl} alt="Vista previa" className="max-w-full h-auto mb-4" />
                </div>
              )}
              {/* Continuar o cancelar */}
              <div className="flex justify-between mt-8">
                <button className="text-[#187498] font-semibold" onClick={handlePreviousStep}>Volver</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-slideInFromRight">
          <div className="bg-white text-CustomBlack p-6 md:p-8 rounded-3xl shadow-lg max-w-md w-full transform scale-95">
            <h2 className="text-3xl font-semibold mb-6 text-center">¡Solicitud Enviada!</h2>
            <p className="text-xl text-center mb-6">Tu solicitud ha sido enviada correctamente.</p>
            <button
              className="w-full text-white bg-[#187498] px-6 py-3 rounded-2xl"
              onClick={handleCloseModal}
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
