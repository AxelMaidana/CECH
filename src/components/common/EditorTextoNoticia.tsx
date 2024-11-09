'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { db, storage } from '../../firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface EditorComponentProps {
  noticiaId: string;
  onDescriptionChange: (newDescription: string) => void;  // Agregar esta propiedad
}

export default function EditorComponent({ noticiaId, onDescriptionChange }: EditorComponentProps) {
  const [description, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadContent();
  }, [noticiaId]);

  const loadContent = async () => {
    try {
      const docRef = doc(db, 'noticias', noticiaId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Datos cargados:", data);
        const currentDescription = data.description || '';
        setContent(currentDescription);
        onDescriptionChange(currentDescription); // Llamar a onDescriptionChange al cargar
      } else {
        console.error("No existe el documento con ID:", noticiaId);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'noticias', noticiaId), {
        description,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log("Descripción guardada:", description);
      setIsEditing(false);
      onDescriptionChange(description);  // Actualizar la descripción en el componente padre
      loadContent();
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  const handleImageUpload = async (blobInfo: any, progress: (percent: number) => void) => {
    return new Promise<string>(async (resolve, reject) => {
      const file = blobInfo.blob();
      const fileName = `${uuidv4()}_${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        progress(100);
        const downloadURL = await getDownloadURL(snapshot.ref);
        resolve(downloadURL);
      } catch (error) {
        reject('Image upload failed');
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="min-h-screen">
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Content
        </button>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    );
  }

  const apiKey = import.meta.env.PUBLIC_TINYMCE_API_KEY || '0rlylg7lwhml61g6ncx4rxhj7du8fblukvjr3ihjsxvsembn';

  return (
    <div className="min-h-screen justify-center items-center w-full">
      <Editor
        apiKey={apiKey}
        init={{
          height: 500,
          width: '100%',
          menubar: true,
          language: 'es',
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image | help',
          images_upload_handler: handleImageUpload,
          automatic_uploads: true,
          file_picker_types: 'image',
          file_picker_callback: (cb, value, meta) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
  
            input.onchange = function () {
              const file = (input.files as FileList)[0];
              const reader = new FileReader();
              reader.onload = function () {
                const id = 'blobid' + (new Date()).getTime();
                const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache;
                const base64 = (reader.result as string).split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                cb(blobInfo.blobUri(), { title: file.name });
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }
        }}
        value={description}
        onEditorChange={(newContent) => setContent(newContent)}
      />
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
