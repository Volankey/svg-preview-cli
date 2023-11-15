import { simpleGit } from 'simple-git'
import fs from 'fs'
import path from 'path'
import { execSync, spawn } from 'child_process'

const repo = 'https://github.com/Volankey/vite-svg-resource-preview.git'

const git = simpleGit()

async function main() {
  const args = process.argv.slice(2)
  const configPath = path.join(args[0])

  console.log('vite config: ', configPath)
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
    shell: true,
    env: { ...process.env, FORCE_COLOR: true }
  })
  // run vite build
  console.log('base',base)
  const ls = spawn('npx', ['vite', 'build', '-c', path.resolve(__dirname, './vite.config.ts')], {
    cwd: base,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: true }
  })
  ls.on('exit', () => {
    execSync('npx vite dev', {
      cwd: feDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FORCE_COLOR: true }
    })
  })
}
main()
