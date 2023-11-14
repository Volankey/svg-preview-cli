import { simpleGit } from 'simple-git'
import fs from 'fs'
import path from 'path'
import { execSync, spawn } from 'child_process'

const repo = 'git@github.com:Volankey/vite-svg-resource-preview.git'

const git = simpleGit()

async function main() {
  const args = process.argv.slice(2)
  console.log('args', args)
  const configPath = path.join(args[0])

  console.log('configPath', configPath)
  const base = path.dirname(configPath)
  const feDir = path.join(base, '.find-svg')
  if (fs.existsSync(feDir)) {
    fs.rmSync(feDir, { recursive: true })
  }
  await git.clone(repo, feDir, {
    '--depth': 1,
  })



  fs.writeFileSync(
    './vite.config.ts',
    `import { mergeConfig, defineConfig } from 'vite'
import projectViteConfig from '${configPath}'
import findSvgPlugin from '${feDir}/findSvgPlugin'

export default defineConfig((ops) => {
  return mergeConfig(projectViteConfig(ops), {
    plugins: [findSvgPlugin()],
  })
})
`,
    'utf-8',
  )
  // exec
  execSync('pnpm i',{
    cwd: feDir,
    stdio: 'inherit',
  })
  // run vite build
  console.log('base',base)
  const ls = spawn('npx', ['vite', 'build', '-c', path.resolve(__dirname, './vite.config.ts')], {
    cwd: base,
  })
  ls.stdout.on('data', (data) => {
    console.log(`[find svg]: ${data}`)
  })
  ls.stderr.on('data', (data) => {
    console.error(`[find svg]: ${data}`)
  })
  ls.on('exit', () => {
    execSync('npx vite dev', {
      cwd: feDir,
      stdio: 'inherit',
    })
  })
}
main()
