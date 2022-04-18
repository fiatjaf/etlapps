import {writable} from 'svelte/store'

export const state = writable({})

export function truncate(str = '', n) {
  return str.length > n ? str.substr(0, n) + '...' + str.substr(-n) : str
}

export function splitAuctionItem(auction_item) {
  let clear_auction_item = auction_item.toString().replace( /(<([^>]+)>)/ig, '')
  let [title, details = ''] = clear_auction_item.split('\n---\n')
  let images = pullImagesUrls(details)
  images.forEach(function(image){
    details = details.replace(image,'')
  })
  let links = parseUrls(details)
  links.forEach(function(link){
    details = details.replace(link,`<a href="${link}" target="_blank" rel="nofollow noopener">${link}</a>`)
  })
  return {title, details, images}
}

export function joinAuctionItem(title, details) {
  return [title, details].join('\n---\n')
}

function pullImagesUrls(string) {
  const img_src_regex = /https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpg|gif|png|jpeg|svg)/g
  let m
  let images_array = []
  while ((m = img_src_regex.exec(string)) !== null) {
      if (m.index === img_src_regex.lastIndex) {
          img_src_regex.lastIndex++;
      }
      m.forEach((match, groupIndex) => {
          images_array.push(match)
      });
  }
  return images_array
}

function parseUrls(string){
  const link_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g
  let m
  let links_array = []
  while ((m = link_regex.exec(string)) !== null) {
      if (m.index === link_regex.lastIndex) {
          link_regex.lastIndex++;
      }
      links_array.push(m[0])
      /* m.forEach((match, groupIndex) => {
          links_array.push(match)
      });*/
  }
  return links_array
}