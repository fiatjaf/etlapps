<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {
    state,
    sharePrice,
    countShares,
    calcBalance,
    capitalize,
    marketImpliedProbability
  } from './helpers'
  import MarketHeader from './MarketHeader.svelte'

  export let marketId

  const contract = getContext('contract')
  const marketsStore = getContext('markets')

  var params = {
    nshares: 1,
    side: 'yes',
    type: 'buy'
  }

  var increasingLiquidity = 0

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      increasingLiquidity = 0
      params.type = 'buy'
      params.nshares = market.liquidity
    })
  })

  var market
  marketsStore.subscribe(markets => {
    if (markets[marketId]) {
      if (market) {
        market = {id: marketId, ...markets[marketId]}
      } else {
        market = {id: marketId, ...markets[marketId]}
        params.nshares = market.liquidity
      }
    }
  })

  $: sharesMax =
    market &&
    (params.type === 'buy' ? 100 : market.shares[params.side][$account.id])
  $: msatoshiDiff = market && {
    buy:
      calcBalance(
        market.liquidity,
        countShares(market, 'yes') +
          (params.side === 'yes' ? params.nshares : 0),
        countShares(market, 'no') + (params.side === 'no' ? params.nshares : 0)
      ) - market.balance,
    sell:
      market.balance -
      calcBalance(
        market.liquidity,
        countShares(market, 'yes') -
          (params.side === 'yes' ? params.nshares : 0),
        countShares(market, 'no') - (params.side === 'no' ? params.nshares : 0)
      )
  }
  $: each = msatoshiDiff && msatoshiDiff[params.type] / params.nshares
  $: canWin =
    params.type === 'buy' &&
    msatoshiDiff &&
    params.nshares * sharePrice - msatoshiDiff.buy
  $: liquidityIncreaseMsatoshi =
    market &&
    calcBalance(
      market.liquidity + increasingLiquidity,
      countShares(market, 'yes'),
      countShares(market, 'no')
    ) - market.balance

  function cancel() {
    call = null
  }

  async function exchange(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'exchange',
      params.type === 'buy' ? msatoshiDiff.buy : 0,
      {
        side: params.side,
        nshares: params.nshares * (params.type === 'buy' ? 1 : -1),
        id: market.id
      },
      $account.session
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }

  async function increaseLiquidity(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'increaseliquidity',
      liquidityIncreaseMsatoshi,
      {
        id: market.id,
        liquidity: market.liquidity + increasingLiquidity
      }
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }

  function setSide(side) {
    return e => {
      e.preventDefault()
      params.side = side
    }
  }

  function toggleSell(e) {
    params.type = e.target.checked ? 'sell' : 'buy'

    if (market.shares.yes[$account.id] && !market.shares.no[$account.id]) {
      params.side = 'yes'
    } else if (
      market.shares.no[$account.id] &&
      !market.shares.yes[$account.id]
    ) {
      params.side = 'no'
    }

    params.nshares = market.shares[params.side][$account.id]
  }
</script>

{#if !market}
  <p style="margin: 25px 20px">Loading market {marketId}...</p>
{:else if call}
  <div class="call">
    <PayToCall invoice={call.invoice} on:cancel={cancel} />
  </div>
{:else if !increasingLiquidity}
  <form on:submit={exchange}>
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <p>Making a bet on:</p>
      <span
        style="font-size: 63%; text-decoration: underline; cursor: pointer;"
        on:click={() => (increasingLiquidity = 1)}>Donate liquidity</span
      >
    </div>
    <MarketHeader {market} />
    {#if $account.id && (market.shares.yes[$account.id] || market.shares.no[$account.id])}
      <label>
        <div>Sell?</div>
        <input
          type="checkbox"
          on:change={toggleSell}
          style="display: block; margin: auto;"
        />
        <small
          >You can sell your shares and cash out your profit or minimize your
          loss before the market resolves.</small
        >
      </label>
    {/if}
    <label on:click={e => e.preventDefault()} for="nothing">
      <div>Side</div>
      <div class="side-buttons">
        <div>
          {#if $account.id && market.shares.yes[$account.id]}
            <small>balance: {market.shares.yes[$account.id]}</small>
          {/if}
          <button
            class="yes"
            class:active={params.side === 'yes'}
            on:click={setSide('yes')}
            disabled={params.type === 'sell' && !market.shares.yes[$account.id]}
          >
            YES
          </button>
        </div>
        <div>
          {#if $account.id && market.shares.no[$account.id]}
            <small>balance: {market.shares.no[$account.id]}</small>
          {/if}
          <button
            class="no"
            class:active={params.side === 'no'}
            on:click={setSide('no')}
            disabled={params.type === 'sell' && !market.shares.no[$account.id]}
          >
            NO
          </button>
        </div>
      </div>
      <small
        ><code>YES</code> means the question or statement
        <em>"{market.terms}"</em> will be resolved as true, <code>NO</code> means
        it will be resolved as false.</small
      >
    </label>
    <label>
      <div>Shares to {params.type}</div>
      <input
        type="range"
        min="1"
        max={sharesMax}
        step="1"
        bind:value={params.nshares}
      />
      <small>
        If the market resolves to your side, each share is paid
        <em
          ><b style="font-size: 18px">{parseInt(sharePrice / 1000)}</b>
          satoshi</em
        >, paid to your
        <a href="https://etleneum.com/" target="_blank">Etleneum</a> account,
        otherwise it will be worth <b>zero</b>.
      </small>
    </label>
    <div class="button-wrap">
      {#if !$account.id}
        <div>
          Login to your
          <a href="https://etleneum.com/" target="_blank">Etleneum</a> account
          to bet on this market.
          <Auth />
        </div>
      {/if}
      <button
        disabled={!$account.id}
        class:yes={params.side === 'yes'}
        class:no={params.side === 'no'}
      >
        {capitalize(params.type)}
        {params.nshares}
        {params.side.toUpperCase()}
        share{#if params.nshares > 1}s{/if} for
        {Math.ceil(msatoshiDiff[params.type] / 1000)} sat{#if params.nshares > 1}
          &nbsp;({Math.ceil(each / 1000)} each){/if}
      </button>
      <p>
        <small
          >Make sure you trust the resolvers of this market before betting. If
          they are malicious they can cheat.</small
        >
      </p>
    </div>
  </form>
{:else}
  <form on:submit={increaseLiquidity}>
    <p>Donating liquidity to:</p>
    <MarketHeader {market} />
    <label>
      <div>Liquidity factor increase</div>
      <input type="range" min="1" max="10" bind:value={increasingLiquidity} />
      <small>
        Donate some money to increase the liquidity of this market and make
        share prices less susceptible to change over buys and sells.
      </small>
    </label>
    <div class="button-wrap">
      <button>
        Factor change from {market.liquidity} to {market.liquidity +
          increasingLiquidity} for {Math.ceil(liquidityIncreaseMsatoshi / 1000)}
        sat
      </button>
    </div>
  </form>
{/if}

<style>
  .side-buttons {
    display: flex;
    justify-content: space-around;
  }
  .side-buttons > div {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .side-buttons small {
    display: block;
    margin: auto;
    text-align: center;
  }
  .yes {
    background-color: var(--emphasis);
    color: white;
  }
  .no {
    background-color: var(--emphasis-rare);
    color: var(--color);
  }
</style>
