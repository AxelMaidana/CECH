import { Edit2Icon, Trash2Icon } from "lucide-react"
import type { Teacher } from "./types"

interface Props {
  teachers: Teacher[]
  onRemove: (index: number) => void
  onEdit: (index: number) => void
}

export default function Component({ teachers, onRemove, onEdit }: Props = {
  teachers: [],
  onRemove: () => {},
  onEdit: () => {}
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
      {teachers.map((teacher, index) => (
        <div key={index} className="flex gap-6 p-6 bg-background rounded-lg border border-border">
          {/* Foto del profesor */}
          <div className="flex-shrink-0">
            {teacher.imageUrl ? (
              <img
                src={teacher.imageUrl}
                alt={teacher.name}
                className="w-20 h-20 object-cover rounded-full"
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-muted-foreground">
                  {teacher.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Información del profesor */}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-foreground">{teacher.name}</h3>
            <p className="text-sm text-muted-foreground">{teacher.description}</p>
          </div>
          
          {/* Botones de editar y eliminar */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(index)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Edit teacher"
            >
              <Edit2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove teacher"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
