<script>
  import {onMount, setContext} from 'svelte'
  import {writable} from 'svelte/store'
  import {Contract} from 'etleneum'

  import Index from './Index.svelte'
  import {state} from './helpers'

  import * as toast from '../../common/toast'
  import Foot from '../../components/Footer.svelte'

  const CONTRACT = 'cjc1jv1gex4'

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
      var markets = await contract.state()
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
    <h1>
      <a href="#/">Simple Predictions</a>
    </h1>
    <p>Prediction markets with automated market makers.</p>
  </header>
  <main><Index /></main>
</main>
<Foot name="Simple Predictions" contract={CONTRACT} />

<style>
  :global(body) {
    max-width: 200vw;
  }
  main {
    margin: 50px auto;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  header > h1 {
    flex-grow: 99999999;
    font-size: 4rem;
  }
  header > h1 a {
    text-decoration: none;
    color: var(--emphasis);
  }
  header > p {
    flex-shrink: 99999999;
    margin-left: 23px;
  }
</style>
