<script>
  import QR from 'svelte-kjua'

  import * as toast from '../../common/toast'
  import {account, s4a} from './stores'
  import Question from './Question.svelte'

  var target
  var question
  var sats = 100 + parseInt(Math.random() * 1000)
  var call

  s4a.stream(
    id => {
      if (call && id === call.id) {
        toast.success('Success!')
        call = null
        question = ''
      }
    },
    (id, err) => {
      if (call && id === call.id) {
        toast.warning(`Error: ${err}`)
        call = null
      }
    }
  )

  async function prepareQuestion(e) {
    e.preventDefault()
    try {
      call = await s4a.prepareCall(
        'ask',
        sats * 1000,
        {question: question, answerer_keybase: target},
        $account.session
      )
    } catch (err) {
      toast.error(`Failed to ask: ${err}`)
    }
  }
</script>

<div>
  {#if $account.id && !call}
    <div id="ask">
      <form on:submit={prepareQuestion}>
        <label
          >Asking to: <input
            bind:value={target}
            placeholder="Type a keybase.io username."
          /></label
        >
        <label
          >Paying:
          <input type="number" min="100" bind:value={sats} />
          satoshi</label
        >
        <label>Question: <textarea bind:value={question} /></label>
        <button>Ask</button>
      </form>
    </div>
  {:else if call}
    <div id="ask">
      <a href="lightning:{call.invoice}"><QR value={call.invoice} /></a>
      <div class="wrap">{call.invoice}</div>
      <p>Pay to make the question</p>
    </div>
  {/if}

  <div id="questions-columns">
    {#if $s4a.lastUnanswered.length > 0}
      <section>
        <h2>Last unanswered questions</h2>
        {#each $s4a.lastUnanswered as id}
          <Question question={$s4a.byId[id]} />
        {/each}
      </section>
    {/if}
    {#if $s4a.lastAnswers.length > 0}
      <section>
        <h2>Last answers</h2>
        {#each $s4a.lastAnswers as id}
          <Question question={$s4a.byId[id]} />
        {/each}
      </section>
    {/if}
  </div>
</div>

<style>
  #ask {
    padding: 18px;
    background-color: rgba(255, 255, 255, 0.3);
  }
  #ask label,
  #ask button {
    margin: 10px;
    display: grid;
    grid-template-columns: 120px auto 100px;
    align-items: center;
  }
  #questions-columns {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
  }
  section {
    margin: 23px 0;
    width: 48%;
    min-width: 400px;
  }
  section h2 {
    color: var(--emphasis-rare);
    margin-left: 38px;
  }
</style>
