import { useEffect, useState } from 'react'
import { useProjectStore } from './store/useProjectStore'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Timer from './pages/Timer'
import Feed from './pages/Feed'
import Stats from './pages/Stats'

export default function App() {
  const { init, loading } = useProjectStore()
  const [tab, setTab] = useState('home')
  const [preselectedProjectId, setPreselectedProjectId] = useState('')

  useEffect(() => {
    init()
  }, [init])

  const startTimerFor = (projectId) => {
    setPreselectedProjectId(projectId)
    setTab('timer')
  }

  if (loading) {
    return (
      <div className="w-full h-screen h-[100svh] flex flex-col items-center justify-center bg-forge-bg text-forge-light overflow-hidden">
        <div className="text-4xl animate-bounce mb-3">⚒️</div>
        <p className="text-[10px] text-forge-steel font-mono tracking-widest uppercase">正在烧热熔炉...</p>
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
    <div className="w-full h-screen h-[100svh] overflow-hidden flex flex-col bg-forge-bg text-forge-light relative select-none">
      <div className="flex-1 overflow-hidden flex flex-col">{renderPage()}</div>
      <BottomNav
        activeTab={tab}
        onTabChange={(next) => {
          if (next !== 'timer') setPreselectedProjectId('')
          setTab(next)
        }}
      />
    </div>
  )
}
