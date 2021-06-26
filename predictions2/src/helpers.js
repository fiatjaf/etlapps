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

function rawProbability(market, side) {
  let thisShares = countShares(market, side)
  let otherShares = countShares(market, side === 'yes' ? 'no' : 'yes')
  let totalShares = thisShares + otherShares
  let b = market.factor * totalShares
  let expThis = Math.exp(thisShares / b)
  let expOther = Math.exp(otherShares / b)
  let expSum = expThis + expOther
  let productSum = thisShares * expThis + otherShares * expOther
  return (
    b * Math.log(expSum) +
    (totalShares * expThis - productSum) / (totalShares * expSum)
  )
}

export function marketImpliedProbability(market, side) {
  let prob = rawProbability(market, side)
  let pain = prob + rawProbability(market, side === 'yes' ? 'no' : 'yes') - 1
  let displayProb = prob - pain / 2
  return Math.round(displayProb * 100)
}
