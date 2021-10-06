<!-- @format -->
<script>
  import {getContext} from 'svelte'

  import Create from './Create.svelte'
  import Topup from './Topup.svelte'
  import Auction from './Auction.svelte'
  import AuctionSummary from './AuctionSummary.svelte'

  import account from '../../components/etleneumAccountStore'
  import Auth from '../../components/Auth.svelte'

  const auctionsStore = getContext('auctions')

  var auctionList = []
  auctionsStore.subscribe(auctions => {
    auctionList = Object.keys(auctions)
      .map(id => ({id, ...auctions[id]}))
      .filter(({end_datetime}) => (end_datetime + 86400) * 1000 > Date.now())
      .sort((a, b) => a.end_datetime - b.end_datetime)
  })

  function auctionAppeared(element, id) {
    let hash = location.hash.slice(1)
    let [_, selected] = hash.split('-')
    if (id === selected) element.open = true
  }

  let toggling = false
  function auctionToggled(element, id) {
    if (toggling) return

    if (element.open) {
      location.hash = `auction-${id}`

      // close all others
      toggling = true
      let auctionDetails = document.querySelectorAll('details.auction')
      for (let i = 0; i < auctionDetails.length; i++) {
        let d = auctionDetails[i]
        if (d === element) continue
        d.open = false
      }
      toggling = false
    } else {
      // clear the hash if none other is open
      setTimeout(() => {
        let auctionDetails = document.querySelectorAll('details.auction')
        for (let i = 0; i < auctionDetails.length; i++) {
          if (auctionDetails[i].open) return
        }
        location.hash = ''
      }, 10)
    }
  }
</script>

  {#each auctionList as auction (auction.id)}
    <details
      id={`auction-${auction.id}`}
      class="auction"
      in:auctionAppeared={auction.id}
      on:toggle={ev => auctionToggled(ev.target, auction.id)}
    >
      <summary>
        <AuctionSummary {auction} />
      </summary>
      <Auction {auction} />
    </details>
  {:else}
    <p>No active auctions right now.</p>
  {/each}
  <hr />
  <details>
    <summary> Create a new auction </summary>
    <Create />
  </details>
  <details>
    <summary> Top-up account balance </summary>
    <Topup />
  </details>


  {#if $account.id}
    <center><Auth /></center>
  {/if}

<style>
  details,
  summary {
    background-color: var(--background-secondary);
    color: var(--color-secondary);
  }

  details summary {
    cursor: pointer;
  }

  details.auction summary {
    display: flex;
    justify-content: space-between;
    align-items: start;
  }
  @media (max-width: 992px) {
    details.auction summary {
      flex-flow: column;
    }
  } 
</style>
