<script>
  import dateFormat from 'dateformat'

  export let auction

  $: eventDate = auction && new Date(auction.end_datetime * 1000)

  function truncate(str, n){
    return (str.length > n) ? str.substr(0, n) + '...' + str.substr(-n) : str;
  }

</script>

<div class="auction_item">
  <h2>{auction.auction_item}</h2>
  <p>
    Finish time <span 
      >{dateFormat(eventDate, 'mmmm d, yyyy h:MM:ss TT Z')}</span
    >.
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
    width: 30%;
    flex-wrap: wrap;
  }
  aside > * {
    margin: 2px 4px;
    padding: 1px 2px;
    transition: all 0.2s ease-in-out;
  }
  aside > *:not(:hover) {
    background-color: var(--background-main);
    color: var(--links);
  }
</style>
