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
    <div className="w-full max-w-full">
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



     
      <div className='mx-auto p-2 md:p-6 max-w-7xl mb-16'>
      {/* Subir PDF */}
      <div className="relative bg-customBlue mb-20 text-white pl-4 md:px-32 py-7 rounded-xl z-10 w-full shadow-custom shadow-black/40">
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

          {/* Información extra */}
              <div className="mb-4">
                <h2 className="text-3xl font-bold mb-6">Información Extra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 items-start py-8">
                  {/* Duración */}
                    <div className="flex flex-col justify-center mb-0 self-start md:self-start pl-0 lg:pl-20">
                      <label className="block text-customBlack font-bold">Duración</label>
                      <div className="flex justify-center p-2 md:w-fit sm:w-full lg:w-64">
                        <input
                          value={courseData.duration}
                          onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                          type="text"
                          className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
                          placeholder="Ej: 6 meses"
                        />
                      </div>
                    </div>

                  {/* Día y Hora */}
                  <div className="flex flex-col justify-start mb-0 self-start md:self-start">
                    <label className="block text-customBlack font-bold mb-2">Días y Horarios</label>
                    <div className="flex p-2 w-fit lg:w-[400px]">
                      <div className="flex flex-col space-y-2 flex-grow">
                        <input
                          value={courseData.day}
                          onChange={(e) => setCourseData({ ...courseData, day: e.target.value })}
                          type="text"
                          className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
                          placeholder="Ej: lunes"
                        />
                        <div className="flex space-x-2">
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
                    <div className="flex flex-col justify-center mb-0 self-start md:self-start pl-0 lg:pl-20">
                      <label className="block text-customBlack font-bold mb-2">Modalidad</label>
                      <div className="flex justify-center p-2 md:w-fit sm:w-full lg:w-64">
                        <input
                          value={courseData.modality}
                          onChange={(e) => setCourseData({ ...courseData, modality: e.target.value })}
                          type="text"
                          className="flex-1 outline-none border rounded-full p-1 w-full pl-4"
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