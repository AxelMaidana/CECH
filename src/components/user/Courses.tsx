import { useState, useEffect } from 'react';
import { db } from '../../firebase/client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';

export function CoursesDropdown({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  // Función para escuchar los cambios del usuario en tiempo real
  const fetchUserData = () => {
    const userRef = doc(db, 'users', userId); // Referencia al documento del usuario

    // Establecer un listener en tiempo real
    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);

        // Actualizar los cursos inscritos
        if (userData?.courses) {
          setEnrolledCourses(userData.courses); // Cursos del usuario
        } else {
          setEnrolledCourses([]); // Si no hay cursos, establece un arreglo vacío
        }
      } else {
        console.warn(`El usuario no existe en la base de datos.`);
        setUserData(null);
        setEnrolledCourses([]);
      }
    });

    // Limpiar el listener cuando el componente se desmonte
    return unsubscribe;
  };

  useEffect(() => {
    if (userId) {
      // Llama a la función que establece el listener
      const unsubscribe = fetchUserData();

      // Limpiar el listener al desmontar el componente
      return () => unsubscribe();
    } else {
      console.warn('El ID del usuario no fue proporcionado.');
    }
  }, [userId]);

  // Función para abrir el certificado en una nueva pestaña
  const handleDownloadCertificate = (courseId) => {
    // Verificar si hay un archivo de certificado
    const permissionsCourse = userData?.permissionsCourse || {};
    const coursePermissions = permissionsCourse[courseId];
    const certificateUrl = coursePermissions?.certificadoCourse;

    if (certificateUrl) {
      // Si el certificado está disponible, abrir en nueva pestaña
      window.open(certificateUrl, '_blank');
    } else {
      alert('Certificado no disponible para este curso.');
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl shadow-md bg-gray-50 px-4 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-1 bg-gray-50 rounded-md text-gray-700 font-bold"
      >
        <span className="font-bold text-xl">Mis Cursos</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="mt-4">
          <ul className="flex flex-col space-y-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => {
                // Obtener la clave correspondiente al curso dentro de permissionsCourse
                const permissionsCourse = userData?.permissionsCourse || {};
                const coursePermissions = permissionsCourse[course.courseId]; // Verificamos si hay permisos para este curso
                const hasPermission = coursePermissions?.verCertificado;

                return (
                  <li
                    key={course.courseId}
                    className="flex flex-col sm:flex-row justify-between items-center text-customBlack bg-customBlack bg-opacity-5 p-2 rounded-full px-6"
                  >
                    <span className="text-gray-800 font-semibold">{course.courseTitle}</span>
                    
                    {/* Mostrar botón de certificado solo si 'verCertificado' es true */}
                    {hasPermission ? (
                      <button
                        className="text-[#187498] underline text-sm font-semibold"
                        onClick={() => handleDownloadCertificate(course.courseId)}
                      >
                        Descargar Certificado
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {hasPermission === false ? 'Sin permiso para certificado' : 'Certificado no disponible'}
                      </span>
                    )}
                    <button
                      className="bg-[#187498] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f5f75] transition duration-200 mt-2 sm:mt-0"
                      onClick={() => (window.location.href = `/cursos/post/${course.courseId}`)}
                    >
                      Ir al curso
                    </button>

                  </li>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No estás inscrito en ningún curso.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CoursesDropdown;
