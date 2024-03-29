<script>
  import {onMount, getContext} from 'svelte'
  import {Account} from 'etleneum'
  import PayToCall from '../../components/PayToCall.svelte'

  import * as toast from '../../common/toast'
  import Auth from '../../components/Auth.svelte'
  import account from '../../components/etleneumAccountStore'

  const contract = getContext('contract')

  var accountBanners = []
  var call

  onMount(() => {
    account.subscribe(loadBanners)
  })

  async function loadBanners() {
    try {
      accountBanners = await contract.state(
        `.ad_queue as $q | .current_ads as $c | .banners | to_entries | map(select(.key != "_")) | map(.value.id = .key | .value) | map(select(.account == "${$account.id}")) | map(.queue = $q[.id] | .current = $c[.id])`
      )
    } catch (err) {
      toast.error(`Failed to load your banners: ${err}`)
    }
  }

  async function setBanner(e) {
    e.preventDefault()

    let url = e.target.url.value
    let msatoshi_per_hour = parseInt(
      (parseInt(e.target.price.value) * 1000) / 24
    )

    try {
      call = await contract.prepareCall(
        'place_banner',
        0,
        {msatoshi_per_hour, url},
        $account.session
      )

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Success!')
            call = null
            setTimeout(call.stop, 1)
            loadBanners()
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
      toast.warning(`Failed to add banner: ${err}`)
    }
  }

  function cancel() {
    call.stop()
    call = null
  }
</script>

<section>
  <div id="auth"><Auth /></div>
</section>
{#if accountBanners.length > 0}
  <section>
    <h3>Your banners</h3>
    <div>
      {#each accountBanners as banner}
        <div>
          <a href="#/{banner.id}">{banner.id}</a>
          ({((banner.msatoshi_per_hour * 24) / 1000).toFixed(3)} sat/day) at
          <em>{banner.url}</em>
        </div>
      {/each}
    </div>
  </section>
{/if}
<section>
  {#if call}
    <div>
      <PayToCall call={call} on:cancel={cancel} />
    </div>
  {:else if $account.id}
    <h3>Add a new banner</h3>
    <form on:submit={setBanner}>
      <label>URL: <input name="url" /></label>
      <label>Price (satoshis per day): <input name="price" /></label>
      <button>Add</button>
    </form>
  {:else}
    <p>Authorize above to add banners and access existing banner data.</p>
  {/if}
</section>

<style>
  section {
    margin: 40px 0;
  }
  label,
  button {
    display: block;
    margin: 7px 0;
  }
</style>
