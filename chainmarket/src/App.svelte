<script>
  import {setContext} from 'svelte'
  import {Contract} from 'etleneum'

  import Index from './Index.svelte'
  import Foot from '../../components/Footer.svelte'
  import Auth from '../../components/Auth.svelte'

  const CONTRACT = 'c8w0c13v75'

  setContext('contract', Contract(CONTRACT))
</script>

<main>
  <header>
    <h1>
      <img alt="logo" style="height: 1em;" src="chain.png" />
      <a href="#/">ChainMarket</a>
    </h1>
    <p>A Lightning to onchain swap market with batched transactions</p>
  </header>
  <Index />
  <div id="login">
    <Auth qrsize="300" />
  </div>
</main>
<Foot name="ChainMarket" contract={CONTRACT} />

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
