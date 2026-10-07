// 把构建产物 dist/ 复制到 docs/，GitHub Pages 从 main 分支的 /docs 发布
import { cpSync, rmSync, writeFileSync, existsSync } from 'node:fs'

if (!existsSync('dist/index.html')) {
  console.error('dist/ 不存在，先运行 npm run build')
  process.exit(1)
}
rmSync('docs', { recursive: true, force: true })
cpSync('dist', 'docs', { recursive: true })
writeFileSync('docs/.nojekyll', '')
console.log('已更新 docs/，提交并推送后 GitHub Pages 会自动发布')
