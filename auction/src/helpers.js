import {writable} from 'svelte/store'

export const state = writable({})

export function truncate(str, n) {
  return str.length > n ? str.substr(0, n) + '...' + str.substr(-n) : str
}

export function splitAuctionItem(auction_item) {
  let [title, details = ''] = auction_item.split('\n---\n')
  let images = pullImagesUrls(details)
  images.forEach(function(image){
    details = details.replace(image,'')
  })
  return {title, details, images}
}

export function joinAuctionItem(title, details) {
  return [title, details].join('\n---\n')
}

export function resetToggled(){
    setTimeout(() => {
      let auctionDetails = document.querySelectorAll('details')
      for (let i = 0; i < auctionDetails.length; i++) {
        if(auctionDetails[i].open){ auctionDetails[i].open = false }
        auctionDetails[i].style.display = 'block'
        create_auction_wrapper.style.display = 'block'
      }
      location.hash = ''
    }, 10)
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