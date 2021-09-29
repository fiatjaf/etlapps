<script>
  import dateFormat from 'dateformat'
  import {splitAuctionItem, truncate} from './helpers'

  export let auction

  $: eventDate = auction && new Date(auction.end_datetime * 1000)
  $: auctionTitle = splitAuctionItem(auction.auction_item).title
</script>

<div class="auction_item">
  <h2>{auctionTitle}</h2>
  <p>
    Ends at: <code>{dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}</code>.
  </p>
</div>
<aside>
  <code>Min step: {parseInt(auction.min_step / 1000)} sat</code>
  <code>Top bid: {parseInt(auction.current_top_bid / 1000)} sat</code>
  <code>Top bidder: {truncate(auction.top_bider_id, 4)}</code>
</aside>

<style>
  .auction_item {
    width: 60%;
    padding: 5px;
  }
  .auction_item h2 {
    margin: 0 0 12px;
  }
  aside {
    display: flex;
    width: 50%;
    flex-wrap: wrap;
  }
  aside > * {
    margin: 2px 4px;
    padding: 1px 6px;
    transition: all 0.2s ease-in-out;
  }
  aside > *:not(:hover) {
    background-color: var(--emphasis);
    color: var(--emphasis-rare);
  }
</style>
