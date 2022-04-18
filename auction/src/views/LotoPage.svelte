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
  } from '../constants/routes'

  import Alias from '../local-components/Alias.svelte'

  export let auction

  const loto_contract = getContext('loto_contract')

  const aliasesStore = getContext('aliases')
  var winnerAliasesArr = []
  var winnerAliases = []

  aliasesStore.subscribe(aliases => {
    winnerAliasesArr = aliases[auction.top_bider_id]
    winnerAliases = [...new Set(winnerAliasesArr)];
  })

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
    })
  })

  $: eventDate = auction && new Date(auction.end_datetime * 1000)
  $: canFinish = auction.started && Date.now() > auction.end_datetime * 1000
  $: ticketsCosed = auction.started && Date.now() > auction.end_datetime * 1000
  $: auctionTitle = splitAuctionItem(auction.auction_item).title
  $: auctionDetails = splitAuctionItem(auction.auction_item).details
  $: auctionImages = splitAuctionItem(auction.auction_item).images
  $: ticketsIssued = auction.tickets.length || 0
  

  function cancel() {
    call = null
  }

  async function buy_ticket(e) {
    e.preventDefault()

    call = await loto_contract.prepareCall(
      'buy_ticket',
      auction.ticket_price,
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

    call = await loto_contract.prepareCall(
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
  {#if $account.id == auction.top_bider_id && auction.winner_id != ''}
    <Alias/>
  {/if}
  <div class="control_panel">
    {#if $account.id == auction.creator_id && canFinish}
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
            {#if remaining.done === false && auction.started == true}
            Ends in: 
            <span>{remaining.days} days</span>
            <span>{remaining.hours} hours</span>
            <span>{remaining.minutes} minutes</span>
            <span>{remaining.seconds} seconds</span>
            {:else if auction.started == false}
            Auction to be started when required amount of tickets will be sold
            {:else}
            <h5>Auction {#if auction.state}time out{:else}finished{/if}: {dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}!</h5>
            {/if}
        </div>
        </Countdown>
        {#if auction.winner_id != ''}
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
        <div>Ticket price: {parseInt(auction.ticket_price / 1000)} sat</div>
        <div>Tickets issued: {ticketsIssued}</div>
        {#if auction.started}
        <div>Lottery Fund: {parseInt(auction.lottery_fund / 1000)} sat</div>
        {:else}
        <div>Req. Tickets: {auction.tickets_to_start}</div>
        {/if}
        {#if !ticketsCosed}
          {#if $account.id}
            <form on:submit={buy_ticket}>
              <div class="button-wrap">
                <button> Buy Ticket </button>
              </div>
            </form>    
          {/if}
          {#if !$account.id}
            <div><a href={SignInRoute} use:link>Sign in</a> to buy ticket.</div>
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
  .call{
    padding: 16px;
  }
  .auction_description{
    padding: 16px;
  }
  .auction_images{
    padding: 16px;
    margin: 64px 0 0 0;
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
  }

</style>