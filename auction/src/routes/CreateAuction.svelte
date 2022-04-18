<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../../components/PayToCall.svelte'
  import account from '../../../components/etleneumAccountStore'

  import {state, joinAuctionItem} from '../helpers'

  const contract = getContext('contract')

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      create.title = ''
      create.details = ''
      create.auction_duration_days = ''
      create.min_step = ''
      create.starting_bid = ''
    })
  })

  var create = {
    title: '',
    details: `Maybe some description 
Maybe link to item photo.jpg or .png imgur or telegra.ph preferable,
Maybe link to detailed item desccription on telegra.ph
Seller: telegram handle / email / twitter`,
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

    const {title, details, ...params} = create
    params.auction_item = joinAuctionItem(title, details)

    state.update(st => {
      return st
    })

    call = await contract.prepareCall(
      'create_auction',
      0,
      params,
      $account.id ? $account.session : undefined
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

</script>

<div class="create-page">
  <div class="description">
    Create auction with starting bid (sats), min_step (sats) and auction duration (days).

    Place bid higher then (previous bid + minimal step) and until auction not finished.
    Previous bidder funds will be returned to his etleneum account balance.

    When auction time is end no one are able to place bid.
    To take funds auction owner may finish auction when auction.end_datetime time is reached.
  </div>
  {#if call}
    <div class="call">
      <PayToCall {call} on:cancel={cancel} />
    </div>
  {:else}
    <form on:submit={createAuction}>
      <label>
        <div>Item Name</div>
        <input bind:value={create.title} placeholder="Bitcoin Art" required/>
        <small>Name of the thing being auctioned.</small>
      </label>
      <label>
        <div>Details</div>
        <textarea
          bind:value={create.details}
          placeholder="As seen on https://art.site/id"
        />
        <small
          >Include information about what what the auction winner gets including
          links to some external website page or image here.</small
        >
      </label>
      <label>
        <div>Auction duration (days)</div>
        <input
          type="number"
          min="1"
          bind:value={create.auction_duration_days}
          placeholder="7"
          required
        />
        <small
          >How many days starting from now auction will be active. You cannot
          finish auction until this amount of days is passed.</small
        >
      </label>
      <label>
        <div>Minimal step of bid (sats)</div>
        <input
          type="number"
          min="0"
          bind:value={create.min_step}
          placeholder="1000"
          required
        />
        <small>Bidder can't make bid less then previous bid + minimal step.</small
        >
      </label>
      <label>
        <div>Starting bid (sats)</div>
        <input
          type="number"
          min="0"
          bind:value={create.starting_bid}
          placeholder="10000"
          required
        />
        <small>Minimum amount of satoshis required to place first bid.</small>
      </label>
      <div class="button-wrap">
        <button> Create </button>
      </div>      
    </form>
  {/if}
</div>

<style>
  .description{
    text-align: center;
    font-size: 13px;
  }
  textarea{
    height: 150px;
  }
  :global(svg) {
    height: 1;
  }
  input::placeholder {
    color: #000;
  }
</style>