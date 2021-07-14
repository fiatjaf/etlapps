<script>
  import Router from 'svelte-spa-router'

  import {NAME, CONTRACT} from './constants'
  import Index from './Index.svelte'

  const routes = {
    '/': Index
  }
</script>

<main><Router {routes} /></main>
<footer>
  <b>{NAME}</b> is an
  <a href="https://etleneum.com/#/contract/{CONTRACT}" target="_blank"
    >Etleneum</a
  >
  contract. All its core functionalities are defined there within visible and immutable
  code you should read before calling methods here.
</footer>

<style>
  main {
    margin: 43px auto;
  }
  footer {
    width: 100%;
    margin-top: 18px;
    padding-top: 18px;
    font-size: 0.9rem;
  }
</style>
