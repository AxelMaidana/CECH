import React, { useState, useEffect } from 'react';
import CreateCourseModal from './CreateCourseModal';
import { usePermissions } from '../../components/auth/PermissionsProvider'; // Importamos el hook de permisos

export default function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<{
    id: string;
    title: string;
    price: string;
    day: string;
    modality: string;
    hours: string;
    description: string;
    imageUrl: string;
  } | undefined>(undefined);

  useEffect(() => {
    const handleEditCourse = (event: CustomEvent) => {
      setEditData(event.detail);
      setIsModalOpen(true);
    };

    document.addEventListener('editCourse', handleEditCourse as EventListener);

    return () => {
      document.removeEventListener('editCourse', handleEditCourse as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    setEditData(undefined);
  };

  const { permissions, loading, userId } = usePermissions();

  if (loading) {
    return <div className='text-gray-400'>Cargando permisos...</div>;
  }

  return (
    permissions.agregarCurso && (
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customBlue rounded-full text-white font-bold h-10 w-10 ml-2 -mr-2 flex items-center justify-center sm:h-8 sm:w-32 md:h-9 md:w-36 lg:h-9 lg:w-40"
        >
          {/* SVG de cruz para pantallas pequeñas */}
          <span className="block sm:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h12M12 6v12" />
            </svg>
          </span>

          {/* Texto para pantallas medianas y grandes */}
          <span className="hidden sm:block">Agregar curso</span>
        </button>

        {isModalOpen && <CreateCourseModal onClose={handleClose} editData={editData} />}
      </div>
    )
  );
}
