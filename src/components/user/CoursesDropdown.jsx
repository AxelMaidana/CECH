import { useState, useEffect } from 'react';
import { db } from '../../firebase/client';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc, arrayRemove } from 'firebase/firestore';
import { OnOffButton } from '../user/OnOffButton'; // Asegúrate de importar el componente

export function CoursesDropdown({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState('');
  const [isCertificateAvailable, setIsCertificateAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCourseAdded, setIsCourseAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const fetchPosts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const postsList = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
      }));
      setPosts(postsList);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (userData?.courses) {
        setEnrolledCourses(userData.courses);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const enrollInCourse = async () => {
    if (selectedPost) {
      try {
        const course = posts.find(post => post.id === selectedPost);
        if (!course) {
          console.log("Curso no encontrado");
          return;
        }
  
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        if (userData?.courses?.some(c => c.courseId === selectedPost)) {
          alert('Ya estás inscrito en este curso');
          return;
        }
  
        await updateDoc(userRef, {
          courses: arrayUnion({
            courseId: selectedPost,
            courseTitle: course.title
          })
        });
  
        setEnrolledCourses(prevCourses => [
          ...prevCourses, 
          { courseId: selectedPost, courseTitle: course.title }
        ]);
  
        setIsModalOpen(true); // Mostrar el modal
        setIsCourseAdded(false); // Mostrar el botón "Agregar Curso"
        setSelectedPost(''); // Limpiar la selección
      } catch (error) {
        alert(`Error al inscribir en el curso`);
      }
    } else {
      console.log("No se ha seleccionado un curso.");
    }
  };  

  const removeCourse = async (course) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        courses: arrayRemove(course)
      });

      setEnrolledCourses(prevCourses => prevCourses.filter(item => item !== course));
    } catch (error) {
      console.error('Error removing course:', error);
    }
  };

  const toggleCertificatePermission = () => {
    setIsCertificateAvailable(!isCertificateAvailable);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchPosts();
    fetchEnrolledCourses();
  }, []);

  return (
    <div className="border border-gray-300 rounded-xl shadow-md bg-gray-50 px-4 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-1 bg-gray-50 rounded-md text-gray-700 font-bold"
      >
        <span className="font-bold text-xl">Cursos</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-4">
            ¡Recuerda solicitar tus certificados en su respectivo curso para que estén aquí!
          </p>

          {enrolledCourses.length > 0 && (
            <div className="mb-4">
              <div className='flex items-center justify-between'>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Inscripto a</h3>
              </div>
              <ul className="flex flex-col space-y-2">
                {enrolledCourses.map(course => (
                  <li key={course} className="flex flex-col md:flex-row justify-between items-center text-customBlack bg-customBlack bg-opacity-5 p-2 rounded-full ">
                    <span className=' text-customBlack text-xs font-bold md:text-base'>{course.courseTitle}</span>
                    <div className="flex flex-grid items-center mt-2 gap-2 md:gap-x-20 lg:gap-x-72 xl:gap-x-96 md:justify-between md:mt-0">
                      <OnOffButton userId={userId} courseId={course.courseId} />
                      <div className='flex items-center'>
                        <button
                          onClick={() => removeCourse(course)}
                          className="bg-white/90 text-customBlack shadow-md px-4 py-1 rounded-full text-xs font-semibold md:ml-2  md:mt-0"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isCourseAdded && (
            <button
              onClick={() => setIsCourseAdded(true)}
              className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out text-white px-4 py-2 rounded-xl text-md font-semibold"
            >
              Agregar Curso
            </button>
          )}

          {isCourseAdded && (
            <div className="relative mt-8 flex flex-col md:flex-row md:justify-between items-center space-y-4">
              <button
                onClick={() => setIsCourseAdded(false)}
                className="bg-gray-100 shadow-md h-6 w-6 rounded-full text-customBlack absolute -top-4 right-0 text-sm font-semibold"
              >
                x
              </button>

              {posts.length > 0 ? (
                <select
                  value={selectedPost}
                  onChange={(e) => setSelectedPost(e.target.value)}
                  className="md:px-3 md:py-2 md:w-fit w-auto px-1 py-1 text-xs md:text-base bg-white text-gray-700 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                >
                  <option value="" className="text-gray-400">Selecciona un curso</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-center text-gray-500">No hay posts disponibles.</p>
              )}

              <button
                onClick={enrollInCourse}
                className={`bg-[#187498] w-fit hover:scale-105 transition duration-300 ease-in-out text-white px-4 py-2 rounded-xl text-md font-semibold mt-2 ${
                  enrolledCourses.some(course => course.courseId === selectedPost)
                    ? 'opacity-50 cursor-not-allowed' // Hacer el botón opaco y no clickeable si ya está inscrito, y cambiar el texto
                    : ''
                }`}
                disabled={enrolledCourses.some(course => course.courseId === selectedPost)} // Deshabilitar el botón
              >
                Inscribirse
              </button>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-3xl font-semibold ">¡Curso Agregado con Éxito!</p>
            <p className="text-gray-600 mt-4">Haga clic en el botón para cerrar.</p>
            <button onClick={closeModal} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesDropdown;
