import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/client';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import EditorTextComponent from '../../components/common/EditorTextoNoticia';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Props {
  noticiaId: string;
}

interface noticiaData {
  title: string;
  date: string;
  imageUrl: string;
  description: string;
}

export default function noticiaEditor({ noticiaId }: Props) {
  const [noticiaData, setNoticiaData] = useState<noticiaData>({
    title: '',
    date: '',
    imageUrl: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadNoticiaData();
  }, [noticiaId]);

  async function loadNoticiaData() {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'noticias', noticiaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNoticiaData({
          imageUrl: data.imageUrl || '',
          title: data.title || '',
          date: data.date || '',
          description: data.description || ''
        });
      } else {
        setError('No se encontró la noticia especificada');
      }
    } catch (error) {
      console.error('Error loading noticia data:', error);
      setError('Error al cargar los datos de la noticia');
    } finally {
      setLoading(false);
    }
  }

  // Nueva función para manejar cambios en la descripción
  function handleDescriptionChange(newDescription: string) {
    setNoticiaData((prevData) => ({ ...prevData, description: newDescription }));
  }

  async function handleSave() {
    try {
      // Usa los valores actuales de imagen y descripción
      let currentImageUrl = noticiaData.imageUrl;
      let currentDescription = noticiaData.description;

      if (imageFile) {
        const storageRef = ref(storage, `noticias/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        currentImageUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, 'noticias', noticiaId);
      await updateDoc(docRef, {
        ...noticiaData,
        description: currentDescription,
        imageUrl: currentImageUrl,
      });

      alert('Noticia actualizada exitosamente');
      window.history.back();

    } catch (error) {
      console.error('Error al guardar la noticia:', error);
      alert('Error al guardar la noticia');
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNoticiaData({ ...noticiaData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="text-center py-8">Cargando datos de la noticia...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="w-full my-auto">
      <div className="flex items-center justify-start py-8">
        <h3 className="text-lg md:text-2xl font-bold bg-customGreen text-white px-4 py-2 rounded-r-full text-center">
          Editar Noticia
        </h3>
      </div>

      <div className="bg-white rounded-lg max-w-7xl mx-auto px-2 mb-20">
        <div className="relative mb-4 cursor-pointer">
          <input type="date" name="fecha" value={noticiaData.date} onChange={(e) => setNoticiaData({ ...noticiaData, date: e.target.value })} className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 px-4 py-2 text-md font-semibold bg-[#187498] text-white rounded-full outline-none z-10" />
          <img 
            src={noticiaData.imageUrl}
            alt={noticiaData.title}
            className="w-full h-[400px] object-cover cursor-pointer rounded-t-3xl"
            onClick={() => document.getElementById('imageInput')?.click()}
          />
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-t-3xl"
            onClick={() => document.getElementById('imageInput')?.click()}
          >
            <img src="/media/SubirImagen.png" alt="Subir imagen" className="w-36 h-36 text-white" />
          </div>
          <input 
            type="file"
            id="imageInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="mb-4">
          <textarea
            value={noticiaData.title}
            onChange={(e) => setNoticiaData({ ...noticiaData, title: e.target.value })}
            className="w-full text-5xl text-customBlue font-bold border rounded-lg p-2 outline-none"
            placeholder="Título de la Noticia"
          />
        </div>

        <div className="mb-4">
          {/* Editor de texto con función de cambio de descripción */}
          <EditorTextComponent noticiaId={noticiaId} onDescriptionChange={handleDescriptionChange} />
        </div>

        <div className="flex gap-4 justify-end mb-auto">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-customBlue text-white font-bold border border-gray-300 rounded-3xl hover:bg-sky-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-customCyan text-black font-bold px-6 py-2 rounded-3xl hover:bg-sky-300"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
