<script>
  import {onMount, getContext} from 'svelte'

  import Request from './Request.svelte'
  import Nothing from './Nothing.svelte'
  import {CONTRACT} from './constants'

  import PayToCall from '../../components/PayToCall.svelte'
  import * as toast from '../../common/toast'
  import kb from '../../common/kbAccountStore'

  const contract = getContext('contract')
  export let params

  const baseRequest = {
    name: '',
    satoshi: 5000,
    description: ''
  }

  var data
  var notfound = false
  var request = {...baseRequest}
  var call
  var elementCreate

  onMount(loadData)

  function cancel() {
    call = null
  }

  function cssURL(data) {
    if (!data) return ''

    let u = new URL(data.url)
    let url = u.protocol + '//' + u.host
    var path
    if (u.pathname.length && u.pathname[u.pathname.length - 1] === '/') {
      path = u.pathname.slice(0, -2)
    }
    path += '/feature-requests-etleneum.css'
    return url + path
  }

  onMount(() => {
    return contract.stream(
      id => {
        if (call && call.id === id) {
          call = null
          request = {...baseRequest}
        }
        toast.success('Call made successfully!')
        loadData()
      },
      (id, errMessage) => {
        if (call && call.id === id) {
          call = null
        }
        toast.warning(`Call failed: ${errMessage}`)
      }
    )
  })

  async function loadData() {
    try {
      data = await contract.state(`
          .["${params.key}"]
        | .requests = if .requests == {} then [] else .requests end
        | .requests =
          ( .requests
          | reduce .[] as $o
            ( []
            ; . +
              [ { idx: ((.[-1].idx // 0) + 1)
                } * $o
              ]
            )
          | map(select(.status == "open"))
          | sort_by(.msatoshi)
          | reverse
          | map(.opened = false)
          )
        `)
      if (!data) throw new Error('not found')
    } catch (err) {
      notfound = true
      toast.error(`Failed to load data: ${err}`)
    }
  }

  async function createRequest(e) {
    e.preventDefault()
    call = await contract.prepareCall('request', request.satoshi * 1000, {
      key: params.key,
      name: request.name,
      description: request.description
    })
    setTimeout(() => {
      elementCreate.scrollIntoView()
    }, 1)
  }
</script>

<svelte:head>
  {#if data}
    <title>{data.name} Feature Requests</title>
    <link rel="stylesheet" href={cssURL(data)} />
    <link href={data.logo} rel="icon" />
  {/if}
</svelte:head>

{#if data}
  <header>
    <a href="/{params.key}">
      {#if data.logo}<img alt="logo" src={data.logo} />{/if}
      <h1>&nbsp;{data.name}</h1>
    </a>
    <a href={data.url} target="_blank">Visit website</a>
  </header>
{/if}
<main>
  {#if notfound}
    <Nothing>
      <p>Data not found for <em>{params.key}</em></p>
    </Nothing>
  {:else if data}
    <section id="requests">
      <h2>Requested features</h2>
      {#each data.requests as req}
        <Request data={req} key={params.key} bind:opened={req.opened} />
      {:else}
        <p>No open requests.</p>
      {/each}
    </section>
    <div id="create" bind:this={elementCreate}>
      {#if call}
        <PayToCall background="#ffffff" {call} on:cancel={cancel} />
      {:else}
        <h2>Open a new feature request</h2>
        <form on:submit={createRequest}>
          <label>
            Title:
            <input
              bind:value={request.name}
              placeholder="Implement support for something"
              required
              maxlength="50"
            />
          </label>
          <label>
            Satoshis to include:
            <input type="number" bind:value={request.satoshi} min="1000" />
          </label>
          <label>
            Details:
            <textarea bind:value={request.description} />
          </label>
          <button>Create</button>
        </form>
      {/if}
    </div>
    <div id="ownership">
      <p>
        This project page is owned by account {#if $kb[data.owner]}<a
            href="https://keybase.io/{$kb[data.owner]}">{$kb[data.owner]}</a
          >{:else}<em>{data.owner}</em>{/if}. Make sure this person has the
        right to respond for <em>{data.name}</em> before continuing.
      </p>
      <p>
        To create a feature requests management page for your project, use
        <a href="https://etleneum.com/#/contract/{CONTRACT}"
          >a raw Etleneum <code>register</code> call</a
        >.
      </p>
    </div>
  {:else}
    <p>Loading...</p>
  {/if}
</main>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  header a {
    display: flex;
    align-items: center;
  }
  header img {
    height: 3em;
  }
  h1 {
    color: var(--emphasis-rare);
  }
  main {
    margin: 0 auto;
    padding-top: 0;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  #requests {
    flex-grow: 5;
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  #create {
    flex-grow: 1;
    margin: 10px;
    display: flex;
    flex-direction: column;
  }
  #ownership {
    width: 100%;
    margin: 10px auto 0;
    padding: 23px 23px 0;
  }
  textarea {
    min-height: 200px;
  }
  input,
  textarea {
    width: 90%;
  }
</style>
