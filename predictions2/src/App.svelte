<!-- @format -->
<script>
  import {onMount, setContext} from 'svelte'
  import {writable} from 'svelte/store'
  import {Contract} from 'etleneum'

  import Index from './Index.svelte'
  import {state} from './helpers'

  import * as toast from '../../common/toast'
  import Foot from '../../components/Footer.svelte'

  const CONTRACT = 'c6o1c46quw'

  const contract = Contract(CONTRACT)
  setContext('contract', contract)

  const marketsStore = writable({})
  setContext('markets', marketsStore)
  onMount(loadMarkets)

  var unsetCallListeners = []
  setContext('unset-call', callback => {
    unsetCallListeners.push(callback)
    return () =>
      unsetCallListeners.splice(unsetCallListeners.indexOf(callback), 1)
  })

  async function loadMarkets() {
    try {
      var markets = await contract.state('.open')
      if (Array.isArray(markets)) {
        markets = {}
      }
      marketsStore.set(markets)
    } catch (err) {
      toast.error(`Error loading contract: ${err}`)
    }
  }

  onMount(() => {
    return contract.stream(
      async id => {
        loadMarkets()

        let newCall = await contract.loadCall(id)

        if ($state.call.id === id) {
          for (let i = 0; i < unsetCallListeners.length; i++) {
            unsetCallListeners[i]()
          }

          switch (newCall.method) {
            case 'create_market':
              // we've created a market
              toast.success(`Your market was created!`)
              break
            case 'exchange':
              // we've made an exchange
              toast.success(`Exchange made!`)
              break
            case 'resolve':
              // we've voted
              toast.success('Vote cast!')
          }
        } else {
          switch (newCall.method) {
            case 'create_market':
              // someone else has created a market
              toast.success(`A market was created!`)
              break
            case 'exchange':
              // someone else has made an exchange
              toast.success(`Someone exchanged shares!`)
              break
            case 'resolve':
              // someone else has voted
              toast.success('Someone voted on a resolution!')
          }
        }
      },
      (id, errMessage) => {
        if ($state.call.id === id) {
          toast.warning(`Your call failed: ${errMessage}`)
        } else {
          toast.warning(`A call from someone else failed: ${errMessage}`)
        }
      }
    )
  })
</script>

<main>
  <header>
    <h1>Predictions #2</h1>
  </header>
  <main><Index /></main>
</main>
<Foot name="Predictions 2" contract={CONTRACT} />
