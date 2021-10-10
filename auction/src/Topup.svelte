<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {state, joinAuctionItem} from './helpers'

  const contract = getContext('contract')

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
    })
  })

  var top_up_amount = 0

  function cancel() {
    call = null
  }

  async function topupAccount(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'deposit',
      top_up_amount * 1000,
      null,
      $account.id ? $account.session : undefined
    )

    state.update(st => {
      st.call = call
      return st
    })
  }
</script>

{#if call}
  <div class="call">
    <PayToCall {call} on:cancel={cancel} />
  </div>
{:else}
  <form on:submit={topupAccount}>
    <label>
      <div>Top-up amount (sats)</div>
      <input
        type="number"
        min="100"
        bind:value={top_up_amount}
        placeholder="1000"
      />
    </label>
    <div class="button-wrap">
      <button disabled={!$account.id}> Top-up </button>
    </div>
  </form>
{/if}

<style>
  :global(svg) {
    height: 1;
  }
  input::placeholder {
    color: #000;
  }
</style>
