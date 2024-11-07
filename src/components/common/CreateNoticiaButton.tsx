import React, { useState, useEffect } from 'react';
import CreateNoticiaModal from './CreateNoticiaModal';

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

  return (
    <>
  <div className="transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center w-full h-full">
        <button
  onClick={() => setIsModalOpen(true)}
  className="bg-customBlue border-[3px] border-customBlue rounded-full text-white font-bold h-10 w-10 ml-2 -mr-2 flex items-center justify-center sm:h-8 sm:w-32 md:h-9 md:w-36 lg:h-9 lg:w-40"
>
    {/* SVG de cruz para pantallas pequeñas */}
    <span className="block sm:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12h12M12 6v12" />
      </svg>
    </span>
    
    {/* Texto para pantallas medianas y grandes */}
    <span className="hidden sm:block">Agregar Noticia</span>
</button>
  </div>

      
      {isModalOpen && <CreateNoticiaModal onClose={handleClose} editData={editData} />}    
    </>
  );
}
