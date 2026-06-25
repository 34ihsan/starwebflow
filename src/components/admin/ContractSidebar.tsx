'use client'

import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

type Clause = {
  id: string
  tag: string
  title: string
  content: string
}

function DraggableClause({ clause }: { clause: Clause }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: clause.id,
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-3 bg-[#1A1A2E] border border-white/10 rounded-lg flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-[#8B5CF6]/50 transition-colors"
      {...listeners} 
      {...attributes}
    >
      <GripVertical className="w-4 h-4 text-[#64748B]" />
      <div>
        <h4 className="text-white text-sm font-medium">{clause.title}</h4>
        <span className="text-[10px] uppercase tracking-wider text-[#8B5CF6] font-semibold bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full mt-1 inline-block">
          {clause.tag}
        </span>
      </div>
    </div>
  )
}

export default function ContractSidebar({ clauses }: { clauses: Clause[] }) {
  return (
    <div className="bg-[#0A0A0F] border border-white/[0.05] rounded-xl flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-white/[0.05]">
        <h3 className="text-white font-semibold font-['Outfit']">Standart Maddeler</h3>
        <p className="text-[#64748B] text-xs mt-1">Maddeleri sağdaki editöre sürükleyin</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {clauses.map(clause => (
          <DraggableClause key={clause.id} clause={clause} />
        ))}
      </div>
    </div>
  )
}
