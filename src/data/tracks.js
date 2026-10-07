// 声音素材
// 环境白噪声：单曲循环
// 古典乐：10 首公有领域 / CC0 录音（来源见 public/music/CREDITS.md），随机连播

export const AMBIENT_TRACKS = [
  { id: 'forge-fire', title: '炉火', file: 'fire.wav' },
  { id: 'forge-wind', title: '风声', file: 'wind.wav' },
  { id: 'forge-rain', title: '雨声', file: 'rain.wav' },
]

export const CLASSICAL_TRACKS = [
  { id: 'satie-gymnopedie-1', title: '萨蒂 · 裸体舞曲 No.1（吉他）', file: 'music/satie-gymnopedie-1.mp3' },
  { id: 'bach-prelude-c', title: '巴赫 · C大调前奏曲 BWV 846', file: 'music/bach-prelude-c.mp3' },
  { id: 'bach-goldberg-aria', title: '巴赫 · 哥德堡变奏曲 咏叹调', file: 'music/bach-goldberg-aria.mp3' },
  { id: 'bach-air', title: '巴赫 · G弦上的咏叹调', file: 'music/bach-air.mp3' },
  { id: 'chopin-nocturne-op9-2', title: '肖邦 · 夜曲 Op.9 No.2', file: 'music/chopin-nocturne-op9-2.mp3' },
  { id: 'chopin-nocturne-op32-2', title: '肖邦 · 夜曲 Op.32 No.2', file: 'music/chopin-nocturne-op32-2.mp3' },
  { id: 'chopin-nocturne-op55-2', title: '肖邦 · 夜曲 Op.55 No.2', file: 'music/chopin-nocturne-op55-2.mp3' },
  { id: 'chopin-nocturne-op62-2', title: '肖邦 · 夜曲 Op.62 No.2', file: 'music/chopin-nocturne-op62-2.mp3' },
  { id: 'schubert-d784-andante', title: '舒伯特 · a小调奏鸣曲 D784 行板', file: 'music/schubert-d784-andante.mp3' },
  { id: 'debussy-terrasse', title: '德彪西 · 月光照拂的露台', file: 'music/debussy-terrasse.mp3' },
]

// 选择器里的"古典乐随机连播"
export const CLASSICAL_SHUFFLE = { id: 'classical-shuffle', title: '古典乐随机连播' }
