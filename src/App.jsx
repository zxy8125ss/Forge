import { useEffect, useState } from 'react'
import { useProjectStore } from './store/useProjectStore'
import { useTimerStore } from './store/useTimerStore'
import BottomNav from './components/BottomNav'
import ForgeMark from './components/ForgeMark'
import Home from './pages/Home'
import Timer from './pages/Timer'
import Feed from './pages/Feed'
import Stats from './pages/Stats'

export default function App() {
  const { init, loading } = useProjectStore()
  const [tab, setTab] = useState('home')
  const [preselectedProjectId, setPreselectedProjectId] = useState('')
  const timerActive = useTimerStore((s) => s.running)

  useEffect(() => {
    init()
  }, [init])

  const startTimerFor = (projectId) => {
    setPreselectedProjectId(projectId)
    setTab('timer')
  }

  if (loading) {
    return (
      <div className="w-full h-[100svh] flex flex-col items-center justify-center gap-4 bg-paper">
        <ForgeMark className="w-16 h-16" />
        <p className="text-sm font-bold text-mute">正在烧热熔炉…</p>
      </div>
    )
  }

  const renderPage = () => {
    switch (tab) {
      case 'timer':
        return <Timer preselectedProjectId={preselectedProjectId} onNavigateToFeed={() => setTab('feed')} />
      case 'feed':
        return <Feed />
      case 'stats':
        return <Stats />
      case 'home':
      default:
        return <Home onStartTimer={startTimerFor} />
    }
  }

  return (
    <div className="w-full h-full flex-1 overflow-hidden flex flex-col bg-paper text-ink select-none">
      <main className="flex-1 overflow-hidden flex flex-col">{renderPage()}</main>
      {!(tab === 'timer' && timerActive) && (
        <BottomNav
          activeTab={tab}
          onTabChange={(next) => {
            if (next !== 'timer') setPreselectedProjectId('')
            setTab(next)
          }}
        />
      )}
    </div>
  )
}
