import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS 主屏应用：键盘收起、旋转屏幕后页面可能残留滚动偏移，导致画面和点击位置错开（按钮点不动）
// 每次这类事件后把页面复位到顶部
const resetViewport = () => {
  if (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop) {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}
const resetSoon = () => {
  resetViewport()
  setTimeout(resetViewport, 120)
  setTimeout(resetViewport, 400)
}
window.addEventListener('focusout', resetSoon)
window.addEventListener('orientationchange', resetSoon)
window.addEventListener('resize', resetSoon)
window.addEventListener('pageshow', resetSoon)
document.addEventListener('visibilitychange', resetSoon)
window.visualViewport?.addEventListener('resize', resetSoon)
window.addEventListener('scroll', resetViewport, { passive: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
