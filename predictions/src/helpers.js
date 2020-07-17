import {writable} from 'svelte/store'

export const state = writable({})

export const sharePrice = 10 * 1000

export function calcBalance(liquidity, yesShares, noShares) {
  return Math.ceil(
    liquidity *
      Math.log(
        Math.exp(yesShares / liquidity) + Math.exp(noShares / liquidity)
      ) *
      sharePrice
  )
}

export function countShares(market, side) {
  var count = 0
  for (let acct in market.shares[side]) {
    count += market.shares[side][acct]
  }
  return count
}

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

export function marketImpliedProbability(market, side) {
  let thisShares = countShares(market, side)
  let otherShares = countShares(market, side === 'yes' ? 'no' : 'yes')
  let prob =
    Math.exp(thisShares / market.liquidity) /
    (Math.exp(thisShares / market.liquidity) +
      Math.exp(otherShares / market.liquidity))
  return parseInt(prob * 100)
}
