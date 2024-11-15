import { useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref, getStorage } from 'firebase/storage'
import { db } from '../../firebase/client'
import CreateNoticiaModal from '../common/CreateNoticiaModal'
import { Pencil, Trash2 } from 'lucide-react'
import { usePermissions } from '../auth/PermissionsProvider'

interface NewsArticledivProps {
  id: string
  title: string
  description: string
  imageUrl: string
  date: string
}

export default function NewsArticlediv({ id, title, description, imageUrl, date }: NewsArticledivProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { permissions, loading, userId } = usePermissions()

  const handleEdit = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
      setIsDeleting(true)
      try {
        const noticiaDoc = doc(db, 'noticias', id)
        await deleteDoc(noticiaDoc)

        if (imageUrl) {
          const storage = getStorage()
          const imageRef = ref(storage, imageUrl)
          await deleteObject(imageRef)
        }
      } catch (error) {
        console.error('Error al eliminar el artículo:', error)
        alert('Error al eliminar el artículo.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (loading) {
    return <div className='text-gray-400'>Cargando permisos...</div>
  }

  if (!userId){
    
    return <div>
    <div className="card relative rounded-3xl shadow-lg shadow-black/40 overflow-hidden transition-transform duration-300 group hover:scale-105 flex flex-col h-full">
      <h2 className="absolute top-40 text-3xl font-bold text-customBlack text-center z-10">
        Inicia sesión para ver esta noticia o contacta con el administrador
      </h2>
  
      <div className="relative w-full h-full opacity-30 bg-gray-100 rounded-3xl flex flex-col">
        <div className="relative w-full h-40 flex-shrink-0">
          {imageUrl && (
            <img
              src="https://img.freepik.com/fotos-premium/signo-interrogacion-negro-sobre-fondo-negro-estudio_241146-2516.jpg"
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        </div>
  
        <div className="bg-white p-6 flex flex-col flex-grow">
          <h2 className="bg-gray-200 w-full py-3 mb-1 border-2 rounded-full animate-pulse"></h2>
          <h2 className="bg-gray-200 w-32 py-3 mb-4 border-2 rounded-full animate-pulse"></h2>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-200 w-full py-1 border-2 rounded-full animate-pulse"></span>
            <span className="bg-gray-200 w-full py-1 border-2 rounded-full animate-pulse"></span>
            <span className="bg-gray-200 w-full py-1 border-2 rounded-full animate-pulse"></span>
            <span className="bg-gray-200 w-48 py-1 border-2 rounded-full animate-pulse"></span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-200 w-32 py-3 border-2 rounded-full animate-pulse"></span>
            <span className="bg-gray-200 w-32 py-3 border-2 rounded-full animate-pulse"></span>
            <span className="bg-gray-200 w-32 py-3 border-2 rounded-full animate-pulse"></span>
          </div>
          <div className="flex justify-between items-center">
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  }

  if (!permissions.verNoticias) {
    return <div>No tienes permisos para ver este contenido.</div>
  }


  return (
    <div className="group">
      <div className={`bg-[#187498] rounded-2xl ${isModalOpen ? '' : 'hover:scale-105 transition-all duration-200 ease-in-out'}`}>
        <div className="relative p-0">
          <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 px-4 py-1 text-md font-semibold bg-[#187498] text-white rounded-full z-10">
            {date}
          </div>
          <div className="h-40 overflow-hidden rounded-t-2xl border-2 border-[#187498]">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-2xl">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 space-x-1 flex">
            {permissions.editarNoticias && (
              <button
                className="rounded-full bg-[#187498] p-2 shadow-sm shadow-black/40"
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3 text-white" />
              </button>
            )}
            {permissions.eliminarNoticia && (
              <button
                className="rounded-full bg-[#187498] p-2 shadow-sm shadow-black/40"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
            )}
          </div>
        </div>
        <div className="p-4 bg-primary rounded-b-2xl flex flex-col flex-grow h-24">
          <h2 className="text-xl font-bold text-white text-center mb-2 line-clamp-2 h-fit">{title}</h2>
        </div>
        <div className="flex p-4 justify-end self-end items-center">
          <a href={`/noticias/noticia/${id}`} className="underline text-sm font-semibold text-white ml-auto">
            Leer más
          </a>
        </div>
        {isModalOpen && (
          <CreateNoticiaModal
            onClose={closeModal}
            editData={{ id, title, description, imageUrl, date }}
          />
        )}
      </div>
    </div>
  )
}
