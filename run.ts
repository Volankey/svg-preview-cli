import { simpleGit } from 'simple-git'
import fs from 'fs'
import path from 'path'
import { execSync, spawn } from 'child_process'

const repo = 'git@github.com:Volankey/vite-svg-resource-preview.git'

const git = simpleGit()

async function main() {
  if (fs.existsSync('./findSvg')) {
    fs.rmSync('./findSvg', { recursive: true })
  }
  await git.clone(repo, './findSvg', {
    '--depth': 1,
  })

  const args = process.argv.slice(2)
  console.log('args', args)
  const configPath = path.join(args[0])

  console.log('configPath', configPath)

  fs.writeFileSync(
    './vite.config.ts',
    `import { mergeConfig, defineConfig } from 'vite'
import projectViteConfig from '${configPath}'
import findSvgPlugin from './findSvg/findSvgPlugin'

export default defineConfig((ops) => {
  return mergeConfig(projectViteConfig(ops), {
    plugins: [findSvgPlugin()],
  })
})
`,
    'utf-8',
  )
  // run vite build
  console.log(path.join(__dirname, '..'))
  const ls = spawn('npx', ['vite', 'build', '-c', './svg/vite.config.ts'], {
    cwd: path.join(__dirname, '..'),
  })
  ls.stdout.on('data', (data) => {
    console.log(`[find svg]: ${data}`)
  })
  ls.stderr.on('data', (data) => {
    console.error(`[find svg]: ${data}`)
  })
  ls.on('exit', () => {
    execSync('npx vite dev', {
      cwd: path.join(__dirname, './findSvg'),
      stdio: 'inherit',
    })
  })
}
main()
