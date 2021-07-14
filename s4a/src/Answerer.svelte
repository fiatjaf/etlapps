<script>
  import {s4a} from './stores'
  import Question from './Question.svelte'

  export let params

  $: questions = $s4a.byTarget[params.username]
</script>

<h2>{params.username}</h2>

{#if !questions}
  <div class="center">loading</div>
{:else}
  <div>
    {#each questions as id (id)}
      <Question question={$s4a.byId[id]} />
    {/each}
  </div>
{/if}
