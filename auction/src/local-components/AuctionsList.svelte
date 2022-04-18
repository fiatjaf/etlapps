<script>
	import AuctionSummary from '../local-components/AuctionSummary.svelte'
  import LotoSummary from '../local-components/LotoSummary.svelte'
	export let source
</script>

  
  {#each source as auction (auction.id)}
    {#if auction.ticket_price}
      <LotoSummary {auction} />
    {:else}
      <AuctionSummary {auction} />
    {/if}
  {/each}