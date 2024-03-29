<script>
  import {getContext} from 'svelte'
  import shajs from 'sha.js'

  import {sha256, getBaseSecret, state} from './helpers'
  import PayToCall from '../../components/PayToCall.svelte'

  const contract = getContext('contract')

  var call
  var settings = {
    satoshi: 1000,
    correspondence: false,
    initial: 600,
    increment: 10,
    color: randomColor()
  }

  function randomColor() {
    return Math.random() < 0.5 ? 'black' : 'white'
  }

  function cancel() {
    call = null
  }

  async function createChallenge(e) {
    e.preventDefault()

    let params = new URLSearchParams()
    if (!settings.correspondence) {
      params.set('clock.limit', settings.initial)
      params.set('clock.increment', settings.increment)
      params.set('variant', 'standard')
      params.set(
        'fen',
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      )
    }
    let res = await (
      await fetch('https://lichess.org/api/challenge/open', {
        method: 'POST',
        body: params
      })
    ).json()

    let challengeid = 'c' + parseInt(Math.random() * 999999)

    state.update(st => {
      st.challenge = challengeid
      st.game = res.challenge.id
      return st
    })

    call = await contract.prepareCall(
      'openchallenge',
      settings.satoshi * 1000,
      {
        challenge: challengeid,
        gameid_hash: shajs('sha256').update(res.challenge.id).digest('hex'),
        color: settings.color === 'randomize' ? randomColor() : settings.color,
        secret_hash: sha256(sha256(getBaseSecret() + ':' + challengeid))
      }
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }
</script>

<main>
  {#if call}
    <PayToCall call={call} on:cancel={cancel} />
  {:else}
    <div>
      <iframe
        title="Lichess TV"
        src="https://lichess.org/tv/frame?theme=maple2&bg=light"
        style="width: 400px; height: 444px;"
        allowtransparency="true"
        frameborder="0"
      />
    </div>
    <form on:submit={createChallenge}>
      <h3>Create a challenge</h3>
      <label>
        Amount (satoshis)
        <input
          type="number"
          min="100"
          max="100000"
          step="100"
          bind:value={settings.satoshi}
        />
      </label>
      <div>
        <label>
          No time limit
          <input
            type="radio"
            value={true}
            bind:group={settings.correspondence}
          />
        </label>
        <label>
          Timed
          <input
            type="radio"
            value={false}
            bind:group={settings.correspondence}
          />
        </label>
      </div>
      {#if !settings.correspondence}
        <label>
          Initial time:
          <input
            type="range"
            min="60"
            max="10800"
            step="60"
            bind:value={settings.initial}
          />
          {parseInt(settings.initial / 60)}m
        </label>
        <label>
          Increment:
          <input
            type="range"
            min="0"
            max="60"
            step="1"
            bind:value={settings.increment}
          />
          {settings.increment}s
        </label>
      {/if}
      <div>
        <label>
          Black
          <input type="radio" value="black" bind:group={settings.color} />
        </label>
        <label>
          White
          <input type="radio" value="white" bind:group={settings.color} />
        </label>
        <label>
          Random
          <input type="radio" value="randomize" bind:group={settings.color} />
        </label>
      </div>
      <button type="submit">Create</button>
    </form>
  {/if}
</main>

<style>
  main {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 20px 0;
  }
  main > * {
    margin: 0 20px;
  }
  form {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 20px;
  }
  h3 {
    padding: 0;
    margin: 0;
  }
  label {
    display: block;
    margin: 0 4px;
    text-align: center;
  }
  form > * {
    margin: 10px 0;
  }
  form div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
