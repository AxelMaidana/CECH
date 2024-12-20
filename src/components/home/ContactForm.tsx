import { useState } from "react";
import emailjs from "emailjs-com";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage SDK
import { storage } from "../../firebase/client";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    email: "",
    phone: "",
    image: null, // Para almacenar la imagen seleccionada
  });
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && !file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5 MB.");
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      image: file,
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      let imageUrl = "";

      if (formData.image) {
        // Subir imagen a Firebase Storage
        const imageRef = ref(storage, `images/${formData.dni}/${Date.now()}-${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Datos del formulario para enviar a EmailJS
      const formDataObject = {
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        image_url: imageUrl || "No se subió ninguna imagen",
      };

      // Enviar correo con EmailJS
      await emailjs.send(
        "service_tu9kik5", // Reemplaza con tu ID de servicio de EmailJS
        "template_40z5kyi", // Reemplaza con tu ID de plantilla de EmailJS
        formDataObject,
        "fmsLmyp9XKYLAzpqV" // Reemplaza con tu ID de usuario de EmailJS
      );

      setMessage("¡Tu mensaje fue enviado con éxito! Nos pondremos en contacto pronto.");
      setFormData({
        name: "",
        dni: "",
        email: "",
        phone: "",
        image: null,
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setMessage("Hubo un error al enviar el mensaje. Intenta nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="relative bg-customBlue text-white py-12 sm:py-16 md:py-20 rounded-3xl z-10 -mt-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl text-center sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold mb-4">
              ¡Contáctanos!
            </h2>
            <p className="mb-6 lg:mb-0 mt-4 text-sm sm:text-base text-center">
              ¿Tienes alguna consulta o necesitas más información sobre nuestros cursos y servicios? Completa el formulario y nos pondremos en contacto contigo a la brevedad.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md text-gray-700 z-20 w-full">
            <h3 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-semibold mb-6 text-center text-gray-800">
              Formulario de Contacto
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 w-full lg:w-full" encType="multipart/form-data">
              <div className="flex flex-col lg:flex-row gap-6 2xl:gap-16">
                <div className="w-full lg:w-1/2 space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre y Apellido"
                    className="w-full p-2 rounded-3xl border-gray-200 text-sm bg-gray-100 outline-none pl-4"
                    required
                  />
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="DNI"
                    className="w-full p-2 rounded-3xl border-gray-200 text-sm bg-gray-100 outline-none pl-4"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Mail"
                    className="w-full p-2 rounded-3xl border-gray-200 text-sm bg-gray-100 outline-none pl-4"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Teléfono"
                    className="w-full p-2 rounded-3xl border-gray-200 text-sm bg-gray-100 outline-none pl-4"
                    required
                  />
                </div>

                <div className="w-full lg:w-1/2 aspect-[16/9] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <img
                    src={formData.image ? URL.createObjectURL(formData.image) : "/media/subir imagen.jpeg"}
                    alt="Imagen de carga"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-center lg:justify-center mt-6">
                <button
                  type="submit"
                  className="w-full sm:w-72 bg-customGreen text-white py-3 px-6 rounded-3xl transition-transform hover:scale-105"
                  disabled={isUploading}
                >
                  {isUploading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-4 text-center text-red-700">
                <p>{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
