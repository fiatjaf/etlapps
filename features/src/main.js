/** @format */

import App from './App.svelte'

if (location.hash.length > 2 || location.hash.slice(0, 2) === '#/') {
  location.href = '/' + location.hash.slice(2)
}

const app = new App({
  target: document.getElementById('app')
})

export default app
