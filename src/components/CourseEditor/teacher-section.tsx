"use client"

import { ImageIcon } from "lucide-react"
import type { Teacher } from "./types"

interface TeacherSectionProps {
  teachers: Teacher[]
  onTeacherChange: (index: number, teacher: Teacher) => void
  onImageUpload: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void
  onAddTeacher: () => void
  onRemoveTeacher: (index: number) => void
}

export default function Component({
  teachers = [],
  onTeacherChange,
  onImageUpload,
  onAddTeacher,
  onRemoveTeacher,
}: TeacherSectionProps) {
  return (
    <div className="space-y-6 mb-6">
      <h2 className="text-3xl font-bold">Profesores a cargo</h2>
      <div className="gap-y-6 grid grid-cols-1 md:grid-cols-2 justify-items-center items-center">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="flex gap-x-6 p-6 w-fit bg-white rounded-lg relative group"
          >
            <div className="flex-shrink-0 justify-center">
              <label htmlFor={`image-upload-${index}`} className="cursor-pointer block">
                <input
                  type="file"
                  id={`image-upload-${index}`}
                  accept="image/*"
                  onChange={(e) => onImageUpload(index, e)}
                  className="hidden"
                />
                {teacher.imageUrl ? (
                  <img
                    src={teacher.imageUrl}
                    alt=""
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 bg-black/50 rounded-full flex items-center justify-center">
                    <img src="/media/SubirImagen.png" alt="Vector" className="w-8 h-8 text-gray-700" />
                  </div>
                )}
              </label>
            </div>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Nombre del profesor"
                value={teacher.name}
                onChange={(e) =>
                  onTeacherChange(index, { ...teacher, name: e.target.value })
                }
                className="w-fit lg:w-64 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none shadow-md shadow-black/30"
              />
              <textarea
                placeholder="Descripcion del profesor"
                value={teacher.description}
                onChange={(e) =>
                    onTeacherChange(index, { ...teacher, description: e.target.value })
                }
                className="max-w-xs w-full h-fit px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none shadow-md shadow-black/30 resize-none overflow-hidden"
                rows={4}
                style={{ overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 5 }}
                />

            </div>
            <button
              onClick={() => onRemoveTeacher(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-customBlue opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove teacher"
            >
              ×
            </button>
          </div>
        ))}
        <button
            onClick={onAddTeacher}
            className="h-[200px] w-[337px] lg:w-[400px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:border-[#008BB2] hover:bg-[#008BB2]/5 transition-colors group"
            >
            <span className="h-10 w-10 rounded-full bg-[#008BB2] flex items-center justify-center text-white text-sm font-medium">
                <svg
                data-testid="geist-icon"
                height="16"
                width="16"
                viewBox="0 0 16 16"
                className="text-white"
                >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.75 1.75V1H7.25V1.75V6.75H2.25H1.5V8.25H2.25H7.25V13.25V14H8.75V13.25V8.25H13.75H14.5V6.75H13.75H8.75V1.75Z"
                    fill="currentColor"
                />
                </svg>
            </span>
        </button>
      </div>
    </div>
  )
}