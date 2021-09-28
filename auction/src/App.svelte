<!-- @format -->
<script>
  import {onMount, setContext} from 'svelte'
  import {writable} from 'svelte/store'
  import {Contract} from 'etleneum'

  import Index from './Index.svelte'
  import {state} from './helpers'

  import * as toast from '../../common/toast'
  import Foot from '../../components/Footer.svelte'

  const CONTRACT = 'c2w3fm9zhaz'

  const contract = Contract(CONTRACT)
  setContext('contract', contract)

  const auctionsStore = writable({})
  setContext('auctions', auctionsStore)
  onMount(loadAuctions)

  var unsetCallListeners = []
  setContext('unset-call', callback => {
    unsetCallListeners.push(callback)
    return () =>
      unsetCallListeners.splice(unsetCallListeners.indexOf(callback), 1)
  })

  async function loadAuctions() {
    try {
      var auctions = await contract.state()
      if (Array.isArray(auctions)) {
        auctions = {}
      }
      auctionsStore.set(auctions)
    } catch (err) {
      toast.error(`Error loading contract: ${err}`)
    }
  }

  onMount(() => {
    return contract.stream(
      async id => {
        loadAuctions()

        let newCall = await contract.loadCall(id)

        if ($state.call === id) {
          for (let i = 0; i < unsetCallListeners.length; i++) {
            unsetCallListeners[i]()
          }

          switch (newCall.method) {
            case 'create_auction':
              // we've created a auction
              toast.success(`Your auction was created!`)
              break
            case 'place_bid':
              // we've placed a bid
              toast.success(`Bid placed!`)
              break
            case 'finish_auction':
              // we've finished auction
              toast.success('Auction finished!')
          }
        } else {
          switch (newCall.method) {
            case 'create_auction':
              // someone else has created a auction
              toast.success(`A auction was created!`)
              break
            case 'place_bid':
              // someone else has placed a bid
              toast.success(`Someone placed bid!`)
              break
            case 'finish_auction':
              // someone else finished auction
              toast.success('Someone finished auction!')
          }
        }
      },
      (id, errMessage) => {
        if ($state.call === id) {
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
    <h1>Simple Auction</h1>
    <p style="font-size:14px;">This auction contract will work only for users with Etleneum account. <br>
      <b>Previous bidder funds will be returned to his etleneum account balance. </b></p>
  </header>
  <main><Index /></main>
</main>
<Foot name="Simple Auction" contract={CONTRACT} />
