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
          className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customBlue rounded-full px-4 py-1"
        >
          {/* SVG de cruz para pantallas pequeñas */}
         

          {/* Texto para pantallas medianas y grandes */}
          <span className="text-white font-bold">Agregar curso</span>
        </button>

        {isModalOpen && <CreateCourseModal onClose={handleClose} editData={editData} />}
      </div>
    )
  );
}
