"use client"

import { ImageIcon } from "lucide-react"
import type { Teacher } from "./types"

interface Props {
  teacher: Teacher
  onTeacherChange: (teacher: Teacher) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onAdd: () => void
  isEditing: boolean
}

export default function Component({ teacher, onTeacherChange, onImageUpload, onAdd, isEditing }: Props = {
  teacher: { name: "", description: "", imageUrl: "" },
  onTeacherChange: () => {},
  onImageUpload: () => {},
  onAdd: () => {},
  isEditing: false
}) {
  return (
    <div className="flex gap-6 p-6 max-w-2xl">
      <div className="flex flex-col items-start gap-2">
        <label htmlFor="image-upload" className="text-md font-medium text-muted-foreground">
          Foto
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer w-24 h-24 rounded-full bg-muted flex items-center justify-center"
          >
            {teacher.imageUrl ? (
              <img
                src={teacher.imageUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-full"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </label>
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nombre del profesor"
            value={teacher.name}
            onChange={(e) => onTeacherChange({ ...teacher, name: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl shadow-md shadow-gray-300 border bg-background focus-visible:outline-none resize-none"
          />
        </div>
        <div>
          <textarea
            placeholder="Descripcion del profesor"
            value={teacher.description}
            onChange={(e) => onTeacherChange({ ...teacher, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl shadow-md shadow-gray-300 border bg-background focus-visible:outline-none resize-none"
            rows={4}
          />
        </div>
      </div>
      {/* Botón de guardar cambios */}
      <button
        onClick={onAdd}
        className="bg-customBlue hover:scale-105 transition duration-300 ease-in-out border-[3px] border-customBlue rounded-full text-white font-bold h-10 w-10 ml-2 -mr-2 flex items-center justify-center sm:h-8 sm:w-32 md:h-9 md:w-36 lg:h-9 lg:w-40"
      >
        {isEditing ? 'Guardar Cambios' : 'Agregar Profesor'}
      </button>
    </div>
  )
}