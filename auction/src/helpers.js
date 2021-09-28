import {writable} from 'svelte/store'

export const state = writable({})

export const sharePrice = 100 * 1000
export const weekSeconds = 60 * 60 * 24 * 7

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}
