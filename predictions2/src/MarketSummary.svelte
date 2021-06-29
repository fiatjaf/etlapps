<script>
  import {countShares, marketImpliedProbability} from './helpers'

  export let market
</script>

<div class="terms">{market.terms}</div>
<aside>
  <code>{countShares(market, 'yes')} yes</code>
  <code>{countShares(market, 'no')} no</code>
  <code
    >created: {new Date(market.created * 1000)
      .toISOString()
      .split('T')[0]}</code
  >
  <code>lf {market.factor}</code>
  {#if market.lastexchange}
    <code
      >exchanged: {new Date(market.lastexchange * 1000)
        .toISOString()
        .split('T')[0]}</code
    >
    <code>{market.nexchanges} exchanges</code>
  {/if}
  {#if Object.keys(market.votes).length}
    <code>{Object.keys(market.votes).length} votes cast</code>
  {/if}
  <code>{parseInt(market.balance / 1000)} sat</code>
</aside>
<div>
  <div class="yes">
    <code>YES</code>
    {marketImpliedProbability(market, 'yes')}%
  </div>
  <div class="no">
    <code>NO</code>
    {marketImpliedProbability(market, 'no')}%
  </div>
</div>

<style>
  .terms {
    width: 40%;
  }
  aside {
    display: flex;
    width: 30%;
    flex-wrap: wrap;
  }
  aside > * {
    margin: 2px 4px;
    padding: 1px 2px;
    transition: all 0.2s ease-in-out;
  }
  aside > *:not(:hover) {
    background-color: var(--background-main);
    color: var(--links);
  }
  .yes,
  .no {
    font-size: 200%;
    margin: 0 1px;
    justify-self: stretch;
  }
  .yes code {
    background-color: var(--yes);
    color: white;
  }
  .no code {
    background-color: var(--no);
    color: black;
  }
</style>
