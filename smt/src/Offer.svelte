<script>
  import {onMount, getContext} from 'svelte'
  import {push} from 'svelte-spa-router'

  import account from '../../components/etleneumAccountStore'
  import PayToCall from '../../components/PayToCall.svelte'
  import * as toast from '../../common/toast'

  const contract = getContext('contract')
  const kbaccounts = getContext('kbaccounts')

  export let params
  let offer
  let completing = null
  let completedTxt = ''
  let call
  let bounty = 0

  onMount(loadOffer)

  async function loadOffer() {
    try {
      offer = await contract.state(
        `[.open["${params.offer_id}"]] + [.closed["${params.offer_id}"]] | .[0]`
      )
      offer.completions = offer.completions || {}
      bounty = Object.keys(offer.bounty).reduce(
        (acc, u) => acc + offer.bounty[u],
        0
      )
    } catch (err) {
      toast.error(`Failed to load offer: ${err}`)
    }
  }

  async function addFunds(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'fund',
        parseInt(e.target.satoshis.value) * 1000,
        {taskid: params.offer_id},
        $account.session
      )

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Funds added!')
            call = null
            satoshis = 0
            // setTimeout(call.stop, 1);
            // loadBanner();
            loadOffer()
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

  async function startCompleting(e) {
    e.preventDefault()
    completing = true
  }

  async function sendCompletion(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'complete',
        0,
        {taskid: params.offer_id, content: completedTxt},
        $account.session
      )

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Completion sent!')
            call = null
            // satoshis = 0;
            // setTimeout(call.stop, 1);
            // loadBanner();
            completedTxt = ''
            completing = false
            loadOffer()
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
      toast.warning(`Failed to send completion: ${err}`)
    }
  }

  async function vote(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'award',
        0,
        {taskid: params.offer_id, completer: e.target.dataset.completer},
        $account.session
      )

      call.stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Vote sent!')
            call = null
            push('/')
            // satoshis = 0;
            // setTimeout(call.stop, 1);
            // loadBanner();
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
      toast.warning(`Failed to send vote: ${err}`)
    }
  }

  function cancel() {
    call.stop()
    call = null
  }

  function percentCount(p) {
    let width = (p / bounty) * 100
    // console.log(width)
    return width
  }
</script>

<main class="container grid-lg">
  <ul class="breadcrumb">
    <li class="breadcrumb-item">
      <a href="#/">Home</a>
    </li>
    <li class="breadcrumb-item">
      <span class="text-primary">{params.offer_id}</span>
    </li>
  </ul>
  {#if call}
    <PayToCall call={call} on:cancel={cancel} />
  {:else if offer}
    <h1>{offer.head}</h1>
    <div id="offer">
      {#if offer.desc}
        <p>{offer.desc}</p>
      {/if}
      <p class="text-gray">
        Created on {new Date(offer.created_at * 1000).toGMTString()}.
      </p>
      <p>
        Bounty for this job:
        <b>
          {Object.keys(offer.bounty).reduce(
            (acc, u) => acc + offer.bounty[u],
            0
          ) / 1000}sat
        </b>
      </p>
      <section class="columns">
        <div class="column col-6 col-sm-12">
          <p>Sponsors:</p>
          <div class="bar">
            {#each Object.keys(offer.bounty).sort((a, b) => a - b) as acct, i}
              <div
                class="bar-item tooltip"
                data-tooltip={`${
                  acct in $kbaccounts ? $kbaccounts[acct] : acct
                }\n${offer.bounty[acct] / 1000}sat`}
                style={`width:${percentCount(
                  offer.bounty[acct]
                )}%;background:rgba(87,
          85, 217, ${i === 0 ? 1 : (1 - i / 5).toFixed(2)})`}
              >
                {`${acct in $kbaccounts ? $kbaccounts[acct] : acct}`}
              </div>
            {/each}
          </div>
          <div>
            <p>
              Contract can be resolved by
              <em>{offer.needed} / {offer.voters.length}</em>
              of the sponsors.
              <small>
                [{offer.voters
                  .map(acct => (acct in $kbaccounts ? $kbaccounts[acct] : acct))
                  .join(' ')}]
              </small>
            </p>
          </div>
        </div>
        <div class="column col-6 col-sm-12">
          <p>Become a sponsor:</p>
          <form on:submit={addFunds}>
            <div class="input-group">
              <span class="input-group-addon">sats</span>
              <input
                type="number"
                name="satoshis"
                class="form-input"
                value="1000"
              />
              <button class="btn btn-primary input-group-btn">add funds</button>
            </div>
            {#if !$account.id}
              <p class="form-input-hint">
                anonymously, or
                <a href="#/account">login</a>
              </p>
            {/if}
          </form>
        </div>
      </section>

      <div class="columns">
        <div class="column col-6 col-sm-12">
          {#if !Object.keys(offer.completions).length}
            <div class="empty">
              <div class="empty-icon">
                <i class="icon icon-people" />
              </div>
              <p class="empty-title h5">No one has completed this</p>
              <p class="empty-subtitle">Did you completed this task?</p>
              {#if !$account.id}
                <div class="empty-action">
                  <a class="btn btn-primary" href="#/account">Log In</a>
                </div>
              {/if}
              {#if !completing && $account.id}
                <div class="empty-action">
                  <button class="btn btn-primary" on:click={startCompleting}>
                    I Completed!
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <div class="bg-gray">
              <div class="completion">
                <header class="empty-title h5 mb-2">Completions</header>
                {#each Object.keys(offer.completions) as completer}
                  <em>
                    <b>
                      {completer in $kbaccounts
                        ? $kbaccounts[completer]
                        : completer}
                    </b>
                  </em>
                  <p>
                    {offer.completions[completer].content}
                    <br />
                    <small>
                      {new Date(
                        offer.completions[completer].time * 1000
                      ).toGMTString()}
                    </small>
                  </p>
                  {#if $account && offer.voters.indexOf($account.id) !== -1}
                    <button
                      class="btn btn-primary"
                      on:click={vote}
                      data-completer={completer}
                    >
                      Vote
                    </button>
                  {/if}
                  <div class="divider" />
                {/each}
                {#if !$account.id}
                  <a class="btn btn-primary" href="#/account">Log In</a>
                {/if}
                {#if !completing && $account.id}
                  <button class="btn btn-primary" on:click={startCompleting}>
                    I Completed!
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
        {#if $account.id && completing}
          <div class="column col-6 col-sm-12">
            <div class="form-group">
              <label class="form-label" for="completion-form">
                Write a brief description, links or any other info that can be
                used to assess your completion of this project:
              </label>
              <textarea
                class="form-input"
                id="completion-form"
                rows="3"
                name="content"
                bind:value={completedTxt}
              />
            </div>
            <div class="form-group">
              <button class="btn btn-success" on:click={sendCompletion}>
                Send
              </button>
              <button
                class="btn btn-error"
                on:click={() => {
                  completing = false
                  completedTxt = ''
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else if offer === null}
    <p>Offer {params.offer_id} doesn't exist.</p>
  {/if}
</main>

<style>
  section {
    margin-bottom: 2rem;
  }
</style>
