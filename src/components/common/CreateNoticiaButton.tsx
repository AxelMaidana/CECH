import React, { useState, useEffect } from 'react';
import CreateNoticiaModal from './CreateNoticiaModal';
import { usePermissions } from '../auth/PermissionsProvider';

export default function CreatenNoticiaButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<{
    id: string;
    title: string;
    price: string;
    description: string;
    imageUrl: string;
    date: string;
  } | undefined>(undefined);

  useEffect(() => {
    const handleEditNoticia = (event: CustomEvent) => {
      setEditData(event.detail);
      setIsModalOpen(true);
    };

    document.addEventListener('editNoticia', handleEditNoticia as EventListener);

    return () => {
      document.removeEventListener('editNoticia', handleEditNoticia as EventListener);
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
    permissions.agregarNoticia && (
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#187498] hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customBlue rounded-full px-4 py-1"
        >
          {/* Texto para pantallas medianas y grandes */}
          <span className="text-white font-bold text-sm">Agregar Noticia</span>
        </button>
    
        {isModalOpen && <CreateNoticiaModal onClose={handleClose} editData={editData} />}
      </div>
    )
  );
}

