import { useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref, getStorage } from 'firebase/storage'
import { db } from '../../firebase/client'
import CreateCourseModal from '../common/CreateCourseModal'
import { Pencil, Trash2 } from 'lucide-react'
import ContentHeader from '../common/CondicionPorRol' // Importa el componente CondicionPorRol

interface NewsArticledivProps {
  id: string
  title: string
  description: string
  imageUrl: string
  price: string
  day: string
  modality: string
  hours: string
}

export default function NewsArticlediv({
  id,
  title,
  description,
  imageUrl,
  price,
  day,
  modality,
  hours,
}: NewsArticledivProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false) // Nuevo estado para el modal de eliminación

  const handleEdit = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true) // Abrir el modal de confirmación
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false) // Cerrar el modal de confirmación
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const CourseDoc = doc(db, 'posts', id)
      await deleteDoc(CourseDoc)

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
      setIsDeleteModalOpen(false) // Cerrar el modal después de eliminar
    }
  }

  return (
    <div className="group">
      <div className="card bg-gray-100 rounded-3xl shadow-lg shadow-black/40 overflow-hidden transition-transform duration-300 group hover:scale-105 flex flex-col h-full">
        {/* Imagen con gradiente aplicado */}
        <div className="relative w-full h-40 flex-shrink-0">
          {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>

          <div className="absolute top-2 right-2 space-x-1 flex">
            <ContentHeader>
              {/* Botón de editar */}
              <button
                className="text-white edit-btn bg-customBlue p-2 rounded-full shadow-sm shadow-black/30 hover:scale-105 transition-all ease-in-out duration-200"
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3" />
              </button>

              {/* Botón de eliminar */}
              <button
                className="text-white delete-btn bg-customBlue p-2 rounded-full shadow-sm shadow-black/30 hover:scale-105 transition-all ease-in-out duration-200"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </ContentHeader>
          </div>
        </div>

        {/* Contenedor de información */}
        <div className="bg-white p-6 flex flex-col flex-grow">
          <h2 className="text-3xl font-bold text-customBlue mb-2 h-fit min-h-[72px] line-clamp-2">
            {title}
          </h2>
          <div className="line-clamp-3 mb-4">
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: description }}></p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-200 text-gray-900 px-3 py-1 border-2 border-customBlue rounded-full text-xs font-bold">
              Horarios: <span className="font-medium text-gray-600">{hours}</span>
            </span>
            <span className="bg-gray-200 text-gray-900 px-3 py-1 border-2 border-customBlue rounded-full text-xs font-bold">
              Modalidad: <span className="font-medium text-gray-600">{modality}</span>
            </span>
            <span className="bg-gray-200 text-gray-900 px-3 py-1 border-2 border-customBlue rounded-full text-xs font-bold">
              Día: <span className="font-medium text-gray-600">{day}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-400">${price}</span>
            <a href={`/cursos/post/${id}`} className="underline text-sm font-semibold">
              Leer más
            </a>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateCourseModal
          onClose={closeModal}
          editData={{ id, title, description, imageUrl, price, day, modality, hours }}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Estás seguro de eliminar este curso?</h3>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-text-customBlack font-semibold bg-gray-300 rounded-full hover:scale-105 transition-all duration-200 ease-in-out"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 text-white font-semibold bg-[#187498] rounded-full hover:scale-105 transition-all duration-200 ease-in-out"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
