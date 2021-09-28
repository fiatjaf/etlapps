<script>
  import {onMount, getContext} from 'svelte'
  import PayToCall from '../../components/PayToCall.svelte'

  import * as toast from '../../common/toast'
  import {makeSnippet} from './widget'

  const contract = getContext('contract')
  const kbaccounts = getContext('kbaccounts')
  export let params

  onMount(loadBanner)

  var banner
  var useImage
  var satoshis = 0
  var call
  var width = parseInt(localStorage.getItem(`${params.banner_id}:width`) || 500)
  var height = parseInt(
    localStorage.getItem(`${params.banner_id}:height`) || 200
  )
  var showWidget = false

  function toggleWidget(e) {
    e.preventDefault()
    showWidget = !showWidget
  }

  function saveWidth(e) {
    width = e.target.value
    localStorage.setItem(`${params.banner_id}:width`, width)
  }

  function saveHeight(e) {
    height = e.target.value
    localStorage.setItem(`${params.banner_id}:height`, height)
  }

  function toggleImage(e) {
    useImage = e.target.value === 'image' && e.target.checked
  }

  async function loadBanner() {
    try {
      banner = await contract.state(
        `.current_ads.${params.banner_id} as $c | .ad_queue.${params.banner_id} as $q | .banners.${params.banner_id} | .current = $c | .queue = if ($q | length) > 0 then $q else [] end`
      )
    } catch (err) {
      toast.error(`Failed to load banner ${params.banner_id}: ${err}`)
    }
  }

  async function queueAd(e) {
    e.preventDefault()

    let msatoshi = satoshis * 1000
    let data = {id: params.banner_id, link: e.target.link.value.trim()}

    if (useImage) {
      data.image_url = e.target.image.value.trim()
    } else {
      data.text = e.target.text.value.trim()
    }

    try {
      call = await contract.prepareCall('queue_ad', msatoshi, data)

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Success!')
            call = null
            satoshis = 0
            setTimeout(call.stop, 1)
            loadBanner()
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
      toast.warning(`Failed to queue ad: ${err}`)
    }
  }

  function cancel() {
    call.stop()
    call = null
  }
</script>

{#if banner}
  <h2>
    Banner at <em>{banner.url}</em> by {#if $kbaccounts[banner.account]}<a
        href="https://keybase.io/{$kbaccounts[banner.account]}"
        target="_blank">{$kbaccounts[banner.account]}</a
      >{:else}{banner.account}{/if}
  </h2>
  <section>
    <b>Price:</b>
    {((banner.msatoshi_per_hour * 24) / 1000).toFixed(3)} sat per day
  </section>
  <section>
    <b>Currently showing:</b>
    {#if banner.current}
      <dl>
        <dt>Link:</dt>
        <dd>{banner.current.link}</dd>
        {#if banner.current.text}
          <dt>Text:</dt>
          <dd>{banner.current.text}</dd>
        {/if}
        {#if banner.current.image_url}
          <dt>Image:</dt>
          <dd>{banner.current.image_url}</dd>
        {/if}
      </dl>
      until<em>{new Date(banner.current.end_time * 1000).toUTCString()}</em>.
    {:else}
      nothing.
    {/if}
  </section>
  <section>
    <b>Next in queue:</b>
    <ol>
      {#each banner.queue as banner}
        <li>{banner.link} for {(banner.seconds / 60 / 60).toFixed(1)} hours</li>
      {:else}
        none.
      {/each}
    </ol>
  </section>
  <section>
    <b>Queue an ad:</b>
    {#if call}
      <PayToCall call={call} on:cancel={cancel} />
    {:else}
      <form on:submit={queueAd}>
        <label>Link: <input name="link" type="url" /></label>
        <div class="switch">
          <label>
            Use an image
            <input
              name="imageortext"
              value="image"
              type="radio"
              on:click={toggleImage}
              selected
            />
          </label>
          <label>
            Use text
            <input
              name="imageortext"
              value="text"
              type="radio"
              on:click={toggleImage}
            />
          </label>
        </div>
        {#if useImage === true}
          <label>Image URL: <input name="image" type="url" /></label>
        {:else if useImage === false}
          <label>Text: <input name="text" /></label>
        {/if}
        <label
          >Satoshis: <input bind:value={satoshis} type="number" /> (buys
          {((satoshis * 1000) / banner.msatoshi_per_hour).toFixed(1)} hours)</label
        >
        <small>
          Before paying for an ad visit {banner.url} and verify if the banner is
          there. Also check the banner size so you can tweak you ad text or image
          to fit it decently.
        </small>
        <button>Queue</button>
      </form>
    {/if}
  </section>
  <section class="widget">
    <b>Embed code:</b> <button on:click={toggleWidget}>toggle</button>
    {#if showWidget}
      <form>
        <label
          >Width <input
            type="number"
            on:input={saveWidth}
            value={width}
          /></label
        >
        x
        <label
          ><input type="number" on:input={saveHeight} value={height} />
          Height</label
        >
      </form>
      <pre>
    <code>{makeSnippet(params.banner_id, width, height)}</code>
  </pre>
    {/if}
  </section>
{:else}
  loading banner {params.banner_id}
{/if}

<style>
  section {
    margin: 20px 20px;
    padding: 25px 20px;
    background-color: var(--background-secondary);
    color: var(--color-secondary);
    border-radius: 20px;
  }
  dt {
    color: var(--emphasis);
  }
  dd {
    font-family: monospace;
  }

  section:not(.widget) label,
  section:not(.widget) button {
    display: block;
    margin: 7px 0;
  }

  section.widget form {
    font-family: sans-serif;
    font-size: 70%;
    margin-top: 20px;
  }
  section.widget input {
    width: 60px;
  }

  button {
    background-color: var(--background-main);
    color: var(--color-main);
  }
  .switch label {
    display: inline-block;
  }
</style>
