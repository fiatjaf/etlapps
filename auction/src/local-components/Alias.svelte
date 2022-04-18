<script>
  import {onMount, getContext} from 'svelte'
  import account from '../../../components/etleneumAccountStore'
  import PayToCall from '../../../components/PayToCall.svelte'
  import {state} from '../helpers'
  
  const alias_contract = getContext('alias_contract')
  const aliasesStore = getContext('aliases')
  
  var userAliasesArray = []
  aliasesStore.subscribe(aliases => {
    userAliasesArray = aliases[$account.id]
  })

  var user_contact

  var call
  const unsetCall = getContext('unset-call')
  onMount(() => {
    return unsetCall(() => {
      call = null
    })
  })

  async function set_alias(e) {
    call = await alias_contract.prepareCall(
      'add',
      0,
      {alias: user_contact},
      $account.session
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

  async function delete_alias(e) {
    call = await alias_contract.prepareCall(
      'delete',
      0,
      {alias: user_contact},
      $account.session
    )

    state.update(st => {
      st.call = call
      return st
    })
  }

  function cancel() {
    call = null
  }

</script>

<div class="user_alias">
  <p>Please leave your contact data email/telegram. <br>Note: this data will be open for everyone</p> 
  <label style="display: block;">
    <input
      type="text"
      style="display: block; margin: auto;width:auto;"
      bind:value={user_contact}
      required
    />
  </label>
  {#if call}
    <div class="call">
      <PayToCall {call} on:cancel={cancel} />
    </div>
  {:else}
  <button on:click={set_alias}> Set Alias </button>  
  <button on:click={delete_alias}> Delete Alias </button>
  {/if}

  <h4>List of your aliases:</h4>
  {#each userAliasesArray || [] as alias}
    <p>{alias}</p>
    {:else}
    <p>You still haven't any aliases</p>
  {/each}
</div>

<style>
  .user_alias{
    background: #fff;
    margin: 32px 0;
    padding: 32px;
    text-align: center;
  }
</style>