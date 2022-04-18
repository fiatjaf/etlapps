<script>
  import dateFormat from 'dateformat'
  import {splitAuctionItem, truncate} from '../helpers'
  import Countdown from 'svelte-countdown';
  import { link } from "svelte-routing";

  import { AuctionParentRoute, HostParentRoute, UserParentRoute } from '../constants/routes'

  export let auction

  $: eventDate = auction && new Date(auction.end_datetime * 1000)
  $: auctionTitle = splitAuctionItem(auction.auction_item).title
  $: auctionImages = splitAuctionItem(auction.auction_item).images
  $: lessThan90d = (new Date().getTime() - eventDate.getTime())/(1000 * 60 * 60 * 24) < 90

</script>

<div class="auction_item">
  <a class="item_title" href={`${AuctionParentRoute}/${auction.id}`} use:link><h4>{auctionTitle}</h4></a>
  <div class="item_preview">
    {#if auctionImages.length > 0 && lessThan90d}
    <a href={`${AuctionParentRoute}/${auction.id}`} use:link><img src={ auctionImages[0] } alt="Etleneum Auction"></a>
    {:else}
    <a href={`${AuctionParentRoute}/${auction.id}`} use:link><img src="https://etleneum.com/static/icon.png" alt="Etleneum Auction"></a>
    {/if}
  </div>
  <Countdown from="{dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}" dateFormat="mmmm d, yyyy h:MM:ss TT Z"  let:remaining>
  <div class="auction_info">
      Host: <a href={`${HostParentRoute}/${auction.creator_id}`} use:link>{truncate(auction.creator_id, 4)} </a><br>
      {#if remaining.done === false}
      Ends in:
      <span>{remaining.days} days</span>
      <span>{remaining.hours} hours</span>
      <span>{remaining.minutes} minutes</span>
      <span>{remaining.seconds} seconds</span>
      {:else}
      Auction finished {dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}!
      {/if}
  </div>
  </Countdown>
  <div class="bid_info">
    <div>Min step: {parseInt(auction.min_step / 1000)} sat</div>
    <div>Top bid: {parseInt(auction.current_top_bid / 1000)} sat</div>
    <div>Top bidder: <a href={`${UserParentRoute}/${auction.top_bider_id}`} use:link>{truncate(auction.top_bider_id, 4)}</a></div>
  </div>
</div>

<style>
  .auction_item {
    width: calc(33% - 10px);
    background: var(--background-secondary);
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    box-shadow: 3px 3px 12px #ccc;
    border: 1px solid #eee;
    box-sizing: border-box;
  }
  .item_title, .item_title:hover {
    text-align: center;
    text-decoration: none;
    min-height: 100px;
    padding: 0 12px;
    display: flex;
    justify-content: center;
    flex-flow: column;
  }
  .item_preview{
    margin: 0 auto;
    text-align: center;
    height: 200px;
  }
  .item_preview img{
    height: 200px;
    width: auto;
    max-width: 100%;
  }
  .auction_info{
    padding: 6px 12px;
  }
  .bid_info {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--emphasis-rare);
  }
  .bid_info > * {
    width:100%;
    padding: 6px 12px;
    color:var(--background-secondary);
  }
  .bid_info a{
    color:var(--background-secondary);
  }
  @media (max-width: 992px) {
    .auction_item {
       width: 100%;
    }
    .bid_info{
      width: 100%;
    }
  }
</style>
