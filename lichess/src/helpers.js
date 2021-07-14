import shajs from 'sha.js'
import {writable} from 'svelte/store'

export const state = writable({})

export function sha256(v) {
  return shajs('sha256').update(v).digest('hex')
}

export function getBaseSecret() {
  var baseSecret = localStorage.getItem('secret')
  if (!baseSecret) {
    baseSecret = parseInt(Math.random() * 99999999)
    localStorage.setItem('secret', baseSecret)
  }
  return baseSecret
}

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}
