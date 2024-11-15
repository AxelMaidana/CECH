  'use client'

  import React, { useState, useEffect } from 'react';
  import { Editor } from '@tinymce/tinymce-react';
  import { db, storage } from '../../firebase/client';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { v4 as uuidv4 } from 'uuid';

  interface EditorComponentProps {
    pageId: string;
    permissions: {
      [key: string]: boolean;
    };
    userId: boolean,
  }

  // Mapeo de pageId a permisos requeridos
  const PAGE_PERMISSIONS: { [key: string]: string } = {
    'trámites': 'editarPanelTramites',
    'institucional': 'editarPanelInfoInstitucional',
    'dictámenes': 'editarPanelDictamenes',
    'contacto' : 'editarPanelContacto',
    'becas': 'editarPanelBecas',
    'matriculados-activos': 'editarPanelMatriculados',
    // Agrega aquí más mapeos según necesites
  };

  export default function EditorComponent({ pageId, permissions, userId }: EditorComponentProps) {
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Función modificada para verificar permisos
    const hasPermission = () => {
      const requiredPermission = PAGE_PERMISSIONS[pageId];
      return permissions && permissions[requiredPermission] === true;
    };

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

    // Vista de solo lectura si no hay usuario logueado
    if (!userId) {
      return (
        <div className="w-full max-w-none lg:max-w-7xl mx-auto">
          <div 
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    }

    // Vista de edición si el usuario está logueado y tiene permiso
    if (!isEditing || !hasPermission()) {
      return (
        <div className="w-full max-w-none lg:max-w-5xl mx-auto">
          {hasPermission() && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Editar Contenido
              </button>
            </div>
          )}
          <div 
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    }

    const apiKey = '0rlylg7lwhml61g6ncx4rxhj7du8fblukvjr3ihjsxvsembn';
  
    return (
      <div className="w-full">
        <Editor
          apiKey={apiKey}
          init={{
            height: 'min(calc(100vh - 300px), 600px)',
            min_height: 400,
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
            content_style: `
              body { 
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                max-width: 100%;
                margin: 0 auto;
                padding: 1rem;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media (min-width: 640px) {
                body {
                  font-size: 18px;
                  padding: 1.5rem;
                }
              }
            `,
            mobile: {
              menubar: false,
              toolbar_mode: 'scrolling',
              height: 'calc(100vh - 250px)',
              min_height: 300
            },
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
        <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
  )}