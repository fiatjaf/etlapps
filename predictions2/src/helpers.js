import {writable} from 'svelte/store'

export const state = writable({})

export const sharePrice = 100 * 1000

export function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

export function countShares(market, side) {
  var count = 0
  for (let acct in market.shares[side]) {
    count += market.shares[side][acct]
  }
  return count
}

export function calcBalance(factor, yesShares, noShares) {
  let b = factor * (yesShares + noShares)
  return Math.ceil(
    b * Math.log(Math.exp(yesShares / b) + Math.exp(noShares / b)) * sharePrice
  )
}

export function marketImpliedProbability(market, side) {
  let thisShares = countShares(market, side)
  let otherShares = countShares(market, side === 'yes' ? 'no' : 'yes')
  let totalShares = thisShares + otherShares
  let b = factor * totalShares
  let expThis = Math.exp(thisShares / b)
  let expOther = Math.exp(otherShares / b)
  let expSum = expThis + expOther
  let productSum = thisShares * expThis + otherShares * expOther
  let prob =
    b * Math.log(expSum) +
    (totalShares * expThis - productSum) / (totalShares * expSum)
  return Math.round(prob * 100)
}
