<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../../components/PayToCall.svelte'
  import account from '../../../components/etleneumAccountStore'

  import {state, joinAuctionItem} from '../helpers'

  const loto_contract = getContext('loto_contract')

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
      create.title = ''
      create.details = ''
      create.auction_duration_days = ''
      create.tickets_to_start = ''
      create.ticket_price = ''
    })
  })

  var create = {
    title: '',
    details: `Maybe some description 
Maybe link to item photo.jpg or .png imgur or telegra.ph preferable,
Maybe link to detailed item desccription on telegra.ph
Seller: telegram handle / email / twitter`,
    auction_duration_days: '',
    tickets_to_start: '',
    ticket_price: ''
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

    call = await loto_contract.prepareCall(
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
    Create auction with auction duration (days), ticket price and tickets amount needed to start auction.

    Auction countdown starts automatically when bought tickets amount reached minimal limit needed to start auction (set by auction host).

    When auction finishes random selected ticket will win lot.
    Participants can buy as many tickets as they wish to increase chance to win.

    To take funds auction owner may finish auction when auction.end_datetime time is reached.
    Auction host will take 90% of auction fund.

    To prevent cheating by auction host 10% of the fund will be sent to fiatjaf account.
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
          >How many days starting from the moment when required tickets amount were bought auction will be active. You cannot
          finish auction until this amount of days is passed.</small
        >
      </label>
      <label>
        <div>Tickets to start</div>
        <input
          type="number"
          min="0"
          bind:value={create.tickets_to_start}
          placeholder="1000"
          required
        />
        <small>Amount of tickets that are needed to start an auction.</small
        >
      </label>
      <label>
        <div>Ticket price</div>
        <input
          type="number"
          min="0"
          bind:value={create.ticket_price}
          placeholder="10000"
          required
        />
        <small>Price of one ticket.</small>
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