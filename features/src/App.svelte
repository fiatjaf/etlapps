<script>
  import {setContext} from 'svelte'
  import {Router, Route} from 'yrv'
  import {Contract} from 'etleneum'

  import {NAME, CONTRACT} from './constants'
  import Domain from './Domain.svelte'
  import Nothing from './Nothing.svelte'
  import Foot from '../../components/Footer.svelte'

  setContext('contract', Contract(CONTRACT))
</script>

<Router>
  <Route fallback exact>
    <Nothing />
  </Route>
  <Route path="/:key" let:router>
    <Domain params={router.params} />
  </Route>
</Router>
<Foot name={NAME} contract={CONTRACT} />

<style>
  :global(body) {
    width: 990px;
  }
</style>
