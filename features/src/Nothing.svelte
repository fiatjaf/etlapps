<script>
  import {NAME, CONTRACT} from './constants'
</script>

<div>
  <slot />
  <p>Nothing to see here.</p>
  <p>
    Go to the
    <a href={'https://etleneum.com/#/contract/' + CONTRACT}>{NAME}</a>
    contract page on Etleneum to create a page for your project to get paid feature
    requests.
  </p>
</div>

<style>
  div {
    width: 300px;
    height: 200px;
    margin: 200px auto;
  }
</style>
