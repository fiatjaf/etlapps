<script>
  import {setContext} from 'svelte'
  import Router from 'svelte-spa-router'
  import {Contract} from 'etleneum'

  import {NAME, CONTRACT} from './constants'
  import Index from './Index.svelte'
  import Account from './Account.svelte'
  import Banner from './Banner.svelte'
  import Foot from '../../components/Footer.svelte'
  import kbAccountStore from '../../common/kbAccountStore'

  setContext('contract', Contract(CONTRACT))
  setContext('kbaccounts', kbAccountStore)

  const routes = {
    '/': Index,
    '/account': Account,
    '/:banner_id': Banner
  }
</script>

<main>
  <div>
    <h1><a href="#/">{NAME}</a></h1>
    <Router {routes} />
  </div>
</main>
<Foot name={NAME} contract={CONTRACT} />

<style>
  h1 {
    color: var(--emphasis-rare);
  }
  main {
    margin: 43px auto;
  }
  h1 a {
    text-decoration: none;
    color: inherit;
  }
</style>
