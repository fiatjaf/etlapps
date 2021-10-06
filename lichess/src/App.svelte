<script>
  import {setContext} from 'svelte'
  import {Contract} from 'etleneum'
  import Router, {push} from 'svelte-spa-router'

  import Index from './Index.svelte'
  import Game from './Game.svelte'
  import {state} from './helpers'

  import * as toast from '../../common/toast'
  import Foot from '../../components/Footer.svelte'

  const CONTRACT = 'c4w191fezu'

  const contract = Contract(CONTRACT)
  setContext('contract', contract)

  const routes = {
    '/': Index,
    '/:gamedescriptor': Game
  }

  contract.stream(
    async id => {
      let newCall = await contract.loadCall(id)

      if ($state.call.id === id) {
        let gamedescriptor = btoa(
          JSON.stringify({c: $state.challenge, g: $state.game})
        )

        switch (newCall.method) {
          case 'openchallenge':
            // we've created a challenge
            toast.success(`Your challenge was created.`)
            push(`/${gamedescriptor}`)
            break
          case 'acceptchallenge':
            // we've accepted a challenge
            toast.success(`You've accepted a challenge.`)
            push('/')
            setTimeout(() => {
              push(`/${gamedescriptor}`)
            }, 500)
            break
          case 'extract':
            // we've extracted money
            toast.success('Satoshis extracted successfully!')
            setTimeout(() => {
              toast.info(
                'We will redirect you to Etleneum now so you can withdraw them to your wallet.'
              )
            }, 2000)
            setTimeout(() => {
              location.href = 'https://etleneum.com/#/account'
            }, 7000)
        }
      } else if (
        newCall.method === 'acceptchallenge' &&
        newCall.payload.challenge === $state.challenge
      ) {
        // someone has accepted our challenge
        toast.success(
          `Your adversary has accepted your challenge. You may start the game now!`
        )
      }
    },
    (id, errMessage) => {
      if ($state.call.id === id) {
        toast.warning(`Your call failed: ${errMessage}`)
      } else {
        toast.warning(`A call from someone else failed: ${errMessage}`)
      }
    }
  )
</script>

<main>
  <header>
    <h1>
      <img alt="logo" style="height: 1em;" src="lichess.svg" />
      <a href="#/">Lichess Challenge</a>
    </h1>
    <p>
      Challenge friends and bet on
      <a href="https://www.youtube.com/watch?v=QWCVEsbMsDU" target="_blank"
        >chess games</a
      >
    </p>
  </header>
  <main><Router {routes} /></main>
</main>
<Foot name="Lichess Challenge" contract={CONTRACT} />

<style>
  main {
    margin: 0 auto;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  header > h1 {
    flex-grow: 99999999;
    font-size: 4rem;
  }
  header > h1 a {
    text-decoration: none;
    color: var(--emphasis);
  }
  header > p {
    flex-shrink: 99999999;
    margin-left: 23px;
  }
</style>
