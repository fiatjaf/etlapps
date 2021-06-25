<script>
  import {countShares} from './helpers'

  export let market
</script>

<header>
  <h2>{market.terms}</h2>
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
</header>

<style>
  header aside {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  header aside > * {
    margin: 2px 4px;
    padding: 1px 2px;
    transition: all 0.2s ease-in-out;
  }
  header aside > *:not(:hover) {
    background-color: var(--background-main);
    color: var(--links);
  }
  header h2 {
    text-align: center;
  }
</style>
