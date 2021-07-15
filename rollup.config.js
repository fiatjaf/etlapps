import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import css from 'rollup-plugin-css-only'

const production = !!process.env.PRODUCTION

const bundleEntry = appName => ({
  input: `${appName}/src/main.js`,
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: `${appName}/static/bundle.js`
  },
  plugins: [
    svelte({
      compilerOptions: {dev: !production}
    }),

    resolve({
      browser: true,
      dedupe: importee =>
        importee === 'svelte' || importee.startsWith('svelte/'),
      preferBuiltins: false
    }),

    commonjs(),

    css({output: 'bundle.css'}),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
})

export default process.env.APPNAME
  ? bundleEntry(process.env.APPNAME)
  : [
      'banners',
      'chainmarket',
      'smt',
      'features',
      'lichess',
      's4a',
      'kad',
      'predictions',
      'predictions2'
    ].map(bundleEntry)
