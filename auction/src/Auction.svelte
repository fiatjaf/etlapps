<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  import * as toast from '../../common/toast'

  import {state, splitAuctionItem} from './helpers'

  export let auction

  const contract = getContext('contract')
  const alias_contract = getContext('alias_contract')

  const aliasesStore = getContext('aliases')
  var userAliases = []

  if ( $account.id == auction.top_bider_id ){
    aliasesStore.subscribe(aliases => {
      userAliases = aliases[$account.id]
    })
  }

  var new_bid = parseInt(auction.current_top_bid / 1000) + parseInt(auction.min_step / 1000)
  var winner_contact

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null,
      new_bid = parseInt(auction.current_top_bid / 1000) + parseInt(auction.min_step / 1000)
    })
  })

  $: canBid = auction && Date.now() < auction.end_datetime * 1000
  $: auctionTitle = splitAuctionItem(auction.auction_item).title
  $: auctionDetails = splitAuctionItem(auction.auction_item).details
  $: auctionImages = splitAuctionItem(auction.auction_item).images

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
      st.call = call
      return st
    })
  }


  async function finish_auction(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'finish_auction',
      0,
      {auction_id: auction.id},
      $account.session
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

  async function set_alias(e) {
    call = await alias_contract.prepareCall(
      'add',
      0,
      {alias: winner_contact},
      $account.session
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

  async function delete_alias(e) {
    call = await alias_contract.prepareCall(
      'delete',
      0,
      {alias: winner_contact},
      $account.session
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

</script>
<div class="auction_details">
  <div class="auction_item">
    {#if auctionImages.length > 0}
      <div class="auction_images">
        {#each auctionImages || [] as image, i}
          <a class="text-center" href="{image}" target="_blank" rel="nofollow noopener"><img src="{image}" alt="{auctionTitle} {i}"></a>
        {/each}
      </div>
    {/if}
    <div class="auction_description">
      {auctionDetails}
      {#if !canBid}
        <p style="word-break: break-word;">
          This auction is closed. The winner is {auction.top_bider_id}.

          {#if $account.id == auction.creator_id}
            {#if auction.state}
            <form on:submit={finish_auction}>
              <div class="button-wrap">
                <button> Finish Auction </button>
              </div>
            </form>  
            {:else}
              <p>You already finished this auction.</p>
            {/if}
          {/if}

          {#if $account.id == auction.top_bider_id}
              <div class="wrap text-center">
                  <p>Please leave your contact data email/telegram. <br>Note: this data will be open for everyone</p> 
                  <label style="display: block;">
                    <input
                      type="text"
                      style="display: block; margin: auto;width:auto;"
                      bind:value={winner_contact}
                      required
                    />
                  </label>
                  <button on:click={set_alias}> Set Alias </button>  
                  <button on:click={delete_alias}> Delete Alias </button>

                  <h5>List of your aliases</h5>
                  {#each userAliases || [] as alias}
                    <p>{alias}</p>
                    {:else}
                    <p>You still haven't any aliases</p>
                  {/each}
              </div>
          {/if}

        </p>
      {/if}
    </div>
  </div>
  <aside>
  {#if call}
    <div class="call">
      <PayToCall {call} on:cancel={cancel} qrsize="150"/>
    </div>
  {:else if canBid}
        {#if $account.id}
          <form on:submit={place_bid}>
            <div class="wrap">
                <label>
                  <input
                    type="number"
                    min="{parseInt(auction.current_top_bid / 1000) + parseInt(auction.min_step / 1000) }"
                    style="display: block; margin: auto;width:100%;"
                    bind:value={new_bid}
                    required
                  />
                </label>
            </div>
            <div class="button-wrap">
              <button> Place bid </button>
            </div>
          </form>    
        {/if}
    {#if !$account.id}
      <div class="text-center">
        Login to bet on this auction.
        <Auth qrsize="150" />
        You don't need to register for first log-in just enter any login and password
      </div>
    {/if}
  {/if}
  </aside>
</div>

<style>
  form .wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  form label {
    width: 100%;
    display: block;
  }
  .auction_item {
    width: 75%;
    padding: 5px;
    display: flex;
    flex-flow: row;
  }  
  .auction_description{
    padding: 0 20px;
    flex-basis: 77%;
  }
  .auction_images{
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    border-right: 2px solid var(--background-main);
    flex-basis: 33%;
    flex-flow: row;
    flex-wrap: wrap;
  }
  .auction_images a{
    flex: 1 0 50%;
  }
  .auction_images img{
    max-height: 250px;
    margin: 5px;
  }
  .auction_details{
    display: flex;
    padding-bottom: 20px;
  }
  .auction_details aside{
    width: 25%;
  }


  @media (max-width: 992px) {
    .auction_details,.auction_item{
      flex-flow: column;
    }
    .auction_details > .auction_item,.auction_details > aside {
      width: 100%;
    }
    .auction_item > div{
      flex-basis: 100%;
    }
    .auction_description{padding: 20px;}
    .auction_images{justify-content: center;border-right: none;}
  }

</style>
