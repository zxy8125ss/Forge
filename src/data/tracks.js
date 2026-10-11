// 声音素材
// 环境白噪声：单曲循环
// 交响乐：10 首公有领域录音（来源见 public/music/CREDITS.md），随机连播

export const AMBIENT_TRACKS = [
  { id: 'forge-fire', title: '炉火', file: 'fire.wav' },
  { id: 'forge-wind', title: '风声', file: 'wind.wav' },
  { id: 'forge-rain', title: '雨声', file: 'rain.wav' },
]

export const CLASSICAL_TRACKS = [
  { id: 'beethoven-9-4', title: '贝多芬 · 第九交响曲「合唱」第四乐章', file: 'music/beethoven-9-4.mp3' },
  { id: 'beethoven-eroica-1', title: '贝多芬 · 第三交响曲「英雄」第一乐章', file: 'music/beethoven-eroica-1.mp3' },
  { id: 'beethoven-egmont', title: '贝多芬 · 《埃格蒙特》序曲', file: 'music/beethoven-egmont.mp3' },
  { id: 'mozart-40-1', title: '莫扎特 · 第 40 号交响曲 第一乐章', file: 'music/mozart-40-1.mp3' },
  { id: 'mozart-figaro', title: '莫扎特 · 《费加罗的婚礼》序曲', file: 'music/mozart-figaro.mp3' },
  { id: 'tchaikovsky-pathetique-1', title: '柴可夫斯基 · 第六交响曲「悲怆」第一乐章', file: 'music/tchaikovsky-pathetique-1.mp3' },
  { id: 'brahms-1-4', title: '勃拉姆斯 · 第一交响曲 第四乐章', file: 'music/brahms-1-4.mp3' },
  { id: 'brahms-3-3', title: '勃拉姆斯 · 第三交响曲 第三乐章', file: 'music/brahms-3-3.mp3' },
  { id: 'smetana-vltava', title: '斯美塔那 · 《伏尔塔瓦河》', file: 'music/smetana-vltava.mp3' },
  { id: 'mendelssohn-italian-1', title: '门德尔松 · 第四交响曲「意大利」第一乐章', file: 'music/mendelssohn-italian-1.mp3' },
]

// 选择器里的"随机连播"
export const CLASSICAL_SHUFFLE = { id: 'classical-shuffle', title: '交响乐随机连播' }
