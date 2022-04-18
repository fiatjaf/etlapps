<script>
  import {onMount, getContext} from 'svelte'

  import PayToCall from '../../../components/PayToCall.svelte'
  import account from '../../../components/etleneumAccountStore'
  import dateFormat from 'dateformat'
  import { link } from "svelte-routing";

  import * as toast from '../../../common/toast'

  import {state, splitAuctionItem, truncate} from '../helpers'
  import Countdown from 'svelte-countdown';

  import { SignInRoute,
    AuctionParentRoute,
    HostParentRoute,
    UserParentRoute,
  } from '../constants/routes'

  import Alias from '../local-components/Alias.svelte'

  export let auction

  const contract = getContext('contract')

  const aliasesStore = getContext('aliases')
  var winnerAliasesArr = []
  var winnerAliases = []

  aliasesStore.subscribe(aliases => {
    winnerAliasesArr = aliases[auction.top_bider_id]
    winnerAliases = [...new Set(winnerAliasesArr)];
  })

  var new_bid = parseInt(auction.current_top_bid / 1000) + parseInt(auction.min_step / 1000)

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null,
      new_bid = parseInt(auction.current_top_bid / 1000) + parseInt(auction.min_step / 1000)
    })
  })

  $: eventDate = auction && new Date(auction.end_datetime * 1000)
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

</script>
<div class="auction-page">
  <div class="warning_message">This contract cannot ensure or coordinate the delivery of goods that must be arranged off-contract. Make sure to know what and from whom you're buying before bidding.</div>
  {#if $account.id == auction.top_bider_id && !canBid}
    <Alias/>
  {/if}
  <div class="control_panel">
    {#if $account.id == auction.creator_id && !canBid}
      {#if auction.state}
      <div class="button-wrap">
        <button on:click={finish_auction}> Finish Auction </button>
      </div>
      {/if}
    {/if}
  </div>
  <div class="auciton_wrapper">
    <div class="auction_top">
      <div class="auction_item">
        <h1 class="title">{auctionTitle}</h1>
        <Countdown from="{dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}" dateFormat="mmmm d, yyyy h:MM:ss TT Z"  let:remaining>
        <div class="whatever">
            Host: <a href={`${HostParentRoute}/${auction.creator_id}`} use:link>{truncate(auction.creator_id, 4)} </a><br>
            {#if remaining.done === false}
            Ends in: 
            <span>{remaining.days} days</span>
            <span>{remaining.hours} hours</span>
            <span>{remaining.minutes} minutes</span>
            <span>{remaining.seconds} seconds</span>
            {:else}
            <h5>Auction {#if auction.state}time out{:else}finished{/if}: {dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}!</h5>
            {/if}
        </div>
        </Countdown>
        {#if !canBid}
          <div class="closed_auction">
            <p>The winner is {auction.top_bider_id}.</p>
            <p>Winner aliases: 
            {#each winnerAliases || [] as alias}
              {alias} &nbsp;
              {:else}
              winner still haven't any aliases. <br> If you are top bidder please <a href={SignInRoute} use:link>log-in</a> and set alias, so seller can contact you.
            {/each}
            </p>
          </div>
        {/if}
      </div>
      <div class="bid_info">
        <div>Min step: {parseInt(auction.min_step / 1000)} sat</div>
        <div>Top bid: {parseInt(auction.current_top_bid / 1000)} sat</div>
        <div>Top bidder: <a href={`${UserParentRoute}/${auction.top_bider_id}`} use:link>{truncate(auction.top_bider_id, 4)}</a></div>
        {#if canBid}
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
            <div><a href={SignInRoute} use:link>Sign in</a> to bet on this auction.</div>
          {/if}
        {/if}
      </div>
    </div>
    <div class="auction_bottom">
      {#if call}
        <div class="call">
          <PayToCall {call} on:cancel={cancel} qrsize="150"/>
        </div>
      {/if}
      {#if auctionDetails}
      <div class="auction_description">
        <div class="description">{@html auctionDetails}</div>
      </div>
      {/if}
      {#if auctionImages.length > 0}
        <div class="auction_images">
          <h2 class="text-center">Item photos</h2>
          {#each auctionImages || [] as image, i}
            <a class="text-center" href="{image}" target="_blank" rel="nofollow noopener"><img src="{image}" alt="{auctionTitle} {i}"></a>
          {/each}
        </div>
      {/if}
  </div>
  </div>
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
  .warning_message{
    padding: 20px;
    box-sizing: border-box;
    background: var(--warning-red);
    font-size: 12px;
    text-align: center;
    color: #fff;
  }
  .auciton_wrapper{
    margin: 32px 0;
  }
  .auction_top{
    display: flex;
    flex-flow: row;
    gap: 20px;
    background: var(--background-secondary);
    border-bottom: 1px solid var(--emphasis-rare);
    justify-content: space-between;
  }
  .auction_item{
    padding: 16px;
  }
  .auction_item .title{
    margin: 0;
    color: var(--links);
    margin-bottom: 12px;
  }
  .bid_info{
    min-width: 300px;
    width: 25%;
    background-color: var(--emphasis-rare);
    padding: 12px;
    max-width: 500px;
  }

  .bid_info > *{
    width: 100%;
    padding: 6px 12px;
    color: var(--background-secondary);
  }
  .bid_info a{
    color: var(--background-secondary);
  }
  .auction_bottom{
    background: var(--background-secondary);
  }
  .auction_description{
    padding: 16px;
  }
  .auction_images{
    padding: 16px;
    margin: 32px 0 0 0;
  }
  .auction_images img{
    width: 100%;
  }
  .closed_auction{
    word-break: break-word;
  }
  .control_panel{
    display: flex;
    justify-content: right;
  }

  .control_panel button{
    margin: 0;
  }

  @media (max-width: 992px) {
    .auction_top{
      flex-flow: column;
    }
    .bid_info{
      width: 100%;
    }
    .auction_images{
      margin: 0;
    }
  }

</style>