import {writable} from 'svelte/store'

export const state = writable({})

export function truncate(str, n) {
  return str.length > n ? str.substr(0, n) + '...' + str.substr(-n) : str
}

export function splitAuctionItem(auction_item) {
  const [title, details = ''] = auction_item.split('\n---\n')
  return {title, details}
}

export function joinAuctionItem(title, details) {
  return [title, details].join('\n---\n')
}
