<script>
  import dateFormat from 'dateformat'
  import {splitAuctionItem, truncate} from './helpers'
  import Countdown from 'svelte-countdown';

  export let auction

  $: eventDate = auction && new Date(auction.end_datetime * 1000)
  $: auctionTitle = splitAuctionItem(auction.auction_item).title
</script>

<div class="auction_item">
  <h2>{auctionTitle}</h2>
    <Countdown from="{dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}" format="mmmm d, yyyy h:MM:ss" zone="Europe/Athens" let:remaining>
    <div class="whatever">
        Ends in: 
        {#if remaining.done === false}
        {#if remaining.years != 0}
          <span>{remaining.years} years</span>
        {/if}
        {#if remaining.months != 0}
        <span>{remaining.months} months</span>
        {/if}
        {#if remaining.weeks != 0}
        <span>{remaining.weeks} weeks</span>
        {/if}
        <span>{remaining.days} days</span>
        <span>{remaining.hours} hours</span>
        <span>{remaining.minutes} minutes</span>
        <span>{remaining.seconds} seconds</span>
        {:else}
        <h2>Auction finished {dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}!</h2>
        {/if}
    </div>
</Countdown>
</div>
<aside>
  <div>Min step: {parseInt(auction.min_step / 1000)} sat</div>
  <div>Top bid: {parseInt(auction.current_top_bid / 1000)} sat</div>
  <div>Top bidder: {truncate(auction.top_bider_id, 4)}</div>
</aside>

<style>
  .auction_item {
    width: 75%;
    padding: 5px;
  }
  .auction_item h2 {
    margin: 0 0 12px;
  }
  aside {
    display: flex;
    width: 25%;
    flex-wrap: wrap;
    background-color: var(--background-main);
  }
  aside > * {
    width:100%;
    padding: 5px 10px;
    color:var(--color-main);
  }
  @media (max-width: 992px) {
    .auction_item {
       width: 100%;
    }
    aside{
      width: 100%;
    }
  }
</style>
