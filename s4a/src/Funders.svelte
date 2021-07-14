<script>
  import {kad} from './stores'

  export let funders
</script>

<table>
  {#each funders as a (a.funder)}
    <tr>
      <th>
        <a href="#/q/{a.funder}">{a.funder}</a>
        {#if a.funder in $kad.kbFromId}
          ({$kad.kbFromId[a.funder]}
          <a href="https://keybase.io/{$kad.kbFromId[a.funder]}" target="_blank"
            ><img src="/keybase.png" alt="keybase icon" /></a
          >){/if}
      </th>
      <td>{parseInt(a.amount / 1000)} sat</td>
    </tr>
  {/each}
</table>

<style>
  td {
    color: var(--emphasis);
  }
</style>
