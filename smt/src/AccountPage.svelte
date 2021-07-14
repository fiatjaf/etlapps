<script>
  import {onMount, getContext} from 'svelte'

  import account from '../../components/etleneumAccountStore'
  import Auth from '../../components/Auth.svelte'

  import Table from './Table.svelte'

  const contract = getContext('contract')
  let loading = true

  onMount(async () => {
    await account.subscribe(loadRelevantOffers)
    loading = false
  })

  let offers

  async function loadRelevantOffers() {
    offers = await contract.state(
      `
def bounty: . | to_entries | map(.value) | add;
def offer: .
  | { id
    , head
    , needed
    , created_at
    , bounty: (.bounty | bounty)
    , ncompletions: (.completions | length)
    , nvoters: (.voters | length)
    };

.
| { open: (.open | del(._) | to_entries | map(.value.id = .key | .value))
  , closed: (.closed | del(._) | to_entries | map(.value.id = .key | .value))
  }
| { offers:
    ( .open
    | map(select(.voters | contains(["${$account.id}"])))
    | map(offer)
    )
  , completions:
    ( .open
    | map(select(.completions.${$account.id} != null))
    | map(offer + {completion: (.completions.${$account.id})})
    )
  , contributions:
    ( .open
    | map(select(.bounty.${$account.id} != null))
    | map(offer + {contribution: (.bounty.${$account.id})})
    )
  , closed:
    ( .closed
    | map
      ( select
        (  ( .voters | contains(["${$account.id}"]) )
        or ( .completions.${$account.id} != null )
        or ( .bounty.${$account.id} != null )
        )
      )
    )
  }`
    )
  }
</script>

<main class="container grid-ld">
  <ul class="breadcrumb">
    <li class="breadcrumb-item">
      <a href="#/">Home</a>
    </li>
    <li class="breadcrumb-item">
      <span class="text-primary">account</span>
    </li>
  </ul>
  {#if !loading}
    {#if !$account.id}
      <Auth fluid qrsize="300" />
    {:else if offers}
      {#if offers.closed.length}
        <Table
          title="Closed"
          head={['Task', 'Bounty', 'Closed By', 'Closed At']}
          body={offers.closed.map(c => {
            return {
              id: c.id,
              task: c.head,
              bounty: `${
                Object.values(c.bounty).reduce((acc, c) => acc + c, 0) / 1000
              }sats`,
              closedBy: Object.keys(c.completions)
                .filter(v => c.completions[v].votes)
                .toString(),
              closedAt: new Date(c.awarded_at * 1000).toGMTString()
            }
          })}
        />
      {/if}
      {#if offers.completions.length}
        <Table
          title="Completions"
          head={['Task', 'Bounty', 'Created At']}
          body={offers.completions.map(c => {
            return {
              id: c.id,
              task: c.head.substring(0, 25) + '...',
              bounty: `${c.bounty / 1000}sats`,
              createdAt: new Date(c.completion.time * 1000).toGMTString()
            }
          })}
        />
      {/if}
      {#if offers.contributions.length}
        <Table
          title="Contributions"
          head={['Task', 'Bounty', 'Contribution', 'Created At']}
          body={offers.contributions.map(c => {
            return {
              id: c.id,
              task: c.head.substring(0, 25) + '...',
              bounty: `${c.bounty / 1000}sats`,
              contribution: `${c.contribution / 1000}sats`,
              createdAt: new Date(c.created_at * 1000).toGMTString()
            }
          })}
        />
      {/if}
      {#if offers.offers.length}
        <Table
          title="Offers"
          head={['Task', 'Bounty', 'Completions', 'Created At']}
          body={offers.offers.map(c => {
            return {
              id: c.id,
              task: c.head.substring(0, 25) + '...',
              bounty: `${c.bounty / 1000}sats`,
              completions: c.ncompletions,
              createdAt: new Date(c.created_at * 1000).toGMTString()
            }
          })}
        />
      {/if}
      <!-- -->
    {:else}
      <div class="empty">
        <div class="empty-icon">
          <i class="icon icon-people" />
        </div>
        <p class="empty-title h5">You have no activity yet</p>
        <p class="empty-subtitle">
          You can start by contributing to some offers.
        </p>
      </div>
    {/if}
  {:else}
    <p>loading...</p>
  {/if}
</main>

<style></style>
