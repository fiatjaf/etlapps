<script>
  import {onMount, getContext} from 'svelte'

  import account from '../../components/etleneumAccountStore'
  import * as toast from '../../common/toast'
  import PayToCall from '../../components/PayToCall.svelte'
  import Item from './Item.svelte'
  import Auth from '../../components/Auth.svelte'

  const contract = getContext('contract')
  const kbaccounts = getContext('kbaccounts')

  onMount(loadOffers)

  var offers = []
  var creating = {satoshis: 1000, payload: {}}
  var call

  async function loadOffers() {
    try {
      offers = await contract.state(
        `.open | map_values(select(. > 0)) | map_values({desc, head, total: ((.bounty | map(.) | add)), voters, created_at}) | to_entries | map(.value.id = .key | .value) | sort_by([.total, .created_at]) | reverse`
      )
    } catch (err) {
      toast.error(`Failed to load open offers: ${err}`)
    }
  }

  async function create(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'create',
        parseInt(creating.satoshis) * 1000,
        creating.payload,
        $account.session
      )

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Bounty created!')
            call = null
            creating = {satoshis: 1000, payload: {}}
            // setTimeout(call.stop, 1);
            // loadBanner();
            loadOffers()
          }
        },
        (id, err) => {
          if (id === call.id) {
            toast.warning('Error: ' + err.message)
            setTimeout(call.stop, 1)
          }
        }
      )
    } catch (err) {
      toast.warning(`Failed to create bounty: ${err}`)
    }
  }

  function cancel() {
    call.stop()
    call = null
  }
</script>

<main>
  <header class="hero bg-gray">
    <div class="container grid-lg">
      <div class="hero-body columns">
        <div class="column col-xs-12 col-8">
          <h1>
            <a href="#/">Somebody<br />Make<br />This</a>
          </h1>
          <p>reverse crowdfunding platform</p>
          {#if $account.id}
            <br />
            <small><a href="#/account">my account</a></small>
          {/if}
        </div>
        <div class="column col-xs-12 col-2-mx-auto">
          <Auth fluid qrsize={200} />
        </div>
      </div>
    </div>
  </header>
  <div class="container grid-lg">
    {#if call}
      <PayToCall invoice={call.invoice} on:cancel={cancel} />
    {:else}
      <h2>Open offers</h2>
      {#if offers.length}
        {#each offers as offer}
          <Item
            {offer}
            voters={offer.voters
              .map(acct => (acct in $kbaccounts ? $kbaccounts[acct] : acct))
              .join(' ')}
          />
        {/each}
      {:else}
        <div class="empty">
          <div class="empty-icon">
            <i class="icon icon-stop" />
          </div>
          <p class="empty-title h5">There's no open offers at the moment.</p>
          <p class="empty-subtitle">Come back later or open your own bellow</p>
        </div>
      {/if}
      <!-- <ul id="offers">
    {#each offers as offer}
    <li>
      <a class="title" href="#/{offer.id}">{offer.head}</a>
      <em>{parseInt(offer.total / 1000)} sat</em>
      <a class="button" href="#/{offer.id}">+</a> [<em class="voters"
        >{offer.voters.map(acct => acct in $kbaccounts ? $kbaccounts[acct] :
        acct).join(' ')}</em
      >] {(new Date(offer.created_at * 1000)).toISOString().split('T')[0]}
    </li>
    {/each}
  </ul> -->
      <div class="divider text-center" data-content="OR" />
      <h2>Create a bounty</h2>
      {#if $account.id}
        <form class="form-horizontal" on:submit={create}>
          <div class="form-group columns">
            <div class="column col-3 col-sm-12">
              <label class="form-label" for="input-task">Task</label>
            </div>
            <div class="column col-6 col-mr-auto col-sm-12">
              <input
                class="form-input"
                type="text"
                id="input-task"
                placeholder="Short task title"
                bind:value={creating.payload.head}
              />
            </div>
          </div>
          <div class="form-group columns">
            <div class="column col-3 col-sm-12">
              <label class="form-label" for="input-bounty">Bounty</label>
            </div>
            <div class="column col-6 col-mr-auto col-sm-12">
              <input
                class="form-input"
                type="number"
                id="input-bounty"
                placeholder="Satoshis to offer"
                bind:value={creating.satoshis}
              />
            </div>
          </div>
          <div class="form-group columns">
            <div class="column col-3 col-sm-12">
              <label class="form-label" for="input-desc">Description</label>
            </div>
            <div class="column col-6 col-mr-auto col-sm-12">
              <textarea
                class="form-input"
                id="input-desc"
                placeholder="Detailed description"
                bind:value={creating.payload.desc}
              />
            </div>
          </div>
          <button class="btn btn-primary">Create</button>
        </form>
        <!-- <form id="create" on:submit="{create}">
    <label>Task: <input bind:value="{creating.payload.head}"/></label>
    <label
      >Satoshis to offer:
      <input bind:value="{creating.satoshis}" type="number" />
    </label>
    <label>
      Detailed description:
      <textarea bind:value="{creating.payload.desc}"></textarea>
    </label>
    <button>Create</button>
  </form> -->
      {:else}
        <p>Login to be able to create a bounty!</p>
      {/if}
    {/if}
  </div>
</main>

<style>
  main {
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 1.75rem;
    line-height: 1.4;
    text-transform: uppercase;
    font-weight: bold;
  }

  .divider {
    margin: 2rem auto;
  }
</style>
