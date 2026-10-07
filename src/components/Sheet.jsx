import { X } from 'lucide-react'

// 底部弹出面板
export default function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[92svh] overflow-y-auto no-scrollbar bg-paper rounded-t-[28px] px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+24px)] animate-sheet-up"
      >
        <div className="w-10 h-1 rounded-full bg-track mx-auto mb-5" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="关闭" className="w-10 h-10 -mr-2 flex items-center justify-center text-mute">
              <X size={24} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
