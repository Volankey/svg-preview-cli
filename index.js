#!/usr/bin/env node
const { spawn } = require('child_process')
const path = require('path')

console.log(path.resolve('./vite.config.ts'))
const ls = spawn(
  'npx',
  ['esno', './run.ts', path.resolve('./vite.config.ts')],
  {
    cwd: __dirname,
  },
)

ls.stdout.on('data', (data) => {
  console.log(data.toString())
})

ls.stderr.on('data', (data) => {
  console.log(data.toString())
})
