
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/client';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface CreateCourseModalProps {
  onClose: () => void;
  editData?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: string;
    day: string;
    modality: string;
    hours: string;
  };
}

export default function CreateCourseModal({ onClose, editData }: CreateCourseModalProps) {
  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(editData?.imageUrl || '');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<string>(editData?.price || '');
  const [day, setDay] = useState<string>(editData?.day || '');
  const [modality, setModality] = useState<string>(editData?.modality || '');
  const [hours, setHours] = useState<string>(editData?.hours || '');

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || '');
      setDescription(editData.description || '');
      setPreviewUrl(editData.imageUrl || '');
      setPrice(editData.price || '');
      setDay(editData.day || '');           
      setModality(editData.modality || ''); 
      setHours(editData.hours || '');       
    }
  }, [editData]);
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = editData?.imageUrl || '';

      // Manejo de la subida de imágenes
      if (imageFile) {
        const storage = getStorage();

        if (editData?.imageUrl) {
          try {
            const oldImageRef = ref(storage, editData.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error al eliminar la imagen antigua:', error);
          }
        }

        const imageRef = ref(storage, `courses/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const courseData = {
        title,
        description,
        imageUrl,
        price,
        day,          
        modality,     
        hours,        
      };
      

      if (editData) {
        const courseRef = doc(db, 'posts', editData.id);
        await updateDoc(courseRef, courseData);
      } else {
        await addDoc(collection(db, 'posts'), courseData);
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar el curso:', error);
      alert('Error al guardar el curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-100 rounded-3xl shadow-custom shadow-black/40 overflow-hidden flex flex-col max-w-[410px] w-full">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Imagen para subir */}
        <div
          onClick={() => document.getElementById('imageInput')?.click()}
          className="relative w-full h-40 flex-shrink-0 cursor-pointer"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500">Click para subir imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
  
        <div className="bg-white p-6 flex flex-col">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-0 bg-transparent text-3xl mb-1 font-bold text-customBlue overflow-hidden"
            placeholder="Título"
            required
            rows={1}
            style={{ resize: 'none', minHeight: '80px' }} 
          />
          
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              e.target.style.height = 'auto'; 
              e.target.style.height = `${e.target.scrollHeight}px`; 
            }}
            className="w-full p-0 bg-transparent resize-none text-gray-700 line-clamp-2 overflow-hidden mb-4"
            rows={1}
            placeholder="Descripción"
            required
            style={{ resize: 'none', minHeight: '50px' }} 
          />
  
          <div className="flex flex-wrap gap-2 mb-4"> 
          <input
              type="text"
              value={hours}
              placeholder='Horario'
              onChange={(e) => setHours(e.target.value)}
              className="flex-shrink-0 text-sm bg-slate-100 h-8 p-2 rounded-full border" // Mantengo el tamaño
              required
            />
            <input
              type="text"
              value={modality}
              placeholder='Modalidad'
              onChange={(e) => setModality(e.target.value)}
              className="flex-shrink-0 text-sm bg-slate-100 h-8 p-2 rounded-full border" // Mantengo el tamaño
              required
            />
            <input
              type="text"
              value={day}
              placeholder='Día'
              onChange={(e) => setDay(e.target.value)}
              className="flex-shrink-0 text-sm bg-slate-100 h-8 p-2 rounded-full border" // Mantengo el tamaño
              required
            />
          </div>
  
          <input
            type="text"
            value={price}
            placeholder='Precio'
            onChange={(e) => setPrice(e.target.value)}
            className="w-fit text-sm h-8 p-2 rounded-full border-none mb-4"
            required
          />
  
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-transparent border rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
            >
              {loading ? 'Guardando...' : (editData ? 'Guardar Cambios' : 'Crear Curso')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>  
  );
}
