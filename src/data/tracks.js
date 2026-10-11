// 声音素材
// 环境声：真实录音（荷兰 Beeld en Geluid 声音档案，CC BY-SA 3.0），截 4 分钟做成首尾无缝循环
// 古典乐：20 首公有领域 / CC 授权录音（来源见 public/music/CREDITS.md），分交响乐、大提琴与小提琴两组，随机连播

export const AMBIENT_TRACKS = [
  { id: 'forge-fire', title: '壁炉柴火', file: 'ambient/fire.mp3' },
  { id: 'forge-rain', title: '雨打屋檐', file: 'ambient/rain-roof.mp3' },
  { id: 'amb-thunder', title: '雷雨', file: 'ambient/thunder.mp3' },
  { id: 'amb-stream', title: '林间溪流', file: 'ambient/stream.mp3' },
  { id: 'amb-waves', title: '海浪', file: 'ambient/waves.mp3' },
  { id: 'forge-wind', title: '风声', file: 'ambient/wind.mp3' },
  { id: 'amb-birds', title: '林中鸟鸣', file: 'ambient/birds.mp3' },
  { id: 'amb-crickets', title: '夏夜虫鸣', file: 'ambient/crickets.mp3' },
]

export const CLASSICAL_TRACKS = [
  { id: 'beethoven-9-4', title: '贝多芬 · 第九交响曲「合唱」第四乐章', group: 'symphony', file: 'music/beethoven-9-4.mp3' },
  { id: 'beethoven-eroica-1', title: '贝多芬 · 第三交响曲「英雄」第一乐章', group: 'symphony', file: 'music/beethoven-eroica-1.mp3' },
  { id: 'beethoven-egmont', title: '贝多芬 · 《埃格蒙特》序曲', group: 'symphony', file: 'music/beethoven-egmont.mp3' },
  { id: 'mozart-40-1', title: '莫扎特 · 第 40 号交响曲 第一乐章', group: 'symphony', file: 'music/mozart-40-1.mp3' },
  { id: 'mozart-figaro', title: '莫扎特 · 《费加罗的婚礼》序曲', group: 'symphony', file: 'music/mozart-figaro.mp3' },
  { id: 'tchaikovsky-pathetique-1', title: '柴可夫斯基 · 第六交响曲「悲怆」第一乐章', group: 'symphony', file: 'music/tchaikovsky-pathetique-1.mp3' },
  { id: 'brahms-1-4', title: '勃拉姆斯 · 第一交响曲 第四乐章', group: 'symphony', file: 'music/brahms-1-4.mp3' },
  { id: 'brahms-3-3', title: '勃拉姆斯 · 第三交响曲 第三乐章', group: 'symphony', file: 'music/brahms-3-3.mp3' },
  { id: 'smetana-vltava', title: '斯美塔那 · 《伏尔塔瓦河》', group: 'symphony', file: 'music/smetana-vltava.mp3' },
  { id: 'mendelssohn-italian-1', title: '门德尔松 · 第四交响曲「意大利」第一乐章', group: 'symphony', file: 'music/mendelssohn-italian-1.mp3' },
  { id: 'dvorak-newworld-2', title: '德沃夏克 · 第九交响曲「自新大陆」第二乐章（思乡曲）', group: 'symphony', file: 'music/dvorak-newworld-2.mp3' },
  { id: 'dvorak-newworld-4', title: '德沃夏克 · 第九交响曲「自新大陆」第四乐章', group: 'symphony', file: 'music/dvorak-newworld-4.mp3' },
  { id: 'bach-cellosuite-1', title: '巴赫 · G 大调第一大提琴组曲 前奏曲', group: 'strings', file: 'music/bach-cellosuite-1.mp3' },
  { id: 'dvorak-cello-1', title: '德沃夏克 · b 小调大提琴协奏曲 第一乐章（富尼埃）', group: 'strings', file: 'music/dvorak-cello-1.mp3' },
  { id: 'elgar-cello-4', title: '埃尔加 · e 小调大提琴协奏曲 第四乐章', group: 'strings', file: 'music/elgar-cello-4.mp3' },
  { id: 'saintsaens-cello-1', title: '圣桑 · 第一大提琴协奏曲 第一乐章', group: 'strings', file: 'music/saintsaens-cello-1.mp3' },
  { id: 'bach-chaconne', title: '巴赫 · d 小调恰空（海菲兹，小提琴）', group: 'strings', file: 'music/bach-chaconne.mp3' },
  { id: 'saintsaens-rondo', title: '圣桑 · 引子与回旋随想曲（小提琴）', group: 'strings', file: 'music/saintsaens-rondo.mp3' },
  { id: 'vivaldi-spring-1', title: '维瓦尔第 · 《四季·春》第一乐章', group: 'strings', file: 'music/vivaldi-spring-1.mp3' },
  { id: 'vivaldi-winter-1', title: '维瓦尔第 · 《四季·冬》第一乐章', group: 'strings', file: 'music/vivaldi-winter-1.mp3' },
]

// 选择器里的"随机连播"
export const CLASSICAL_SHUFFLE = { id: 'classical-shuffle', title: '古典乐随机连播（全部 20 首）' }
