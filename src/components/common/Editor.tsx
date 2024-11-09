'use client'

import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { db, storage } from '../../firebase/client';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface EditorComponentProps {
  pageId: string;
}

export default function EditorComponent({ pageId }: EditorComponentProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadContent();
  }, [pageId]);

  const loadContent = async () => {
    try {
      const docRef = doc(db, 'pages', pageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data().content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'pages', pageId), {
        content,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
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
      <div className="min-h-screen ">
        <button
          onClick={() => setIsEditing(true)}
          className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Content
        </button>
        <div 
          className="prose max-w-2xl lg:ml-10 mx-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  const apiKey = import.meta.env.PUBLIC_TINYMCE_API_KEY || '0rlylg7lwhml61g6ncx4rxhj7du8fblukvjr3ihjsxvsembn';
 
  return (
    <div className="min-h-screen justify-center items-center w-full"> {/* Cambia w-full o ajusta según el ancho deseado */}
      <Editor
        apiKey={apiKey}
        init={{
          height: 500,
          width: '100%', // Para que ocupe el 100% del ancho del contenedor
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
        value={content}
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