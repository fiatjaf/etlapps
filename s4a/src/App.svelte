<script>
  import Router from 'svelte-spa-router'
  import {onMount} from 'svelte'
  import Auth from '../../components/Auth.svelte'

  import {NAME, CONTRACT} from './constants'
  import {etleneumAccount, account, kad, s4a} from './stores'
  import Index from './Index.svelte'
  import Answerer from './Answerer.svelte'
  import Asker from './Asker.svelte'

  const routes = {
    '/': Index,
    '/a/:username': Answerer,
    '/q/:etlaccount': Asker
  }
</script>

<div class="center">
  <header>
    <div>
      <h1><a href="#/">{NAME}</a></h1>
      <p>
        {#if $account.id}
          <!---->
          {#if $account.id in $s4a.byAsker && $s4a.byAsker[$account.id].length}
            <a href="#/q/{$account.id}">Questions you've asked.</a>
          {/if}
          <!---->
          {#if $account.id in $kad.kbFromId && $kad.kbFromId[$account.id] in $s4a.byTarget && $s4a.byTarget[$kad.kbFromId[$account.id]].length}
            <a href="#/a/{$kad.kbFromId[$account.id]}"
              >Questions you've been asked.</a
            >
          {:else}
            To answer questions you first must link your Keybase account at
            <a href="https://kad.etleneum.com/">https://kad.etleneum.com/</a>.
          {/if}
          <!---->
        {:else}
          Offer bounties to finally get answers from people you want to know
          something from. Login to start.
          <!---->
        {/if}
      </p>
    </div>
    <Auth qrsize={200} account={etleneumAccount} />
  </header>
  <main><Router {routes} /></main>
  <footer>
    <b>{NAME}</b> is an
    <a href="https://etleneum.com/#/contract/{CONTRACT}" target="_blank"
      >Etleneum</a
    >
    contract. All its core functionalities are defined there within visible and immutable
    code you should read before calling methods here.
  </footer>
</div>

<style>
  h1 {
    font-family: sans-serif;
    color: var(--emphasis-rare);
    margin-right: 20px;
  }
  h1 a {
    color: inherit;
    text-decoration: none;
  }
  main {
    margin: 43px auto;
    min-height: 80vh;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  footer {
    margin-top: 18px;
    font-size: 0.9rem;
    background-color: var(--background-secondary);
    color: var(--color-secondary);
    width: 100vw;
    padding: 20px 50px 45px;
    transform: translateY(25px);
  }
</style>
