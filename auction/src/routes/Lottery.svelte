<script>
  import {onMount, setContext, getContext} from 'svelte'
  import LotoPage from '../views/LotoPage.svelte'

  export let auctionId;

  const loto_contract = getContext('loto_contract')
  var auction;

  onMount(loadAuction)

  onMount(() => {
    return loto_contract.stream(loadAuction())
  })  

  async function loadAuction() {
    try {
      auction = await loto_contract.state(`.["${auctionId}"]`)
      auction['id'] = auctionId;
    } catch (err) {
      toast.error(`Error loading loto contract: ${err}`)
    }
  }

</script>

{#if auction}
  <LotoPage {auction}/>
{/if}
