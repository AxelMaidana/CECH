import { useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref, getStorage } from 'firebase/storage'
import { db } from '../../firebase/client'
import CreateNoticiaModal from '../common/CreateNoticiaModal'
import { Pencil, Trash2 } from 'lucide-react'
import ContentHeader from '../common/CondicionPorRol' // Importa el componente CondicionPorRol

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
            <ContentHeader>
              <button
                className="rounded-full bg-[#187498] p-2 shadow-sm shadow-black/40"
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3 text-white" />
              </button>
              <button
                className="rounded-full bg-[#187498] p-2 shadow-sm shadow-black/40"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
            </ContentHeader>
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
