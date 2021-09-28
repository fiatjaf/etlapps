<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import {state} from './helpers'

  const contract = getContext('contract')

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      create.auction_item = ''
      create.auction_duration_days = ''
      create.min_step = ''
      create.starting_bid = ''
    })
  })

  var create = {
    auction_item: '',
    auction_duration_days: '',
    min_step: '',
    starting_bid: ''
  }

  //$: requiredMsatoshi = calcBalance(create.factor, 1, 1)

  function cancel() {
    call = null
  }

  async function createAuction(e) {
    e.preventDefault()

    state.update(st => {
      return st
    })

    call = await contract.prepareCall(
      'create_auction',
      0,
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
    <PayToCall invoice={call.invoice} on:cancel={cancel} />
  </div>
{:else}
  <form on:submit={createAuction}>
    <label>
      <div>Auction Item Name</div>
      <input bind:value={create.auction_item} placeholder="Bitcoin Art" />
      <small>Put auction name or link to some external website page/image here. Consider mention your contact info, so auction winner can contact you.</small>
    </label>
    <label>
      <div>Auction duration (days)</div>
      <input type="number" min="1" bind:value={create.auction_duration_days} placeholder="7" />
      <small>How many days starting from now auction will be active. You cannot finish auction until this amount of days is passed.</small>
    </label>
    <label>
      <div>Minial step of bid (sats)</div>
      <input type="number" min="0" bind:value={create.min_step} placeholder="1000" />
      <small>Bidder can't make bid less then previous bid + minimal step.</small>
    </label>
    <label>
      <div>Starting bid (sats)</div>
      <input type="number" min="0" bind:value={create.starting_bid} placeholder="10000" />
      <small>Minimum amount of satoshis required to place first bid.</small>
    </label>
    <div class="button-wrap">
      {#if !$account.id}
        <div>
          Login to your
          <a href="https://etleneum.com/" target="_blank">etleneum.com</a>
          account to create this auction.
          <Auth />
        </div>
      {/if}
      <button>
        Create
      </button>
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
