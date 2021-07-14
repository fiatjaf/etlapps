/** @format */

import {readable} from 'svelte/store'
import flatten from 'flatten'
import {Contract, Account} from 'etleneum'

import * as toast from '../../common/toast'
import {CONTRACT} from './constants'

const s4aContract = Contract(CONTRACT)
const kadContract = Contract('cog4wt7q8n3')

export const s4a = readable(
  {
    lastUnanswered: [],
    lastAnswers: [],
    byAsker: {},
    byTarget: {},
    byId: {}
  },
  set => {
    let reload = loads4a.bind(null, set)
    reload()
    return s4aContract.stream(reload)
  }
)

s4a.prepareCall = s4aContract.prepareCall
s4a.stream = s4aContract.stream

async function loads4a(set) {
  try {
    let state = await s4aContract.state()
    delete state._
    let flat = flatten(
      Object.keys(state).map(target =>
        Object.keys(state[target]).map(id => ({
          ...state[target][id],
          id,
          target,
          bounty: Object.keys(state[target][id].funds).reduce(
            (total, asker) => total + state[target][id].funds[asker],
            0
          )
        }))
      )
    ).sort((qa, qb) => qb.asked - qa.asked)

    var byTarget = {}
    var byAsker = {}
    var byId = {}

    for (let i = 0; i < flat.length; i++) {
      let q = flat[i]
      byId[q.id] = q
      byTarget[q.target] = byTarget[q.target] || []
      byTarget[q.target].push(q.id)
      for (let asker in q.funds) {
        byAsker[asker] = byAsker[asker] || []
        byAsker[asker].push(q.id)
      }
    }

    set({
      lastUnanswered: flat.filter(q => !q.answer).map(q => q.id),
      lastAnswers: flat
        .filter(q => q.answer)
        .sort((qa, qb) => qb.answered - qa.answered)
        .map(q => q.id),
      byAsker,
      byTarget,
      byId
    })
  } catch (err) {
    toast.error(`Failed to get contract: ${err}`)
  }
}

export const etleneumAccount = Account()
export const account = readable(etleneumAccount, etleneumAccount.subscribe)

export const kad = readable(
  {
    idFromKb: {},
    kbFromId: {}
  },
  async set => {
    let reload = loadkad.bind(null, set)
    reload()
    return kadContract.stream(reload)
  }
)

async function loadkad(set) {
  let state = await kadContract.state()
  delete state.identities._
  var kbFromId = {}
  for (let kb in state.identities) {
    kbFromId[state.identities[kb]] = kb
  }
  set({
    idFromKb: state.identities,
    kbFromId
  })
}
