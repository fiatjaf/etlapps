<script>
  import {onMount, getContext} from 'svelte'

  import Create from './Create.svelte'
  import Market from './Market.svelte'
  import {countShares, marketImpliedProbability} from './helpers'

  import account from '../../components/etleneumAccountStore'
  import Auth from '../../components/Auth.svelte'

  var marketOpen = null
  var createOpen = null

  const marketsStore = getContext('markets')

  onMount(() => {
    let hash = location.hash.slice(1)
    if (hash === '/create') {
      openCreate()
    } else if (hash.split('/')[1] === 'market') {
      let id = hash.split('/')[2]
      openMarket(id)()
    }
  })

  var marketList = []
  marketsStore.subscribe(markets => {
    marketList = Object.keys(markets)
      .map(id => ({id, ...markets[id]}))
      .filter(({terms}) => terms.length > 20)
      .sort((a, b) => score(b) - score(a))
  })

  function score(market) {
    return (
      Object.keys(market.votes).length * 100 +
      market.nexchanges +
      Math.log(
        -1 * ((market.lastexchange || 0) - new Date().getTime() / 1000)
      ) +
      countShares(market, 'yes') +
      countShares(market, 'no')
    )
  }

  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      createOpen = null
    })
  })

  function openMarket(marketId) {
    return e => {
      e && e.preventDefault()
      marketOpen = marketId
      createOpen = null
      location.hash = '#/market/' + marketId
    }
  }

  function openCreate(e) {
    e && e.preventDefault()
    createOpen = true
    marketOpen = null
    location.hash = '#/create'
  }

  function clickModalBackground(e) {
    if (e.target.classList.contains('modal-wrapper')) {
      closeModal()
    }
  }

  function closeModal() {
    marketOpen = null
    createOpen = null
    location.hash = '#/'
  }
</script>

<div
  class="modal-wrapper"
  class:active={marketOpen || createOpen}
  on:click={clickModalBackground}
>
  {#if marketOpen}
    <div class="modal">
      <Market marketId={marketOpen} />
    </div>
  {:else if createOpen}
    <div class="modal">
      <Create />
    </div>
  {/if}
</div>
<main>
  {#each marketList as market (market.id)}
    <div class="market" on:click={openMarket(market.id)}>
      <div>{market.terms}</div>
      <div class="yes">
        <code>YES</code>
        {marketImpliedProbability(market, 'yes')}%
      </div>
      <div class="no">
        <code>NO</code>
        {marketImpliedProbability(market, 'no')}%
      </div>
    </div>
  {:else}
    <p>No markets open right now.</p>
  {/each}
  <hr />
  <button on:click={openCreate}>Open a new market</button>
  {#if $account.id}
    <center><Auth /></center>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin: 20px 0;
  }
  main > * {
    margin: 0 20px;
  }
  hr {
    margin: 30px auto;
  }

  .modal-wrapper {
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease-in-out;
    z-index: -1;
  }
  .modal {
    background: var(--background-secondary);
    color: var(--color-secondary);
    opacity: 0;
    visibility: hidden;
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.25);
    box-sizing: border-box;
    transform: translateY(100%);
    transition: all 0.5s ease-in-out;
    width: 700px;
    max-width: 100vw;
    height: 700px;
    max-height: 100vh;
    overflow-y: auto;
  }
  .modal-wrapper.active {
    background: rgba(9, 9, 9, 0.7);
    z-index: 2;
  }
  .modal-wrapper.active .modal {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .market {
    width: 100%;
    display: grid;
    grid-template-columns: auto 182px 182px;
    justify-items: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    padding: 0 10px;
  }
  .market:nth-child(2n) > :nth-child(1) {
    color: #4d5947;
    margin: 10px 0;
  }
  .market:hover {
    background-color: var(--background-secondary);
  }
  .market > *:first-child {
    font-size: 120%;
    justify-self: start;
  }
  .yes,
  .no {
    font-size: 200%;
    margin: 0 1px;
    justify-self: stretch;
  }
  .yes code {
    background-color: var(--emphasis);
    color: white;
  }
  .no code {
    background-color: var(--emphasis-rare);
  }
  .market code {
    width: 72px;
    display: inline-block;
    text-align: center;
    margin: 10px;
    padding: 5px;
  }
  center {
    margin: auto;
  }
</style>
