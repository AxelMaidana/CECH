import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/client';
import type { Teacher, CourseData } from './types';
import '../../styles/gobal.css';

import TeacherSection from './teacher-section';

interface Props {
  courseId: string;
}

export default function CourseEditor({ courseId }: Props) {
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    teachers: [],
    duration: '',
    modality: '',
    imageUrl: '',
    price: '',
    day: '',
    startTime: '',
    endTime: '',
    hours: '',
    pdfUrl: ''
  });
  const [newTeacher, setNewTeacher] = useState<Teacher>({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingTeacherIndex, setEditingTeacherIndex] = useState<number | null>(null);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar los datos del curso al montar el componente
  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  // Ajustar el tamaño del textarea según el contenido
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [courseData.title]);

  async function loadCourseData() {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'posts', courseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCourseData({
          pdfUrl: data.pdfUrl || '',
          title: data.title || '',
          description: data.description || '',
          teachers: data.teachers || [],
          duration: data.duration || '',
          modality: data.modality || '',
          imageUrl: data.imageUrl || '',
          price: data.price || '',
          day: data.day || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          hours: data.startTime+' a '+data.endTime || ''
        });
      } else {
        setError('No se encontró el curso especificado');
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      setError('Error al cargar los datos del curso');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      let imageUrl = courseData.imageUrl;

      if (imageFile) {
        const storageRef = ref(storage, `courses/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, 'posts', courseId);
      await updateDoc(docRef, {
        ...courseData,
        imageUrl
      });
      alert('Curso actualizado exitosamente');
      window.history.back();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error al guardar el curso');
    }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCourseData({ ...courseData, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  async function handleTeacherImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `teachers/${courseId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setNewTeacher({ ...newTeacher, imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    }
  }

  function addOrEditTeacher() {
    if (!newTeacher.name || !newTeacher.description || !newTeacher.imageUrl) {
      alert('Por favor complete todos los campos del profesor');
      return;
    }

    const updatedTeachers = [...courseData.teachers];

    if (editingTeacherIndex !== null) {
      updatedTeachers[editingTeacherIndex] = newTeacher;
      setEditingTeacherIndex(null);
    } else {
      updatedTeachers.push(newTeacher);
    }

    setCourseData({ ...courseData, teachers: updatedTeachers });
    setNewTeacher({ name: '', description: '', imageUrl: '' });
    setShowTeacherForm(false);
  }

  function handleShowTeacherForm() {
    setNewTeacher({ name: '', description: '', imageUrl: '' });
    setEditingTeacherIndex(null);
    setShowTeacherForm(true);
  }

  function editTeacher(index: number) {
    setNewTeacher(courseData.teachers[index]);
    setEditingTeacherIndex(index);
    setShowTeacherForm(true);
  }

  function removeTeacher(index: number) {
    const updatedTeachers = courseData.teachers.filter((_, i) => i !== index);
    setCourseData({ ...courseData, teachers: updatedTeachers });
  }

  async function handlePdfUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `courses/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const pdfUrl = await getDownloadURL(storageRef);

      const docRef = doc(db, 'posts', courseId);
      await updateDoc(docRef, { pdfUrl });
      setCourseData((prevData) => ({ ...prevData, pdfUrl }));
      alert('PDF subido y guardado en el curso correctamente');
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Error al subir el PDF');
    }
  }

  if (loading) return <div className="text-center py-8">Cargando datos del curso...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;


  return (
    <div className="w-full">
        {/* Editar curso */}
        <div className="flex items-center justify-start py-8">
          <div className="relative flex-shrink-0">
            <h3 className="text-lg md:text-2xl font-bold bg-customGreen text-white px-4 py-2 rounded-r-full text-center">
              Editar Curso
            </h3>
          </div>
        </div>
        
        {/* Contenedor de la imagen y del título */}
        <div className=" bg-white rounded-lg">
          <div className="mb-6">
          <div className='mx-auto p-2 md:p-6 max-w-7xl '>
          <div className="relative mb-4 cursor-pointer">
          <img 
            src={courseData.imageUrl}
            alt={courseData.title}
            className="w-full h-[400px] object-cover cursor-pointer rounded-t-3xl"
            onClick={() => document.getElementById('imageInput')?.click()} // Permitir clic en la imagen
          />
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-t-3xl"
            onClick={() => document.getElementById('imageInput')?.click()} // También permitir clic en el área de hover
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

      {/* Contenedor del título y descripción */}
      
          <div className="mx-auto">
            <textarea
              ref={textareaRef}
              value={courseData.title}
              onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
              className="text-5xl md:text-7xl font-bold w-full h-[90px] overflow-hidden resize-none outline-none"
              placeholder="Título del Curso"
            />
          </div>

          <div className="mb-10">
            <label className="block text-lg md:text-xl text-customBlack font-bold mb-2">
              Descripción:
            </label>
            <div className="bg-white">
              <ReactQuill
                value={courseData.description}
                onChange={(value) => setCourseData({ ...courseData, description: value })}
                className="bg-white overflow-hidden focus-within:ring-opacity-50"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['clean'],
                  ],
                }}
                theme="snow"
              />
            </div>
          </div>
      </div>

      {/* Subir PDF */}
      <div className="relative bg-customBlue text-white pl-4 md:px-32 py-7 rounded-xl z-10 w-full shadow-custom shadow-black/40">
        <label className="text-3xl font-bold mb-4 opacity-50 cursor-pointer">
          + Agregar Programa
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" // Ocultar el input
            onChange={handlePdfUpload} 
          />
        </label>
      </div>


     
      <div className='mx-auto p-2 md:p-6 max-w-7xl my-16'>
          {/* Profesores a cargo */}
          <div className="mb-12">
          <TeacherSection
                teachers={courseData.teachers}
                onTeacherChange={(index, updatedTeacher) => {
                  const updatedTeachers = [...courseData.teachers]
                  updatedTeachers[index] = updatedTeacher
                  setCourseData({ ...courseData, teachers: updatedTeachers })
                }}
                onImageUpload={async (index, event) => {
                  const file = event.target.files?.[0]
                  if (!file) return

                  try {
                    const storageRef = ref(storage, `teachers/${courseId}/${file.name}`)
                    await uploadBytes(storageRef, file)
                    const imageUrl = await getDownloadURL(storageRef)
                    
                    const updatedTeachers = [...courseData.teachers]
                    updatedTeachers[index] = { ...updatedTeachers[index], imageUrl }
                    setCourseData({ ...courseData, teachers: updatedTeachers })
                  } catch (error) {
                    console.error('Error uploading image:', error)
                    alert('Error al subir la imagen')
                  }
                }}
                onAddTeacher={() => {
                  setCourseData({
                    ...courseData,
                    teachers: [...courseData.teachers, { name: '', description: '', imageUrl: '' }]
                  })
                }}
                onRemoveTeacher={(index) => {
                  const updatedTeachers = courseData.teachers.filter((_, i) => i !== index)
                  setCourseData({ ...courseData, teachers: updatedTeachers })
                }}
              />
            </div>

            {/* Informacion extra */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-6">Información Extra</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0 justify-items-center">
              {/* Duración */}
              <div className="mb-4">
                <label className="block text-customBlack font-bold">Duración</label>
                <div className="flex items-center p-2 w-fit lg:w-64">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 29 29"
                  fill="currentColor"
                  className="text-gray-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.799 0.00128641C12.4388 0.00128641 12.1465 0.29656 12.1465 0.660613V3.48419C12.1465 3.84825 12.4388 4.14352 12.799 4.14352C13.1594 4.14352 13.4515 3.84825 13.4515 3.48419V0.660613C13.4515 0.29656 13.1594 0.00128641 12.799 0.00128641ZM18.6968 0.0036877C18.3371 0.0036877 18.0452 0.298532 18.0452 0.662157V3.48574C18.0452 3.84928 18.3371 4.14395 18.6968 4.14395C19.0566 4.14395 19.3484 3.84928 19.3484 3.48574V0.662157C19.3484 0.298532 19.0566 0.0036877 18.6968 0.0036877ZM6.65232 0.0032589C6.29197 0.0032589 5.99986 0.298361 5.99986 0.662586V3.48617C5.99986 3.85022 6.29197 4.14524 6.65232 4.14524C7.01267 4.14524 7.30479 3.85022 7.30479 3.48617V0.662586C7.30479 0.298361 7.01267 0.0032589 6.65232 0.0032589ZM24.096 0C23.7345 0 23.4412 0.296388 23.4412 0.661728V3.48505C23.4412 3.85039 23.7345 4.14661 24.096 4.14661C24.4575 4.14661 24.7507 3.85039 24.7507 3.48505V0.661728C24.7507 0.296388 24.4575 0 24.096 0ZM5.2626 7.5471C5.09397 7.5471 4.93221 7.61493 4.81289 7.73551C4.69365 7.85601 4.6266 8.01938 4.6266 8.18996V10.1169C4.6266 10.2873 4.69365 10.4509 4.81289 10.5712C4.93221 10.6917 5.09397 10.7595 5.2626 10.7595H7.99146C8.34265 10.7595 8.62738 10.4717 8.62738 10.1169V8.18996C8.62738 7.835 8.34265 7.54736 7.99146 7.54736L5.2626 7.5471ZM11.0238 7.5471C10.8552 7.5471 10.6934 7.61493 10.5741 7.73551C10.4549 7.85601 10.3878 8.01938 10.3878 8.18996V10.1169C10.3878 10.2873 10.4549 10.4509 10.5741 10.5712C10.6934 10.6917 10.8552 10.7595 11.0238 10.7595H13.7526C14.1039 10.7595 14.3888 10.4717 14.3888 10.1169V8.18996C14.3888 7.835 14.1039 7.54736 13.7526 7.54736L11.0238 7.5471ZM16.8044 7.5471C16.6356 7.5471 16.4741 7.61493 16.3547 7.73551C16.2355 7.85601 16.1684 8.01938 16.1684 8.18996V10.1169C16.1684 10.2873 16.2355 10.4509 16.3547 10.5712C16.4741 10.6917 16.6356 10.7595 16.8044 10.7595H19.5333C19.8844 10.7595 20.1692 10.4717 20.1692 10.1169V8.18996C20.1692 7.835 19.8844 7.54736 19.5333 7.54736L16.8044 7.5471ZM22.5865 7.5471C22.4179 7.5471 22.2561 7.61493 22.1367 7.73551C22.0175 7.85601 21.9505 8.01938 21.9505 8.18996V10.1169C21.9505 10.2873 22.0175 10.4509 22.1367 10.5712C22.2561 10.6917 22.4179 10.7595 22.5865 10.7595H25.3153C25.6667 10.7595 25.9512 10.4717 25.9512 10.1169V8.18996C25.9512 7.835 25.6667 7.54736 25.3153 7.54736L22.5865 7.5471ZM5.2626 12.3306C5.09397 12.3306 4.93221 12.3985 4.81289 12.519C4.69365 12.6396 4.6266 12.8028 4.6266 12.9734V14.9002C4.6266 15.0708 4.69365 15.2342 4.81289 15.3547C4.93221 15.4754 5.09397 15.5431 5.2626 15.5431H7.99146C8.34265 15.5431 8.62738 15.2552 8.62738 14.9002V12.9734C8.62738 12.6185 8.34265 12.3306 7.99146 12.3306H5.2626ZM11.0238 12.3306C10.8552 12.3306 10.6934 12.3985 10.5741 12.519C10.4549 12.6396 10.3878 12.8028 10.3878 12.9734V14.9002C10.3878 15.0708 10.4549 15.2342 10.5741 15.3547C10.6934 15.4754 10.8552 15.5431 11.0238 15.5431H13.7526C14.1039 15.5431 14.3888 15.2552 14.3888 14.9002V12.9734C14.3888 12.6185 14.1039 12.3306 13.7526 12.3306H11.0238ZM16.8044 12.3306C16.6356 12.3306 16.4741 12.3985 16.3547 12.519C16.2355 12.6396 16.1684 12.8028 16.1684 12.9734V14.9002C16.1684 15.0708 16.2355 15.2342 16.3547 15.3547C16.4741 15.4754 16.6356 15.5431 16.8044 15.5431H19.5333C19.8844 15.5431 20.1692 15.2552 20.1692 14.9002V12.9734C20.1692 12.6185 19.8844 12.3306 19.5333 12.3306H16.8044ZM22.5865 12.3306C22.4179 12.3306 22.2561 12.3985 22.1367 12.519C22.0175 12.6396 21.9505 12.8028 21.9505 12.9734V14.9002C21.9505 15.0708 22.0175 15.2342 22.1367 15.3547C22.2561 15.4754 22.4179 15.5431 22.5865 15.5431H25.3153C25.6667 15.5431 25.9512 15.2552 25.9512 14.9002V12.9734C25.9512 12.6185 25.6667 12.3306 25.3153 12.3306H22.5865ZM5.2626 17.1881C5.09397 17.1881 4.93221 17.2557 4.81289 17.3763C4.69365 17.4968 4.6266 17.6603 4.6266 17.8307V19.7577C4.6266 19.9283 4.69365 20.0916 4.81289 20.2121C4.93221 20.3327 5.09397 20.4003 5.2626 20.4003H7.99146C8.34265 20.4003 8.62738 20.1126 8.62738 19.7577V17.8307C8.62738 17.4759 8.34265 17.1881 7.99146 17.1881H5.2626ZM11.0238 17.1881C10.8552 17.1881 10.6934 17.2557 10.5741 17.3763C10.4549 17.4968 10.3878 17.6603 10.3878 17.8307V19.7577C10.3878 19.9283 10.4549 20.0916 10.5741 20.2121C10.6934 20.3327 10.8552 20.4003 11.0238 20.4003H13.7526C14.1039 20.4003 14.3888 20.1126 14.3888 19.7577V17.8307C14.3888 17.4759 14.1039 17.1881 13.7526 17.1881H11.0238ZM16.8044 17.1881C16.6356 17.1881 16.4741 17.2557 16.3547 17.3763C16.2355 17.4968 16.1684 17.6603 16.1684 17.8307V19.7577C16.1684 19.9283 16.2355 20.0916 16.3547 20.2121C16.4741 20.3327 16.6356 20.4003 16.8044 20.4003H19.5333C19.8844 20.4003 20.1692 20.1126 20.1692 19.7577V17.8307C20.1692 17.4759 19.8844 17.1881 19.5333 17.1881H16.8044ZM22.5865 17.1881C22.4179 17.1881 22.2561 17.2557 22.1367 17.3763C22.0175 17.4968 21.9505 17.6603 21.9505 17.8307V19.7577C21.9505 19.9283 22.0175 20.0916 22.1367 20.2121C22.2561 20.3327 22.4179 20.4003 22.5865 20.4003H25.3153C25.6667 20.4003 25.9512 20.1126 25.9512 19.7577V17.8307C25.9512 17.4759 25.6667 17.1881 25.3153 17.1881H22.5865ZM27.9068 6.70733L27.9084 18.515H27.9079C27.853 19.6699 27.7801 20.4525 27.4319 20.8049C27.0902 21.1511 26.3566 21.1999 25.2404 21.2181L5.30792 21.1979H5.30775C4.15295 21.1909 3.39686 21.1483 3.0584 20.8049C2.71664 20.4583 2.66444 19.6738 2.64204 18.495H2.64195L2.66495 6.70733H27.9068ZM5.36351 1.67207C5.35655 1.67207 5.34959 1.67224 5.34263 1.6725C4.3905 1.70938 3.06485 1.72627 2.33812 2.45541C1.60715 3.18866 1.60461 4.51538 1.5777 5.45857C1.57762 5.46337 1.57753 5.46843 1.57753 5.47332L1.55207 18.4929C1.55207 18.4968 1.55216 18.5005 1.55216 18.5043C1.57049 19.4765 1.55971 20.8451 2.28627 21.5822C3.01724 22.3237 4.35926 22.2935 5.30232 22.2992C5.30326 22.2992 5.3041 22.2992 5.30504 22.2992L25.2438 22.3196H25.2447C25.2477 22.3196 25.2505 22.3196 25.2532 22.3194C26.1726 22.3044 27.476 22.3194 28.2034 21.583C28.921 20.8563 28.9517 19.5177 28.9973 18.5524L28.9975 18.5464C28.9979 18.5377 28.9982 18.5289 28.9982 18.5201L28.9964 5.49768C29.0044 4.5363 29.0533 3.16319 28.3151 2.41982C27.5814 1.68082 26.2033 1.70415 25.2267 1.6936C25.2247 1.6936 25.2228 1.6936 25.221 1.6936H25.2203L24.9651 1.69377V3.48505C24.9651 3.97028 24.576 4.3635 24.096 4.3635C23.6159 4.3635 23.2268 3.97028 23.2268 3.48505V1.69557L19.5652 1.69926V3.48574C19.5652 3.97028 19.1763 4.36324 18.6968 4.36324C18.2171 4.36324 17.8285 3.97028 17.8285 3.48574V1.70106L14.2753 1.70458L13.6704 1.70235V3.48419C13.6704 3.97028 13.2803 4.36461 12.799 4.36461C12.318 4.36461 11.9277 3.97028 11.9277 3.48419V1.696L7.52316 1.67996V3.48617C7.52316 3.972 7.13327 4.36615 6.65232 4.36615C6.17137 4.36615 5.78149 3.972 5.78149 3.48617V1.67362L5.36546 1.67207C5.36478 1.67207 5.36419 1.67207 5.36351 1.67207ZM1.36587 3.73907C1.14912 3.8401 0.951969 3.96943 0.786051 4.1358C0.0550796 4.86914 0.0524487 6.19586 0.0256303 7.13896C0.0254605 7.14385 0.0253756 7.14891 0.0253756 7.15372L0 20.1733C0 20.1772 -1.62986e-08 20.181 8.48684e-05 20.1849C0.0183316 21.1569 0.00755329 22.5255 0.734196 23.2627C1.46508 24.0039 2.80711 23.9741 3.75016 23.9796C3.7511 23.9796 3.75203 23.9796 3.75288 23.9796L23.6917 24H23.6924C23.6954 24 23.6982 24 23.7013 24C24.6205 23.9848 25.9239 23.9997 26.651 23.2634C26.8294 23.083 26.9654 22.8645 27.0697 22.6235H25.6973C25.3066 22.8456 24.6353 22.8831 23.6882 22.8987L3.75568 22.8783H3.7556C2.60079 22.8713 1.84478 22.8287 1.50624 22.4853C1.16448 22.1387 1.11237 21.354 1.08996 20.1751H1.08979L1.11517 7.16752H1.11509C1.14063 6.27244 1.18128 5.61294 1.36587 5.20103H1.36604V3.73907H1.36587Z" fill="black" fillOpacity="0.75"/>
                </svg>
                  <input
                    value={courseData.duration}
                    onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                    type="text"
                    className="flex-1 outline-none border rounded-full p-1 w-fit pl-4"
                    placeholder="Ej: 6 meses"
                  />
                </div>
              </div>

              {/* dia y hora*/}
              <div className="grid mb-4">
                <label className="block text-customBlack font-bold mb-2">Dias y Horarios</label>
                <div className="flex items-center p-2 w-fit lg:w-[400px]">
                  <svg width="28" height="28" viewBox="0 0 30 30" fill="none" className='text-gray-500 mr-2 flex-shrink-0' xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4676 0.00128956C11.1003 0.00128956 10.8024 0.297115 10.8024 0.662232V3.49256C10.8024 3.85768 11.1003 4.15341 11.4676 4.15341C11.8351 4.15341 12.1328 3.85768 12.1328 3.49256V0.662232C12.1328 0.297115 11.8351 0.00128956 11.4676 0.00128956ZM17.4813 0.00378271C17.1143 0.00378271 16.8168 0.299092 16.8168 0.663779V3.49411C16.8168 3.85854 17.1143 4.1541 17.4813 4.1541C17.8481 4.1541 18.1456 3.85854 18.1456 3.49411V0.663779C18.1456 0.299092 17.8481 0.00378271 17.4813 0.00378271ZM5.20037 0.00309494C4.83286 0.00309494 4.5351 0.299092 4.5351 0.664037V3.49454C4.5351 3.8594 4.83286 4.15539 5.20037 4.15539C5.56763 4.15539 5.86556 3.8594 5.86556 3.49454V0.664037C5.86556 0.299092 5.56763 0.00309494 5.20037 0.00309494ZM22.9864 0C22.6178 0 22.319 0.296943 22.319 0.663092V3.49342C22.319 3.85965 22.6178 4.15677 22.9864 4.15677C23.355 4.15677 23.6538 3.85965 23.6538 3.49342V0.663092C23.6538 0.296943 23.355 0 22.9864 0ZM9.67213 7.54229V7.54255C9.50018 7.54255 9.33542 7.6103 9.21358 7.73117C9.09217 7.85196 9.02372 8.01573 9.02372 8.18673V10.1184C9.02372 10.2892 9.09217 10.4532 9.21358 10.5738C9.33542 10.6946 9.50018 10.7626 9.67213 10.7626H12.4547C12.8127 10.7626 13.1031 10.4741 13.1031 10.1184V8.18673C13.1031 7.83081 12.8127 7.54255 12.4547 7.54255L9.67213 7.54229ZM15.5663 7.54229V7.54255C15.3942 7.54255 15.2294 7.6103 15.1078 7.73117C14.9861 7.85196 14.9179 8.01573 14.9179 8.18673V10.1184C14.9179 10.2892 14.9861 10.4532 15.1078 10.5738C15.2294 10.6946 15.3944 10.7626 15.5663 10.7626H18.3487C18.7069 10.7626 18.9972 10.4741 18.9972 10.1184V8.18673C18.9972 7.83081 18.7069 7.54255 18.3487 7.54255L15.5663 7.54229ZM21.4618 7.54229V7.54255C21.29 7.54255 21.1249 7.6103 21.0033 7.73117C20.8817 7.85196 20.8134 8.01573 20.8134 8.18673V10.1184C20.8134 10.2892 20.8817 10.4532 21.0033 10.5738C21.1249 10.6946 21.29 10.7626 21.4618 10.7626H24.2443C24.6024 10.7626 24.8927 10.4741 24.8927 10.1184V8.18673C24.8927 7.83081 24.6024 7.54255 24.2443 7.54255L21.4618 7.54229ZM3.79782 7.54229V7.54255C3.62597 7.54255 3.46112 7.6103 3.33928 7.73117C3.21787 7.85196 3.14942 8.01573 3.14942 8.18673V10.1184C3.14942 10.2892 3.21787 10.4532 3.33928 10.5738C3.46112 10.6946 3.62597 10.7626 3.79782 10.7626H6.58025C6.9385 10.7626 7.22891 10.4741 7.22891 10.1184V8.18673C7.22891 7.83081 6.9385 7.54255 6.58025 7.54255L3.79782 7.54229ZM3.79782 12.3377C3.62597 12.3377 3.46112 12.4056 3.33928 12.5264C3.21787 12.6472 3.14942 12.8109 3.14942 12.9819V14.9134C3.14942 15.0844 3.21787 15.2482 3.33928 15.369C3.46112 15.49 3.62597 15.5579 3.79782 15.5579H6.58025C6.9385 15.5579 7.22891 15.2692 7.22891 14.9134V12.9819C7.22891 12.6261 6.9385 12.3377 6.58025 12.3377H3.79782ZM9.67213 12.3377C9.50018 12.3377 9.33542 12.4056 9.21358 12.5264C9.09217 12.6472 9.02372 12.8109 9.02372 12.9819V14.9134C9.02372 15.0844 9.09217 15.2482 9.21358 15.3692C9.33542 15.49 9.50018 15.5579 9.67213 15.5579H12.4547C12.8127 15.5579 13.1031 15.2692 13.1031 14.9134V12.9819C13.1031 12.6261 12.8127 12.3377 12.4547 12.3377H9.67213ZM15.5663 12.3377C15.3942 12.3377 15.2294 12.4056 15.1078 12.5264C14.9861 12.6472 14.9179 12.8109 14.9179 12.9819V14.9134C14.9179 15.0844 14.9861 15.2482 15.1078 15.3692C15.2294 15.49 15.3944 15.5579 15.5663 15.5579H17.983C18.2379 14.9567 18.5811 14.4003 18.9969 13.9052H18.9972V12.9819C18.9972 12.6261 18.7069 12.3377 18.3487 12.3377H15.5663ZM24.0577 17.6886C24.2843 17.6886 24.4682 17.8713 24.4682 18.0967C24.4682 18.322 24.2843 18.5047 24.0577 18.5047C23.8309 18.5047 23.647 18.322 23.647 18.0967C23.647 17.8713 23.8309 17.6886 24.0577 17.6886ZM23.9944 13.8669C23.7385 13.8669 23.5311 14.0729 23.5311 14.3271V17.3858H23.5307C23.2978 17.5566 23.1532 17.837 23.1705 18.1456V18.1457C23.1969 18.6157 23.5888 18.9793 24.0568 18.9793C24.0734 18.9793 24.0901 18.9789 24.1069 18.9779C24.2197 18.9717 24.3265 18.9448 24.4237 18.9013H24.4239L26.2603 20.0361C26.3366 20.0832 26.421 20.1057 26.5045 20.1057C26.6594 20.1057 26.8106 20.0286 26.8984 19.8885C27.0335 19.6726 26.9671 19.3888 26.7497 19.2545L24.9454 18.1395H24.9452C24.9465 18.1092 24.9465 18.0786 24.9447 18.0477V18.0476C24.9266 17.7212 24.7321 17.4464 24.458 17.3086H24.4578V14.3271C24.4578 14.0729 24.2502 13.8669 23.9944 13.8669ZM3.79782 17.2069C3.62597 17.2069 3.46112 17.2747 3.33928 17.3956C3.21787 17.5163 3.14942 17.6803 3.14942 17.8511V19.7828C3.14942 19.9537 3.21787 20.1176 3.33928 20.2384C3.46112 20.3592 3.62597 20.4271 3.79782 20.4271H6.58025C6.9385 20.4271 7.22891 20.1386 7.22891 19.7828V17.8511C7.22891 17.4955 6.9385 17.2069 6.58025 17.2069H3.79782ZM9.67213 17.2069C9.50018 17.2069 9.33542 17.2747 9.21358 17.3956C9.09217 17.5163 9.02372 17.6803 9.02372 17.8511V19.7828C9.02372 19.9537 9.09217 20.1176 9.21358 20.2384C9.33542 20.3592 9.50018 20.4271 9.67213 20.4271H12.4547C12.8127 20.4271 13.1031 20.1386 13.1031 19.7828V17.8511C13.1031 17.4955 12.8127 17.2069 12.4547 17.2069H9.67213ZM15.5663 17.2069C15.3942 17.2069 15.2294 17.2747 15.1078 17.3957C14.9861 17.5163 14.9179 17.6803 14.9179 17.8511V19.7828C14.9179 19.9537 14.9861 20.1176 15.1078 20.2384C15.2294 20.3592 15.3944 20.4271 15.5663 20.4271H17.8988C17.6567 19.7953 17.5096 19.1151 17.4761 18.4031C17.4569 17.9963 17.4755 17.5965 17.5288 17.2069H15.5663ZM3.88626 1.67617C3.88583 1.67617 3.8854 1.67617 3.88514 1.67617C3.8783 1.67617 3.87164 1.67617 3.86497 1.67643C2.89406 1.7134 1.54248 1.73033 0.801482 2.46125C0.0559878 3.1963 0.0533918 4.52653 0.0261334 5.47177C0.0258738 5.47685 0.0258738 5.48166 0.0258738 5.48648L0 18.5381C0 18.542 0 18.5458 0 18.5496C0.0186049 19.5241 0.00770156 20.8961 0.748523 21.6349C1.49376 22.3782 2.86213 22.3481 3.82378 22.3537C3.82465 22.3537 3.82551 22.3537 3.82664 22.3537L19.0656 22.3691C18.771 22.0297 18.5107 21.6598 18.29 21.2642L3.82958 21.2497H3.82932C2.65193 21.2427 1.881 21.1999 1.53581 20.8558C1.18734 20.5082 1.13421 19.7218 1.11119 18.5403L1.13464 6.72385H26.872L26.8727 12.1773H26.8731C27.2659 12.3622 27.6378 12.5845 27.9841 12.84L27.983 5.51098C27.9912 4.54742 28.041 3.17103 27.2883 2.42558C26.5402 1.68494 25.1351 1.70832 24.1392 1.69775C24.1372 1.69775 24.1352 1.69775 24.1335  1.69775H24.1328L23.8725 1.69801V3.49342C23.8725 3.97984 23.4758 4.37402 22.9864 4.37402C22.497 4.37402 22.1003 3.97984 22.1003 3.49342V1.69973L18.3667 1.70351V3.49411C18.3667 3.98001 17.9703 4.37376 17.4813 4.37376C16.9921 4.37376 16.5957 3.98001 16.5957 3.49411V1.70523L12.9729 1.70875L12.3562 1.70652V3.49256C12.3562 3.98001 11.9583 4.37505 11.4676 4.37505C10.9772 4.37505 10.5793 3.98001 10.5793 3.49256V1.70016L6.08822 1.68408V3.49454C6.08822 3.98182 5.69059 4.37659 5.20037 4.37659C4.7099 4.37659 4.31227 3.98182 4.31227 3.49454V1.67772L3.88825 1.67617C3.88756 1.67617 3.88695 1.67617 3.88626 1.67617ZM24.0615 13.2196C26.6673 13.2196 28.8383 15.2557 28.9614 17.8682C29.0884 20.5589 26.9959 22.8421 24.2874 22.9683C24.2092 22.972 24.1313 22.9738 24.0537 22.9738C21.4481 22.9738 19.2769 20.9378 19.1538 18.3251C19.0268 15.6346 21.1193 13.3512 23.8278 13.2251C23.906 13.2214 23.984 13.2196 24.0615 13.2196ZM24.0624 12.1934C24.0619 12.1934 24.0617 12.1934 24.0612 12.1934C23.9678 12.1934 23.8738 12.1955 23.7795 12.2C20.5013 12.3527 17.9684 15.1163 18.1219 18.373V18.3731C18.2711 21.5357 20.8989 24 24.0529 24C24.1467 24 24.2411 23.9979 24.336 23.9934C27.6141 23.8408 30.1471 21.077 29.9934 17.8203C29.8443 14.6577 27.2163 12.1934 24.0624 12.1934Z" fill="black" fillOpacity="0.75"/>
                  </svg>
                  <div className='flex flex-col space-y-2 flex-grow'>
                    <input
                      value={courseData.day}
                      onChange={(e) => setCourseData({ ...courseData, day: e.target.value })}
                      type="text"
                      className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
                      placeholder="Ej: lunes"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        value={courseData.startTime}
                        onChange={(e) => setCourseData({ ...courseData, startTime: e.target.value })}
                        type="text"
                        className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
                        placeholder="Ej: 22:00"
                      />
                      <span className="font-bold">a</span>
                      <input
                        value={courseData.endTime}
                        onChange={(e) => setCourseData({ ...courseData, endTime: e.target.value })}
                        type="text"
                        className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
                        placeholder="Ej: 23:00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            
            
            {/* Modalidad */}
            <div className="mb-4">
              <label className="block text-customBlack font-bold mb-2">Modalidad</label>
              <div className="flex items-center p-2 w-fit lg:w-64">
              <svg
                  width="28"
                  height="28"
                  viewBox="0 0 29 29"
                  fill="currentColor"
                  className="text-gray-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.0011 22.0405C10.4235 22.0405 6.84544 22.0089 3.2683 22.056C1.84826 22.0748 0.796522 21.0499 0.809693 19.58C0.853907 14.6543 0.853437 9.72813 0.809693 4.80245C0.796522 3.29586 1.88213 2.31091 3.30405 2.31797C10.4466 2.35278 17.5891 2.33349 24.7316 2.33396C26.2852 2.33396 27.1719 3.21355 27.1723 4.76011C27.1738 9.72484 27.1738 14.6896 27.1723 19.6543C27.1723 21.1529 26.2829 22.0376 24.7735 22.0386C21.1827 22.0409 17.5919 22.0395 14.0011 22.0395V22.0405ZM13.9884 20.3923C17.5665 20.3923 21.1446 20.3923 24.7222 20.3923C25.376 20.3923 25.5251 20.2465 25.5251 19.5992C25.5251 14.6599 25.5251 9.72107 25.5251 4.78175C25.5251 4.13594 25.3685 3.97931 24.725 3.97931C17.5689 3.97931 10.4132 3.97931 3.25701 3.97931C2.63895 3.97931 2.47385 4.14346 2.47385 4.76011C2.47291 9.71214 2.47291 14.6646 2.47338 19.6167C2.47338 20.2366 2.63189 20.3923 3.25466 20.3923C6.83274 20.3923 10.4108 20.3923 13.9884 20.3923Z" fill="#2E2E2E"/>
                  <path d="M14.1935 25.6651C12.4197 25.6651 10.6455 25.6679 8.87174 25.6632C8.2899 25.6618 7.8915 25.2587 7.95123 24.7545C8.00109 24.3344 8.3247 24.0348 8.77155 24.0249C9.30213 24.0132 9.83317 24.0212 10.3642 24.0216C13.4202 24.0216 16.4757 24.0212 19.5317 24.0231C20.0646 24.0231 20.3967 24.2756 20.4597 24.7126C20.5378 25.2535 20.1587 25.6618 19.5542 25.6637C17.7673 25.6689 15.9804 25.6656 14.1935 25.6656V25.6651Z" fill="#2E2E2E"/>
                </svg>
                <input
                  value={courseData.modality}
                  onChange={(e) => setCourseData({ ...courseData, modality: e.target.value })}
                  type="text"
                  className="flex-1 outline-none border rounded-full p-1 w-fit pl-4"
                  placeholder="Ej: Asincrónico"
                />
              </div>  
            </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-end">
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
  </div>
</div>


  );
}