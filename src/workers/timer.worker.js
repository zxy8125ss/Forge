// 后台计时：页面被节流时 Worker 仍按秒发 tick
let interval = null

self.onmessage = (e) => {
  if (e.data === 'start') {
    if (interval) clearInterval(interval)
    interval = setInterval(() => self.postMessage('tick'), 1000)
  } else if (e.data === 'stop') {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }
}
