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
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false) // Estado para el modal de confirmación de eliminación
  const { permissions, loading, userId } = usePermissions()

  const handleEdit = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openDeleteModal = () => {
    setIsConfirmDeleteModalOpen(true) // Abrir el modal de confirmación
  }

  const closeDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false) // Cerrar el modal de confirmación
    window.location.reload() // Recargar la página
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const noticiaDoc = doc(db, 'noticias', id)
      await deleteDoc(noticiaDoc)

      if (imageUrl) {
        const storage = getStorage()
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
      }
      closeDeleteModal() // Cerrar modal de confirmación al eliminar
      //reload
  
    } catch (error) {
      console.error('Error al eliminar el artículo:', error)
      alert('Error al eliminar el artículo.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return <div className='text-gray-400'>Cargando...</div>
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
                onClick={openDeleteModal} // Abre el modal de confirmación
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

      {/* Modal de confirmación de eliminación */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">¿Estás seguro?</h3>
            <p className="mb-4">Esta acción no se puede deshacer. ¿Deseas eliminar esta noticia?</p>
            <div className="flex justify-between">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
