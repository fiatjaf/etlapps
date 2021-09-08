<script>
  import dateFormat from 'dateformat'

  import {countShares, marketImpliedProbability} from './helpers'

  export let market

  $: eventDate = market && new Date(market.date * 1000)
</script>

<div class="terms">
  <h2>{market.terms}</h2>
  <p>
    Event scheduled to happen at <span class="date"
      >{dateFormat(eventDate, 'mmmm d, yyyy')}</span
    >.
  </p>
</div>
<aside>
  <code>{countShares(market, 'yes')} yes</code>
  <code>{countShares(market, 'no')} no</code>
  <code
    >creation: {new Date(market.created * 1000)
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
  <code>{parseInt(market.balance / 1000)} sat</code>
  <code>event: {new Date(market.date * 1000).toISOString().split('T')[0]}</code>
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
    padding: 5px;
  }
  .terms h2 {
    margin: 0 0 12px;
  }
  .terms .date {
    text-decoration: underline;
    font-weight: bold;
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
