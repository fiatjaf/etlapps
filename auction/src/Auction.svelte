<script>
  import {onMount, getContext} from 'svelte'
  import dateFormat from 'dateformat'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {
    state,
    capitalize,
    weekSeconds
  } from './helpers'

  export let auction

  const contract = getContext('contract')

  var new_bid = 0

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
    })
  })

  $: canBid = auction && Date.now() < (auction.end_datetime) * 1000

  function cancel() {
    call = null
  }

  async function place_bid(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'place_bid',
      new_bid * 1000,
      {auction_id: auction.id},
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
{:else if !canBid}
  <p style="word-break: break-word;">
    This auction is closed. The winner is {auction.top_bider_id}.
  </p>
{:else}
  <form on:submit={place_bid}>
    <div class="wrap">
      {#if $account.id}
        <label>
          <div>New bid</div>
          <input
            type="number"
            style="display: block; margin: auto;" bind:value={new_bid}
          />
        </label>
      {/if}
    </div>
    <div class="button-wrap">
      {#if !$account.id}
        <div>
          Login to your
          <a href="https://etleneum.com/" target="_blank">Etleneum</a> account
          to bet on this auction.
          <Auth />
        </div>
      {/if}
      <button disabled={!$account.id}>
        Place bid
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
</style>
