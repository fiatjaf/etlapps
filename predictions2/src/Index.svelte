<!-- @format -->
<script>
  import {getContext} from 'svelte'

  import Create from './Create.svelte'
  import Market from './Market.svelte'
  import MarketSummary from './MarketSummary.svelte'

  import account from '../../components/etleneumAccountStore'
  import Auth from '../../components/Auth.svelte'

  const marketsStore = getContext('markets')

  var marketList = []
  marketsStore.subscribe(markets => {
    marketList = Object.keys(markets)
      .map(id => ({id, ...markets[id]}))
      .sort((a, b) => a.date - b.date)
  })

  function marketAppeared(element, id) {
    let hash = location.hash.slice(1)
    let [_, selected] = hash.split('-')
    if (id === selected) element.open = true
  }

  let toggling = false
  function marketToggled(element, id) {
    if (toggling) return

    if (element.open) {
      location.hash = `market-${id}`

      // close all others
      toggling = true
      let marketDetails = document.querySelectorAll('details.market')
      for (let i = 0; i < marketDetails.length; i++) {
        let d = marketDetails[i]
        if (d === element) continue
        d.open = false
      }
      toggling = false
    } else {
      // clear the hash if none other is open
      setTimeout(() => {
        let marketDetails = document.querySelectorAll('details.market')
        for (let i = 0; i < marketDetails.length; i++) {
          if (marketDetails[i].open) return
        }
        location.hash = ''
      }, 10)
    }
  }
</script>

<main>
  {#each marketList as market (market.id)}
    <details
      id={`market-${market.id}`}
      class="market"
      in:marketAppeared={market.id}
      on:toggle={ev => marketToggled(ev.target, market.id)}
    >
      <summary>
        <MarketSummary {market} />
      </summary>
      <Market {market} />
    </details>
  {:else}
    <p>No markets open right now.</p>
  {/each}
  <hr />
  <details>
    <summary> Open a new market </summary>
    <Create />
  </details>

  {#if $account.id}
    <center><Auth /></center>
  {/if}
</main>

<style>
  details summary {
    cursor: pointer;
  }

  details.market summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
