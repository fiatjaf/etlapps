<script>
  import {setContext} from 'svelte'
  import Router from 'svelte-spa-router'
  import {Contract} from 'etleneum'
  import Index from './Index.svelte'
  import Offer from './Offer.svelte'
  import AccountPage from './AccountPage.svelte'
  import Foot from './Footer.svelte'
  
  import kbAccountStore from '../../components/kbAccountStore'

  const CONTRACT = 'c4g4e71a5g'

  const routes = {
    '/': Index,
    '/account': AccountPage,
    '/:offer_id': Offer
  }

  setContext('contract', Contract(CONTRACT))
  setContext('kbaccounts', kbAccountStore)

</script>

<main>
  <Router {routes} />
</main>
<Foot name="Reverse Crowdfunding" contract="{CONTRACT}" />
