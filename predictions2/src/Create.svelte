<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {state, calcBalance} from './helpers'

  const contract = getContext('contract')

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      create.terms = ''
      create.factor = 0.02
      create.maturation = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 14)
    })
  })

  var create = {
    factor: 0.02,
    terms: ''
  }

  $: requiredMsatoshi = calcBalance(create.factor, 1, 1)

  function cancel() {
    call = null
  }

  async function createMarket(e) {
    e.preventDefault()

    state.update(st => {
      return st
    })

    call = await contract.prepareCall(
      'createmarket',
      requiredMsatoshi,
      {...create},
      $account.session
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }
</script>

{#if call}
  <div class="call">
    <PayToCall invoice={call.invoice} on:cancel={cancel} />
  </div>
{:else}
  <form on:submit={createMarket}>
    <h1>Creating a market</h1>
    <label>
      <div>Decision</div>
      <input
        bind:value={create.terms}
        placeholder="Will Ethereum 2.0 be launched before the end of 2020?"
      />
      <small>People will bet on this resolving to a "yes" or "no".</small>
    </label>
    <details>
      <summary>Advanced settings</summary>
      <label>
        <div>Liquidity factor</div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          bind:value={create.factor}
        />
        <small
          >A higher liquidity factor means the market is less sensible to buys
          and sells, but you have to pay more for the initial funds.</small
        >
      </label>
    </details>
    <div class="button-wrap">
      {#if !(create.resolvers || $account.id)}
        <div>
          Login to your
          <a href="https://etleneum.com/" target="_blank">etleneum.com</a>
          account to create this market -- or input custom resolver account ids.
          <Auth />
        </div>
      {/if}
      <button disabled={!(create.resolvers || $account.id)}>
        Create for {Math.ceil(requiredMsatoshi / 1000)} sat
      </button>
    </div>
  </form>
{/if}

<style>
  :global(svg) {
    height: 1;
  }
</style>
