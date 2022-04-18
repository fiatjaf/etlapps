<!-- @format -->
<script>
  import {onMount, setContext, getContext} from 'svelte'
  import {writable} from 'svelte/store'
  import * as toast from '../../../common/toast'

  import AuctionList from '../local-components/AuctionsList.svelte'

  const contract = getContext('contract')
  const auctionsStore = writable({})
  setContext('auctions', auctionsStore)
  onMount(loadAuctions)

  async function loadAuctions() {
    try {
      var yesterday_time = new Date()
          yesterday_time.setDate(yesterday_time.getDate() - 1)
      var yesterday_timestamp = Math.round(yesterday_time.getTime() / 1000)
      var auctions = await contract.state(`[. | to_entries[] | {"key": .key, "value": .value |  select(.end_datetime > ${yesterday_timestamp} )}] | from_entries`)
      if (Array.isArray(auctions)) {
        auctions = {}
      }
      auctionsStore.set(auctions)
    } catch (err) {
      toast.error(`Error loading contract: ${err}`)
    }
  }

  const loto_contract = getContext('loto_contract')
  const lotteriesStore = writable({})
  setContext('lotteries', lotteriesStore)
  onMount(loadLotteries)

  async function loadLotteries() {
    try {
      var yesterday_time = new Date()
          yesterday_time.setDate(yesterday_time.getDate() - 1)
      var yesterday_timestamp = Math.round(yesterday_time.getTime() / 1000)
      var lotteries = await loto_contract.state(`[. | to_entries[] | {"key": .key, "value": .value |  select(.state == true )}] | from_entries`)
      if (Array.isArray(lotteries)) {
        lotteries = {}
      }
      lotteriesStore.set(lotteries)
    } catch (err) {
      toast.error(`Error loading loto contract: ${err}`)
    }
  }

  onMount(() => {
    return contract.stream(loadAuctions())
    return loto_contract.stream(loadLotteries())
  })

  var auctionList = []
  auctionsStore.subscribe(auctions => {
    auctionList = Object.keys(auctions)
      .map(id => ({id, ...auctions[id]}))
      .sort((a, b) => a.end_datetime - b.end_datetime && b.state > a.state )
  })

  var lotteryList = []
  lotteriesStore.subscribe(auctions => {
    lotteryList = Object.keys(auctions)
      .map(id => ({id, ...auctions[id]}))
      .sort((a, b) => a.end_datetime - b.end_datetime && b.state > a.state )
  })

  $: activeAuctions = auctionList.length + lotteryList.length;

</script>

<div class="main-page">
  <div class="auctions_list">
    <AuctionList source={auctionList} />
    <AuctionList source={lotteryList} />
    {#if activeAuctions == 0}
      <p class="text-center">There is no active auctions.</p>
    {/if}
  </div>
</div>

<style>
  .auctions_list{
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    gap: 20px;
    margin: 32px 0;
  }
  @media (max-width: 992px) {
    .auctions_list{
      margin: 16px 0;
    }
  }
</style>