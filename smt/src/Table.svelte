<script>
  import {push} from 'svelte-spa-router'

  export let title
  export let head
  export let body

  function values(row) {
    var v = []
    for (let k in row) {
      if (k !== 'id') {
        v.push(row[k])
      }
    }
    return v
  }
</script>

<section>
  <h2>{title}</h2>
  <table class="table table-hover">
    <thead>
      <tr>
        {#each head as header}
          <th>{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each body as row}
        <tr on:click={() => push(`/${row.id}`)}>
          {#each values(row) as val}
            <td>{val}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  section {
    margin-top: 2em;
    margin-bottom: 3em;
  }

  tr {
    cursor: pointer;
  }
  tr:hover {
    background-color: #eff7ef;
  }
</style>
