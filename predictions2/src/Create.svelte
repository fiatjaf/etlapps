<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {state, calcBalance} from './helpers'

  const contract = getContext('contract')

  let minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  minDate = minDate.toISOString().split('T')[0]
  let maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 700)
  maxDate = maxDate.toISOString().split('T')[0]

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      create.terms = ''
      create.date = ''
      create.factor = 0.2
      create.maturation = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 14)
    })
  })

  var create = {
    factor: 0.2,
    terms: '',
    date: ''
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
      $account.id ? $account.session : undefined
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }
</script>

{#if call}
  <div class="call">
    <PayToCall call={call} on:cancel={cancel} />
  </div>
{:else}
  <form on:submit={createMarket}>
    <label>
      <div>Decision</div>
      <input bind:value={create.terms} placeholder="BIP300" />
      <small
        >People will bet on this resolving to a "yes" or "no". To bet means to
        buy a share of <strong>"yes"</strong> or a share of
        <strong
          >"no"<strong
            >. A share may cost anything
            <strong>between 0 and 100 satoshis</strong> depending on the state
            of the market. If the event happens, "yes" wins, otherwise "no"
            wins. For each winning share the owner of that share gets paid
            <strong>100 satoshis</strong>.</strong
          ></strong
        ></small
      >
    </label>
    <label>
      <div>Event Date</div>
      <input type="date" min={minDate} max={maxDate} bind:value={create.date} />
      <small
        >This is the date in which this market will time out. For example, if
        the decision is <strong
          >"BIP300 will be activated on Bitcoin before the end of 2022"</strong
        >
        you should select <strong>"December 31, 2022"</strong> here.</small
      >
    </label>
    <!--
    <details>
      <summary>Advanced settings</summary>
      <label>
        <div>Liquidity factor</div>
        <input
          type="range"
          min="0.01"
          max="0.1"
          step="0.01"
          bind:value={create.factor}
        />
        <small
          >A higher liquidity factor means the market is less sensible to buys
          and sells, but you have to pay more for the initial funds.</small
        >
      </label>
    </details>
    !-->
    <div class="button-wrap">
      {#if !$account.id}
        <div>
          Login to your
          <a href="https://etleneum.com/" target="_blank">etleneum.com</a>
          account to create this market -- you'll get 1 share of each side.
          <Auth />
        </div>
      {/if}
      <button>
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
