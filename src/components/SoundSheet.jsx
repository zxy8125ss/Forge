import { useRef, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import Sheet from './Sheet'

// 背景声音选择面板
export default function SoundSheet({ audio, onSelect, onClose }) {
  const { ambientTracks, classicalTracks, classicalShuffle, currentTrack, localTracks, importLocal, removeLocal } = audio
  const current = currentTrack?.id || ''
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setMsg('')
    try {
      const n = await importLocal(files)
      setMsg(n ? `已导入 ${n} 首` : '没有可用的音频文件')
    } catch (err) {
      setMsg('导入失败：' + (err?.message || '存储空间不足？'))
    } finally {
      setBusy(false)
    }
  }

  const Row = ({ id, title }) => (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="w-full h-[52px] flex items-center justify-between text-left text-base border-t border-line first:border-t-0"
    >
      <span className={current === id ? 'font-black' : 'font-medium'}>{title}</span>
      {current === id && <Check size={20} strokeWidth={3} className="text-ember" />}
    </button>
  )

  return (
    <Sheet title="背景声音" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Row id="" title="不放" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">我的音乐 · 只存在这台手机里</h3>
          {localTracks.map((t) => (
            <div key={t.id} className="flex items-center border-t border-line first:border-t-0">
              <button type="button" onClick={() => onSelect(t.id)} className="flex-1 min-w-0 h-[52px] flex items-center justify-between text-left text-base pr-2">
                <span className={`truncate ${current === t.id ? 'font-black' : 'font-medium'}`}>{t.title}</span>
                {current === t.id && <Check size={20} strokeWidth={3} className="text-ember flex-shrink-0" />}
              </button>
              <button
                type="button"
                aria-label={`删除 ${t.title}`}
                onClick={() => window.confirm(`从手机里删除「${t.title}」？`) && removeLocal(t.id)}
                className="w-11 h-11 flex items-center justify-center text-mute"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="w-full h-[52px] flex items-center gap-2 text-base font-bold text-ember border-t border-line disabled:opacity-50"
          >
            <Plus size={20} strokeWidth={3} />
            {busy ? '正在导入…' : '导入音乐文件'}
          </button>
          {msg && <p className="text-sm text-mute pb-1">{msg}</p>}
          <input ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.flac" multiple hidden onChange={onFiles} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">环境白噪声</h3>
          {ambientTracks.map((t) => (
            <Row key={t.id} id={t.id} title={t.title} />
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">古典乐 · 放完自动随机接下一首</h3>
          <Row id={classicalShuffle.id} title="随机连播（全部 20 首）" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">交响乐</h3>
          {classicalTracks
            .filter((t) => t.group === 'symphony')
            .map((t) => (
              <Row key={t.id} id={t.id} title={t.title} />
            ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">大提琴与小提琴</h3>
          {classicalTracks
            .filter((t) => t.group === 'strings')
            .map((t) => (
              <Row key={t.id} id={t.id} title={t.title} />
            ))}
        </div>
      </div>
    </Sheet>
  )
}
