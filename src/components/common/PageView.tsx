'use client';

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
        setContent(docSnap.data().content || '<p>Contenido no disponible</p>');
      } else {
        console.warn('Documento no encontrado en Firestore.');
        setContent('<p>Contenido no disponible</p>');
      }
    } catch (error) {
      console.error('Error cargando el contenido:', error);
      setContent('<p>Error al cargar el contenido.</p>');
    }
  };

  return (
    <div className="min-h-screen">
      {content ? (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p>Cargando contenido...</p>
      )}
    </div>
  );
}
