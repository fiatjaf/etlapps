<script>
  import {onMount, getContext} from 'svelte'
  import {replace} from 'svelte-spa-router'

  import {sha256, getBaseSecret, capitalize, state} from './helpers'

  import * as toast from '../../common/toast.js'
  import account from '../../components/etleneumAccountStore'
  import PayToCall from '../../components/PayToCall.svelte'
  import Auth from '../../components/Auth.svelte'

  const contract = getContext('contract')

  export let params

  var call
  var challengeid
  var gameid
  var challenge
  var winner = undefined
  var draw = false
  var ourside
  var pending
  var gamestarted

  try {
    let {c, g} = JSON.parse(atob(params.gamedescriptor))
    challengeid = c
    gameid = g
  } catch (err) {
    toast.warning('Challenge not found!')
    replace('/')
  }

  let secret = sha256(getBaseSecret() + ':' + challengeid)

  onMount(() => {
    state.set({challenge: challengeid, game: gameid})
  })

  onMount(loadChallenge)
  onMount(loadGame)
  onMount(() => {
    let intv = setInterval(() => {
      loadChallenge()
      loadGame()
    }, 30000)
    return () => clearInterval(intv)
  })

  async function loadChallenge() {
    try {
      challenge = await contract.state(`.["${challengeid}"]`)
    } catch (err) {
      toast.error(`Failed to load challenge: ${err}`)
      return
    }

    if (!challenge) {
      toast.warning('Challenge not found!')
      replace('/')
    }

    ourside =
      challenge.white === sha256(secret)
        ? 'white'
        : challenge.black === sha256(secret)
        ? 'black'
        : null

    pending = !challenge.white || !challenge.black
  }

  async function loadGame() {
    var res
    try {
      let r = await fetch(
        `https://lichess.org/game/export/${gameid}?moves=false&clocks=false&evals=false&opening=false&literate=false&pgnInJson=true`
      )

      if (r.status === 404) {
        throw new Error('404')
      }

      res = await r.text()
      try {
        res = atob(res)
      } catch (err) {}
    } catch (err) {
      // a 404 will produce a bizarre CORS error here
      if (
        challenge &&
        challenge.creation + 259200 < new Date().getTime() / 1000
      ) {
        gamestarted = true
        draw = true
        return
      } else {
        // game not started yet
        return
      }
    }

    gamestarted = true

    if (res.indexOf('[Result "1/2-1/2"]') !== -1) {
      draw = true
      return
    }
    if (res.indexOf('[Termination "Abandoned"]') !== -1) {
      draw = true
      return
    }

    let result = /\[Result "([^"]+)"\]/.exec(res)[1]
    switch (result) {
      case '1-0':
        winner = 'white'
        break
      case '0-1':
        winner = 'black'
        break
    }
  }

  function cancel() {
    call = null
  }

  async function acceptChallenge(e) {
    e.preventDefault()

    call = await contract.prepareCall('acceptchallenge', challenge.msatoshi, {
      challenge: challengeid,
      gameid: gameid,
      secret_hash: sha256(secret)
    })

    state.update(st => {
      st.call = call.id
      return st
    })
  }

  async function extractSats(e) {
    e.preventDefault()

    call = await contract.prepareCall(
      'extract',
      0,
      {
        challenge: challengeid,
        gameid: gameid,
        secret: secret
      },
      $account.session
    )

    state.update(st => {
      st.call = call.id
      return st
    })
  }
</script>

<div>
  {#if call}
    <PayToCall call={call} on:cancel={cancel} />
  {:else}
    <div>
      <h2>
        {#if ourside}
          Playing as <b>{ourside}</b>
        {:else if !pending}
          Not playing this game
        {:else}
          Open challenge
        {/if}
      </h2>

      {#if pending && !draw}
        <div>
          {#if ourside}
            <h3>This is an open challenge</h3>
            <p>
              Now you must have a friend to play against. Follow these steps.
            </p>
            <ol>
              <li>
                Open
                <a
                  href="https://lichess.org/{gameid}?color={ourside}"
                  target="_blank">the game on Lichess</a
                >
                on another tab and click to join the game.
              </li>
              <li>
                Share
                <input value={location.href} readonly class="challengeurl" />
                with the person you want to challenge.
              </li>
              <li>
                Wait for her to confirm the bet deposit (you should see a
                notification here).
              </li>
              <li>Play.</li>
              <li>
                If you win, come back here to this page to redeem your prize.
              </li>
            </ol>
          {:else}
            <form on:submit={acceptChallenge}>
              <p>
                Accept this challenge for {parseInt(challenge.msatoshi / 1000)} sat?
              </p>
              <button>Accept challenge</button>
            </form>
          {/if}
          <img alt="initial" src="/initial.png" />
        </div>
      {:else if !gamestarted}
        <h3>Bets are placed</h3>
        <p>Just proceed to play.</p>
        <ol>
          <li>
            Open
            <a
              href="https://lichess.org/{gameid}?color={ourside}"
              target="_blank">this Lichess URL</a
            >
            on another tab to play.
          </li>
          <li>If you win, come back here to this page to redeem your prize.</li>
        </ol>
        <img alt="initial" src="/initial.png" />
      {:else if !winner && !draw}
        <h3>The game has started</h3>
        <ol>
          <li>
            Open
            <a
              href="https://lichess.org/{gameid}?color={ourside}"
              target="_blank">this Lichess URL</a
            >
            on another tab to play.
          </li>
          <li>If you win, come back here to this page to redeem your prize.</li>
        </ol>
        <img alt="initial" src="/initial.png" />
      {:else if winner || draw}
        <div id="endgame">
          <iframe
            title="Game on Lichess"
            src="https://lichess.org/embed/{gameid}?theme=auto&bg=auto"
            style="width: 400px; height: 444px"
            frameborder="0"
          />
          <div>
            <p>
              {#if winner}
                <span>
                  {capitalize(winner)} has won. {capitalize(
                    winner === 'black' ? 'white' : 'black'
                  )} has lost.
                </span>
              {:else if draw}
                <span> No one has won. </span>
              {/if}
            </p>

            {#if winner === ourside}
              <p>You've won this game.</p>
            {:else if draw}
              <p>You can extract half of the satoshis.</p>
            {:else}
              <p>No satoshi for you.</p>
            {/if}

            <div>
              {#if winner === ourside || (!!ourside && draw)}
                <div>
                  {#if $account.id}
                    <button on:click={extractSats}>
                      Extract {parseInt(
                        challenge.msatoshi / 1000 / (draw && !pending ? 2 : 1)
                      )} satoshis to your Etleneum account.
                    </button>
                    <p>
                      You'll find the money on
                      <a href="https://etleneum.com/#/account" target="_blank"
                        >Etleneum</a
                      >. Just use the same login method.
                    </p>
                  {:else}
                    <p>Login to extract your satoshis from this game.</p>
                    <div id="login">
                      <Auth background="#ffffff" qrsize="300" />
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  h2 {
    text-align: center;
  }
  form {
    margin: 20px 0;
  }
  .challengeurl {
    display: inline;
    width: 250px;
    padding: 0 2px;
    background: var(--emphasis);
    margin: 0;
  }
  #endgame {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 20px 0;
  }
  #endgame > * {
    margin: 0 20px;
  }
</style>
