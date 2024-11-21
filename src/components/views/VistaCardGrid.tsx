import { useState, useEffect } from 'react';
import { PermissionsProvider } from '../auth/PermissionsProvider';
import { db } from '../../firebase/client';
import { collection, query, getDocs, orderBy, startAfter, limit } from 'firebase/firestore';
import Card from '../common/Card';
import VistaCrearCurso from './VistaBotonCrearCurso'; 

const Vista = () => {
  const [posts, setPosts] = useState([]); // Posts a mostrar por página
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastDocs, setLastDocs] = useState({});  // Guardamos el último documento de cada página

  const resultsPerPage = 10; // Limite de publicaciones por página

  // Normalizar texto (quitar tildes y convertir a minúsculas)
  const normalizeText = (text) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Obtener el total de publicaciones para calcular las páginas
  const fetchTotalPosts = async () => {
    const postsCollection = collection(db, 'posts');
    const querySnapshot = await getDocs(postsCollection);
    setTotalPosts(querySnapshot.size);
    setTotalPages(Math.ceil(querySnapshot.size / resultsPerPage));
  };

  // Obtener publicaciones por página con búsqueda
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    const postsCollection = collection(db, 'posts');
    
    let q = query(postsCollection, orderBy('title'), limit(resultsPerPage));

    // Si no es la primera página, usamos el último documento de la página anterior
    if (page > 1 && lastDocs[page - 1]) {
      q = query(postsCollection, orderBy('title'), startAfter(lastDocs[page - 1]), limit(resultsPerPage));
    }

    // Traer las publicaciones sin filtro de búsqueda
    const querySnapshot = await getDocs(q);
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Guardamos el último documento para la paginación
    setLastDocs((prev) => ({
      ...prev,
      [page]: querySnapshot.docs[querySnapshot.docs.length - 1],  // Último documento de la página
    }));

    setPosts(fetchedPosts);
    setCurrentPage(page);
    setLoading(false);
  };

  useEffect(() => {
    fetchTotalPosts();
    fetchPosts(); // Cargar los posts iniciales (primera página)
  }, []);

  // Filtrar las publicaciones por búsqueda solo en el cliente (después de traer los datos)
  const filteredPosts = posts.filter((post) => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    return (
      normalizeText(post.title).includes(normalizedSearchTerm) ||
      normalizeText(post.description).includes(normalizedSearchTerm)
    );
  });

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      fetchPosts(page);
    }
  };

  return (
    <PermissionsProvider>
    <div>
          

      <div className="my-10">
        <div className='flex justify-between items-center'>
          <div className="relative flex-shrink-0">
            <h3 className="md:text-2xl font-bold bg-customGreen text-white md:px-8 md:py-2.5 px-3 py-1 rounded-r-full text-center">
              Cursos disponibles
            </h3>
          </div>

        {/* Campo de búsqueda */}
            <div className='flex gap-2 items-center'>
              <VistaCrearCurso />
              <div className="relative flex w-fit items-center ml-1 md:ml-4 md:mr-5 border-2 border-customGreen rounded-3xl">
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  className="md:h-10 h-7 md:w-72 w-36 md:px-5 px-3 md:pr-10 text-sm bg-gray-100 rounded-3xl focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center md:pr-3 pr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                </div>
              </div>
            </div>
        </div>

        {/*seccion de informacion*/}
        <div className={`flex pt-12 mb-6 justify-center items-center w-full tracking-tight z-auto`}>
          <section className={`relative bg-customBlue text-white pl-4 md:px-32 py-4 -mt-5 w-full shadow-custom shadow-black/40`}>
            <h3 className="font-bold text-start md:text-start md:mb-2 text-2xl md:text-3xl">Acceso gratuito a los cursos</h3>
            <p className="mb-2 mt-2 text-left max-w-full">
            La inscripción y el acceso a los cursos son <strong>completamente gratuitos</strong>. Sin embargo, si deseas obtener un <strong>certificado</strong> al finalizar, este <strong>tiene un costo adicional.</strong>
            </p>
            </section>
        </div>

        {/* Grilla de publicaciones */}
        <div className="relative p-4">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-gray-100 opacity-50 z-10">
              <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 lg:gap-x-8 xl:grid-cols-4 2xl:grid-cols-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  title={post.title}
                  description={post.description}
                  imageUrl={post.imageUrl}
                  price={post.price}
                  day={post.day}
                  modality={post.modality}
                  hours={post.hours}
                  id={post.id}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No se encontraron publicaciones.
              </p>
            )}
          </div>
        </div>
      
        {/* Botones de paginación */}
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            className={`px-4 py-2 bg-customBlue rounded-full ${
              currentPage === 1 ? 'cursor-not-allowed opacity-50 text-white' : 'text-white hover:bg-cyan-800'
            }`}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </button>
          <div className='flex gap-2 px-6'>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
              key={page}
              className={`flex h-4 w-4 p-4 justify-center items-center rounded-full ${
                currentPage === page
                  ? 'bg-customBlue text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          </div>
          <button
            className={`px-4 py-2 ml-6 bg-customBlue rounded-full ${
              currentPage === totalPages ? 'cursor-not-allowed opacity-50 text-white' : 'hover:bg-cyan-800 text-white'
            }`}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
    </PermissionsProvider>

  );
};

export default Vista;
