import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

interface Teacher {
  name: string;
  description: string;
  imageUrl: string;
}

interface CourseData {
  title: string;
  description: string;
  teachers: Teacher[];
  duration: string;
  schedule: string;
  modality: string;
}

interface Props {
  courseId: string;
}

export default function CourseEditor({ courseId }: Props) {
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    teachers: [],
    duration: '',
    schedule: '',
    modality: ''
  });
  const [newTeacher, setNewTeacher] = useState<Teacher>({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  async function loadCourseData() {
    try {
      const docRef = doc(db, 'post', courseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCourseData(docSnap.data() as CourseData);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const docRef = doc(db, 'post', courseId);
      await updateDoc(docRef, courseData);
      alert('Curso actualizado exitosamente');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error al guardar el curso');
    }
  }

  async function handleTeacherImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `teachers/${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);
      setNewTeacher({ ...newTeacher, imageUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    }
  }

  function addTeacher() {
    if (!newTeacher.name || !newTeacher.description || !newTeacher.imageUrl) {
      alert('Por favor complete todos los campos del profesor');
      return;
    }

    setCourseData({
      ...courseData,
      teachers: [...courseData.teachers, newTeacher]
    });

    setNewTeacher({
      name: '',
      description: '',
      imageUrl: ''
    });
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Editor de Curso</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Título del Curso</label>
          <input
            type="text"
            value={courseData.title}
            onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Descripción</label>
          <ReactQuill
            value={courseData.description}
            onChange={(value) => setCourseData({ ...courseData, description: value })}
            className="bg-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Profesores a cargo</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          {courseData.teachers.map((teacher, index) => (
            <div key={index} className="border p-4 rounded">
              <img src={teacher.imageUrl} alt={teacher.name} className="w-20 h-20 object-cover rounded-full mb-2" />
              <h3 className="font-bold">{teacher.name}</h3>
              <p>{teacher.description}</p>
            </div>
          ))}
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-bold mb-2">Agregar Nuevo Profesor</h3>
          <input
            type="text"
            placeholder="Nombre del profesor"
            value={newTeacher.name}
            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Descripción del profesor"
            value={newTeacher.description}
            onChange={(e) => setNewTeacher({ ...newTeacher, description: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleTeacherImageUpload}
            className="mb-2"
          />
          <button
            onClick={addTeacher}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Agregar Nuevo Profesor
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Información Extra</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Duración</label>
            <input
              type="text"
              value={courseData.duration}
              onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Días y horarios</label>
            <input
              type="text"
              value={courseData.schedule}
              onChange={(e) => setCourseData({ ...courseData, schedule: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">Modalidad</label>
            <input
              type="text"
              value={courseData.modality}
              onChange={(e) => setCourseData({ ...courseData, modality: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Guardar Cambios
      </button>
    </div>
  );
}