import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

const ModalButton: React.FC<{ title: string }> = ({ title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    curso: title,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonText, setButtonText] = useState("Inscribirme Ahora");
  const [buttonClass, setButtonClass] = useState("");

  const db = getFirestore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const nombre = userData.name || user.email || "Usuario no configurado";

          // Actualizar los campos del formulario con los datos del usuario
          setFormData((prev) => ({
            ...prev,
            nombre: nombre,
            email: user.email || "", // El email del usuario
          }));

          // Escuchar los cambios en los datos del usuario
          const unsubscribeUserStatus = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const updatedUserData = snapshot.data();
              const courses = updatedUserData.courses || [];

              // Verificar si el usuario está inscrito en el curso actual
              const isEnrolled = courses.some(
                (course) => course.courseTitle === title // Cambiar aquí a courseTitle
              );

              if (isEnrolled) {
                setButtonText("Inscripto");
                setButtonClass("opacity-90 cursor-not-allowed");
                setIsDisabled(true);
              } else {
                setButtonText("Inscribirme Ahora");
                setButtonClass("");
                setIsDisabled(false);
              }
            }
          });

          return () => unsubscribeUserStatus(); // Limpiar la suscripción cuando se desmonte el componente
        }
      }
    });

    return () => unsubscribeAuth(); // Limpiar la suscripción cuando se desmonte el componente
  }, [db, title]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const toggleSuccessModal = () => setIsSuccessModalOpen(!isSuccessModalOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const serviceID = "service_88h0u12";
    const templateID = "template_8vlkzlq";
    const publicKey = "fmsLmyp9XKYLAzpqV";

    try {
      // Enviar correo con EmailJS
      await emailjs.send(serviceID, templateID, formData, publicKey);

      // Guardar datos en Firestore
      const user = getAuth().currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        await updateDoc(userDocRef, {
          courses: [...(userData.courses || []), { courseTitle: title, courseId: Date.now() }], // Cambiar aquí para agregar el curso correctamente
        });
      }

      setButtonText("Esperando aprobación..");
      setButtonClass("opacity-90 cursor-not-allowed");
      setFormData({ nombre: "", email: "", telefono: "", curso: title });
      toggleModal();
      toggleSuccessModal();
    } catch (error) {
      console.error("Error al enviar el formulario o guardar los datos:", error);
      setErrorMessage("Ocurrió un error al procesar tu solicitud. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button
        id="inscribirme-btn"
        className={`bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-white px-10 py-3 rounded-xl text-xl font-semibold ${buttonClass}`}
        onClick={toggleModal}
        disabled={isDisabled}
      >
        {buttonText}
      </button>

      {isModalOpen && (
        <div
          id="certificat-stepOne-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white animate-fadeIn text-customBlack p-6 md:p-8 rounded-3xl shadow-lg max-w-md md:max-w-xl w-full transform transition-transform duration-300 scale-95 translate-y-4">
            <h2 className="text-2xl md:text-3xl text-center font-bold mt-2 mb-6 uppercase">
              Inscribirme Ahora
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-lg font-bold">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre} // Correcto acceso a nombre
                  onChange={handleChange}
                  className="border border-customBlack rounded-2xl w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-lg font-bold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-customBlack rounded-2xl w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="telefono" className="block text-lg font-bold">
                  Teléfono
                </label>
                <input
                  type="number"
                  id="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="border border-customBlack rounded-2xl w-full p-2"
                  required
                />
              </div>

              {errorMessage && (
                <p className="text-red-600 text-sm font-semibold">{errorMessage}</p>
              )}

              <div className="flex justify-end pt-4 mt-8">
                <button
                  id="stepTwo-btn"
                  className={`text-white bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-sm font-semibold px-6 py-2 rounded-xl ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>

            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-customBlue text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 opacity-100 pointer-events-auto transition-opacity duration-300">
          <div className="bg-customCyan text-customBlack p-8 md:p-10 lg:p-12 rounded-3xl shadow-lg max-w-md md:max-w-lg w-full transform transition-transform duration-300 scale-95 translate-y-4">
            <h2 className="text-2xl md:text-3xl text-center font-extrabold mb-8">
              ¡SOLICITUD ENVIADA CORRECTAMENTE!
            </h2>
            <p className="text-sm md:text-base text-center font-semibold mb-8">
              Tu inscripción se ha enviado con éxito. El proceso tardará de 24 a 72hs horas en ser aprobado.
            </p>

            <div className="flex justify-center flex-col items-center mb-3">
              <button
                id="close-final-btn"
                className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-white px-10 py-3 rounded-xl text-xl font-semibold"
                onClick={toggleSuccessModal}
              >
                CONTINUAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalButton;
