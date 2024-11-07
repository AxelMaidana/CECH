import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/client';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface CreateNoticiaModalProps {
  onClose: () => void;
  editData?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    date: string;
  };
}

export default function CreateNoticiaModal({ onClose, editData }: CreateNoticiaModalProps) {
  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(editData?.imageUrl || '');
  const [date, setDate] = useState(editData?.date || '');
  const [loading, setLoading] = useState(true); // Inicializa en true para mostrar el "Cargando..." al abrir el modal
  const [saving, setSaving] = useState(false); // Para el estado de guardado

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || '');
      setDescription(editData.description || '');
      setPreviewUrl(editData.imageUrl || '');
      const formattedDate = editData.date ? new Date(editData.date).toISOString().split('T')[0] : '';
      setDate(formattedDate);
    }
    setLoading(false); // Oculta el mensaje de "Cargando..." cuando los datos están listos
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
    setSaving(true);

    try {
      let imageUrl = editData?.imageUrl || '';

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

        const imageRef = ref(storage, `noticias/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const noticiaData = {
        title,
        description,
        imageUrl,
        date,
      };

      if (editData) {
        const noticiaRef = doc(db, 'noticias', editData.id);
        await updateDoc(noticiaRef, noticiaData);
      } else {
        await addDoc(collection(db, 'noticias'), noticiaData);
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar la noticia:', error);
      alert('Error al guardar la noticia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4 z-50">
      <div className="bg-white text-white rounded-2xl shadow-lg w-full max-w-[460px] h-fit overflow-visible animate-fadeIn">
        {/* Contenedor flotante para el campo de fecha */}
        <div className="relative z-50 text-white">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 px-4 py-1 text-md font-semibold bg-customBlue text-white border-none rounded-full z-10"
          />
        </div>

        {/* Imagen */}
        <div
          onClick={() => document.getElementById('imageInput')?.click()}
          className="relative h-40 overflow-hidden cursor-pointer rounded-t-2xl border-2 border-customBlue"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-2xl">
              <span className="text-gray-500">Haz clic para subir imagen</span>
            </div>
          )}
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Título */}
        <div className="p-4 bg-customBlue rounded-b-2xl py-12">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-center items-center justify-center border p-2 rounded-2xl border-gray-200 outline-none bg-transparent text-xl font-bold text-white"
            placeholder="Título del evento"
            required
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2 mt-4 p-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-200 border rounded-lg bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300"
        >
          {saving ? 'Guardando...' : (editData ? 'Guardar Cambios' : 'Agregar Noticia')}
        </button>
      </div>
    </form>
  );
}
