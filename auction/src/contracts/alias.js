  import {onMount, setContext, getContext} from 'svelte'
  import {state} from '../helpers'
  import {Contract} from 'etleneum'
  import {writable, get} from 'svelte/store'
  import * as toast from '../../../common/toast'

  import { ALIAS_CONTRACT } from '../constants/contracts'

  export default function initAliasContract(unsetCallListeners){

  const currentState = get(state)
  const alias_contract = Contract(ALIAS_CONTRACT)
  setContext('alias_contract', alias_contract)
  const aliasesStore = writable({})
  setContext('aliases', aliasesStore)

  async function loadAliases() {
    try {
      var aliases = await alias_contract.state() // .state(`.["${$account.id}"]`)
      if (Array.isArray(aliases)) {
        aliases = {}
      }
      aliasesStore.set(aliases)
    } catch (err) {
      toast.error(`Error loading contract: ${err}`)
    }
  }

  // get aliases on app load. 
  onMount(loadAliases)

  // Listen alias contract stream.
  onMount(() => {
    return alias_contract.stream(
      async id => {
        loadAliases()

        let newCall = await alias_contract.loadCall(id)
        if (currentState.call.id === id) {
          for (let i = 0; i < unsetCallListeners.length; i++) {
            unsetCallListeners[i]()
          }

          switch (newCall.method) {
            case 'add':
              toast.success(`Your alias was added!`)
              break
            case 'delete':
              toast.success(`Alias removed!`)
              break
          }
        }
      },
      (id, errMessage) => {
        if (currentState.call === id) {
          toast.warning(`Your call failed: ${errMessage}`)
        }
      }
    )
  })
}