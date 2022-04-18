<script>
  import {onMount, setContext, getContext} from 'svelte'
  import AuctionPage from '../views/AuctionPage.svelte'

  export let auctionId;

  const contract = getContext('contract')
  var auction;

  onMount(loadAuction)

  onMount(() => {
    return contract.stream(loadAuction())
  })  

  async function loadAuction() {
    try {
      auction = await contract.state(`.["${auctionId}"]`)
      auction['id'] = auctionId;
    } catch (err) {
      toast.error(`Error loading contract: ${err}`)
    }
  }

</script>

{#if auction}
  <AuctionPage {auction}/>
{/if}
