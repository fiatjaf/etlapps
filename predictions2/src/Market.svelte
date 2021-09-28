<script>
  import {onMount, getContext} from 'svelte'
  import dateFormat from 'dateformat'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {
    state,
    sharePrice,
    capitalize,
    countShares,
    calcBalance,
    weekSeconds
  } from './helpers'

  export let market

  const contract = getContext('contract')

  var params = {
    nshares: 1,
    side: 'yes',
    type: 'buy'
  }

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      params.type = 'buy'
      params.nshares = 1
    })
  })

  const costToBuy = (side, nShares) =>
    calcBalance(
      market.factor,
      currentYes + (side === 'yes' ? nShares : 0),
      currentNo + (side === 'no' ? nShares : 0)
    ) - market.balance

  const costToSell = (side, nShares) =>
    market.balance -
    calcBalance(
      market.factor,
      currentYes - (side === 'yes' ? nShares : 0),
      currentNo - (side === 'no' ? nShares : 0)
    )

  $: canBuy = market && Date.now() < (market.date + weekSeconds) * 1000
  $: willResolveAt = market && new Date((market.date + 3 * weekSeconds) * 1000)
  $: willResolveTo = currentYes > currentNo ? 'yes' : 'no'
  $: shouldHaveResolved = willResolveAt.getTime() < Date.now()
  $: currentYes = market && countShares(market, 'yes')
  $: currentNo = market && countShares(market, 'no')
  $: nSharesToBuyUntil99Percent = (side => {
    var i = 0
    while (true) {
      i++
      let cost = costToBuy(side, i) / i
      if (cost > 0.98 * sharePrice) break
    }
    return i == 1 ? 2 : i
  })(params.side)
  $: sharesMax =
    market &&
    (params.type === 'buy'
      ? nSharesToBuyUntil99Percent
      : market.shares[params.side][$account.id])
  $: msatoshiDiff = market && {
    buy: costToBuy(params.side, params.nshares),
    sell: costToSell(params.side, params.nshares)
  }
  $: each = msatoshiDiff && msatoshiDiff[params.type] / params.nshares

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

  async function complain(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'complain',
      5000000,
      {id: market.id},
      $account.session
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

{#if call}
  <div class="call">
    <PayToCall call={call} on:cancel={cancel} />
  </div>
{:else if !canBuy}
  <p>
    This market is closed for exchanges. It
    {#if shouldHaveResolved}
      should have resolved (and eventually will)
    {:else}
      will resolve
    {/if}

    to
    <span style="display: inline-block; padding: 2px 4px" class={willResolveTo}
      >{willResolveTo}</span
    >
    on
    <span class="date">{dateFormat(willResolveAt, 'dddd, mmmm dS, yyyy')}</span
    >.
  </p>

  <p>
    If you think that decision is wrong you can complain below and it will be
    manually resolved by the contract's supreme admin. Complaining has a cost,
    but you will be reimbursed if you happen to be right in your complaint.
  </p>

  <form on:submit={complain}>
    <div class="wrap">
      <div class="button-wrap">
        {#if !$account.id}
          <div>
            Login to your
            <a href="https://etleneum.com/" target="_blank">Etleneum</a> account
            to complain about this resolution.
            <Auth />
          </div>
        {/if}
        <button disabled={!$account.id}> Complain </button>
      </div>
    </div>
  </form>
{:else}
  <form on:submit={exchange}>
    <div class="wrap">
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
              disabled={params.type === 'sell' &&
                !market.shares.yes[$account.id]}
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
              disabled={params.type === 'sell' &&
                !market.shares.no[$account.id]}
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
    </div>
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
    </div>
  </form>
{/if}

<style>
  form .wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  form label {
    margin: 10px 60px;
  }
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
    background-color: var(--yes);
    color: white;
  }
  .no {
    background-color: var(--no);
    color: black;
  }

  .date {
    text-decoration: underline;
    font-weight: bold;
  }
</style>
