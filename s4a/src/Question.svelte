<script>
  import QR from 'svelte-kjua'

  import * as toast from '../../common/toast'
  import Funders from './Funders.svelte'

  export let question
  import {account, kad, s4a} from './stores'

  var addingFunds = 100
  var answering = ''
  var showFunders = false
  var call

  s4a.stream(
    id => {
      if (call && id === call.id) {
        toast.success('Success!')
        call = null
        answering = ''
      }
    },
    (id, err) => {
      if (call && id === call.id) {
        toast.warning(`Error: ${err}`)
        call = null
      }
    }
  )

  function toggleFunders(e) {
    e.preventDefault()
    showFunders = !showFunders
  }

  async function prepareAddFunds(e) {
    e.preventDefault()
    try {
      call = await s4a.prepareCall(
        'add_funds',
        addingFunds * 1000,
        {question_id: question.id, answerer_keybase: question.target},
        $account.session
      )
    } catch (err) {
      toast.error(`Failed to add funds: ${err}`)
    }
  }

  async function prepareRemoveFunds(e) {
    e.preventDefault()
    try {
      call = await s4a.prepareCall(
        'remove_funds',
        0,
        {question_id: question.id, answerer_keybase: question.target},
        $account.session
      )
    } catch (err) {
      toast.error(`Failed to remove funds: ${err}`)
    }
  }

  async function prepareAnswer(e) {
    e.preventDefault()
    try {
      call = await s4a.prepareCall(
        'answer',
        0,
        {question_id: question.id, answer: answering},
        $account.session
      )
    } catch (err) {
      toast.error(`Failed to answer: ${err}`)
    }
  }

  $: funders = Object.keys(question.funds).map(f => ({
    funder: f,
    amount: question.funds[f]
  }))
</script>

{#if question.answer}
  <div class="answer">
    <b>{question.question}</b>
    <p>
      <a href="#/{question.target}">{question.target}</a>
      <a href="https://keybase.io/{question.target}" target="_blank"
        ><img src="/keybase.png" alt="keybase icon" /></a
      >: <span class="writing">{question.answer}</span>
    </p>
    Awarded
    <em on:click={toggleFunders}>{parseInt(question.bounty / 1000)} sat</em>
    {#if showFunders}<Funders {funders} />{/if}
  </div>
{:else}
  <div class="question">
    <div>
      Asked to <a href="#/a/{question.target}">{question.target}</a>
      <a
        href="https://keybase.io/{question.target}"
        target="_blank"
        title="Click to answer"><img src="/keybase.png" alt="keybase icon" /></a
      >
      for
      <em on:click={toggleFunders}>{parseInt(question.bounty / 1000)} sat</em>
      {#if showFunders}<Funders {funders} />{/if}
    </div>
    <p class="writing">{question.question}</p>
    <div
      class="action"
      class:answerer={$kad.kbFromId[$account.id] == question.target}
    >
      {#if call}
        <a href="lightning:{call.invoice}"><QR value={call.invoice} /></a>
        <div class="wrap">{call.invoice}</div>
      {:else if $account.id}
        <!---->
        {#if $kad.kbFromId[$account.id] == question.target}
          <form on:submit={prepareAnswer}>
            <textarea bind:value={answering} /><button>Answer</button>
          </form>
        {:else}
          <form on:submit={prepareAddFunds}>
            <input type="number" min="100" bind:value={addingFunds} /><button>
              Add funds
            </button>
          </form>
          {#if $account.id in question.funds}
            <div>
              <button on:click={prepareRemoveFunds}> Remove funds </button>
            </div>
          {/if}
          <!---->
        {/if}
      {/if}
    </div>
  </div>
{/if}

<style>
  .answer,
  .question {
    width: 100%;
    padding: 20px;
    font-size: 80%;
    margin: 40px 20px;
  }
  .answer:hover,
  .question:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  .writing {
    font-family: sans-serif;
    font-size: 80%;
    margin: 7px 2px;
  }
  .action {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 0;
    overflow: hidden;
  }
  .question:hover .action,
  .action.answerer {
    height: auto;
  }
  .action > * {
    margin: 0 10px;
  }
  .answerer form,
  .answerer textarea {
    display: block;
    width: 100%;
  }
  p {
    margin-top: 2px;
  }
  b {
    font-size: 1.1rem;
    color: var(--emphasis);
  }
</style>
