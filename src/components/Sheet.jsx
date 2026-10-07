import { X } from 'lucide-react'

// 底部弹出面板：手机上单手可达
export default function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-iron/55 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92svh] overflow-y-auto no-scrollbar bg-plate border-t-[3px] border-iron sm:border-[3px] sm:shadow-plate px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+20px)] animate-sheet-up"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="关闭" className="w-9 h-9 -mr-2 flex items-center justify-center text-steel active:text-iron">
              <X size={22} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
