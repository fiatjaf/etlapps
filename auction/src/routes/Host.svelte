<!-- @format -->
<script>
  import {onMount, setContext, getContext} from 'svelte'
  import {writable} from 'svelte/store'
  import * as toast from '../../../common/toast'

  import AuctionList from '../local-components/AuctionsList.svelte'

  export let hostId;

  const contract = getContext('contract')

  const userAuctionsStore = writable({})

  onMount(loadUserAuctions)

  async function loadUserAuctions() {
    try {
      var nowTime = new Date()
      var now_timestamp = Math.round(nowTime.getTime() / 1000)
      var auctions = await contract.state(`[. | to_entries[] | {"key": .key, "value": .value |  select( (.end_datetime < ${now_timestamp}) and (.creator_id == "${hostId}") and (.top_bider_id != "${hostId}") ) }] | from_entries`)
      if (Array.isArray(auctions)) {
        auctions = {}
      }
      userAuctionsStore.set(auctions)
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
      var lotteries = await loto_contract.state(`[. | to_entries[] | {"key": .key, "value": .value |  select(.state == false and (.creator_id == "${hostId}") )}] | from_entries`)
      if (Array.isArray(lotteries)) {
        lotteries = {}
      }
      lotteriesStore.set(lotteries)
    } catch (err) {
      toast.error(`Error loading loto contract: ${err}`)
    }
  }

  var lotteryList = []
  lotteriesStore.subscribe(auctions => {
    lotteryList = Object.keys(auctions)
      .map(id => ({id, ...auctions[id]}))
      .sort((a, b) => a.end_datetime - b.end_datetime && b.state > a.state )
  })

  var auctionList = []
  userAuctionsStore.subscribe(auctions => {
    auctionList = Object.keys(auctions)
      .map(id => ({id, ...auctions[id]}))
      .sort((a, b) => b.end_datetime - a.end_datetime )
  })

  const aliasesStore = getContext('aliases')
  var userAliases = []

  aliasesStore.subscribe(aliases => {
    const userAliasesArr = aliases[hostId]
    userAliases = [...new Set(userAliasesArr)];
  })

  $: totalFinished = auctionList.length + lotteryList.length;

</script>

<div class="singleHost">
  <h4 class="host_id">{hostId}</h4>
  <div class="user_aliases">
    <p class="text-center">List of user aliases:
    {#each userAliases || [] as alias}
      {alias} &nbsp;
      {:else}
      User haven't any aliases
    {/each}
    </p>
  </div>
  <div class="archived_auctions">
    <h3 class="text-center">Host Succesfully Finished Auctions ({totalFinished})</h3>
    <div class="auctions_list">
      <AuctionList source={auctionList} />
      <AuctionList source={lotteryList} />
      {#if totalFinished == 0}
        <p class="text-center">User haven't finished auctions</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .singleHost{
    background: var(--background-secondary);
    padding: 12px;
  }
  .host_id{
    word-wrap: anywhere;
    text-align: center;
  }
  .archived_auctions{
    margin: 50px 0;
  }

  .auctions_list{
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    gap: 20px;
    margin: 32px 0;
  }
</style>
