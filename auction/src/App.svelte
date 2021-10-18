<!-- @format -->
<script>
  import {onMount, setContext} from 'svelte'
  import {writable} from 'svelte/store'
  import {Contract} from 'etleneum'
  import account from '../../components/etleneumAccountStore'

  import Index from './Index.svelte'
  import {state, resetToggled} from './helpers'

  import * as toast from '../../common/toast'
  import Foot from '../../components/Footer.svelte'

  const CONTRACT = 'c2w3fm9zhaz'
  const ALIAS_CONTRACT = 'c8g2k1bzcb' 

  const contract = Contract(CONTRACT)
  const alias_contract = Contract(ALIAS_CONTRACT)

  setContext('contract', contract)
  setContext('alias_contract', alias_contract)

  const auctionsStore = writable({})
  const aliasesStore = writable({})

  setContext('auctions', auctionsStore)
  setContext('aliases', aliasesStore)

  onMount(loadAuctions)
  onMount(loadAliases)

  const EventSource = window.EventSource
  const ETLENEUM = window.etleneum || 'https://etleneum.com'
  var es

  var unsetCallListeners = []
  setContext('unset-call', callback => {
    unsetCallListeners.push(callback)
    return () =>
      unsetCallListeners.splice(unsetCallListeners.indexOf(callback), 1)
  })

  async function loadAuctions() {
    try {
      var yesterday_time = new Date()
          yesterday_time.setDate(yesterday_time.getDate() - 1)
      var yesterday_timestamp = Math.round(yesterday_time.getTime() / 1000)
      var auctions = await contract.state(`[. | to_entries[] | {"key": .key, "value": .value |  select(.end_datetime > ${yesterday_timestamp} )}] | from_entries`)
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
        if ($state.call.id === id) {
          for (let i = 0; i < unsetCallListeners.length; i++) {
            unsetCallListeners[i]()
          }

          switch (newCall.method) {
            case 'create_auction':
              // we've created a auction
              toast.success(`Your auction was created!`)
              break
            case 'deposit':
              // we've created a auction
              toast.success(`Your account balance was deposited!`)
              $account.refresh()
              balanceUpdate()
              break
            case 'place_bid':
              // we've placed a bid
              toast.success(`Bid placed!`)
              $account.refresh()
              balanceUpdate()
              break
            case 'finish_auction':
              toast.success('Auction finished!')
              $account.refresh()
              balanceUpdate()
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
              // when someone outbid our bid - this may cause balance
              $account.refresh()
              balanceUpdate()
              break
            case 'deposit':
              // someone else has placed a bid
              toast.success(`Someone made deposit!`)
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

    function balanceUpdate(){
      es = new EventSource(
        `${ETLENEUM}/~~~/session?src=etleneum-client&session=${$account.session}`
      )  
      es.addEventListener('auth', e => {
        let data = JSON.parse(e.data)
        account.id = data.account
        account.balance = data.balance

        if (es) {
          es.close()
        }
      })
    }
  })

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

 onMount(() => {
    return alias_contract.stream(
      async id => {
        loadAliases()

        let newCall = await alias_contract.loadCall(id)
        if ($state.call.id === id) {
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
        if ($state.call === id) {
          toast.warning(`Your call failed: ${errMessage}`)
        }
      }
    )
 })

</script>

<main>
  <header>
    <h1 on:click="{resetToggled}">Simple Auction</h1>
    <div class="right_header_part">
      {#if $account.id}
      <div>
        Your <a href="https://etleneum.com/#/account">Etleneum account</a> balance: {$account.balance / 1000} sat 
      </div>
      <hr>
      {/if}
      <p>
        This contract cannot ensure or coordinate the delivery of goods that
        must be arranged off-contract. Make sure to know what and from whom
        you're buying before bidding.
      </p>
    </div>
  </header>
  <main><Index /></main>
</main>
<Foot name="Simple Auction" contract={CONTRACT} />

<style>
  header {
    display: flex;
    align-items: center;
    color: var(--color-main);
  }

  @media (max-width: 992px) {
    header{
      flex-flow: column;
    }
  }

  h1 {
    cursor: pointer;
    margin-right: 20px;
    min-width: 40%;
  }
  .right_header_part > * {
    width:100%;
  }
  .right_header_part p{
    font-size: 14px;
  }
</style>
