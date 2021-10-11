<script>
  import {createEventDispatcher} from 'svelte'
  import QR from 'svelte-kjua'
  import store from './etleneumAccountStore'

  const dispatch = createEventDispatcher()

  export let qrsize
  export let call
  export let color = '#333'
  export let background = 'transparent'

  let {method, msatoshi, payload, invoice} = call
  let isNegligible = msatoshi < 10

  function dispatchCancel(e) {
    e.preventDefault()
    dispatch('cancel')
  }

  async function payWithBalance(e) {
    e.preventDefault()

    if (!method) {
      toast.warning('you must select a method to call!')
      return
    }

    let qs = `?session=${$store.session}&use-balance=true`

    let r = await fetch(window.etleneum + '/~/contract/' + call.contract_id + '/call' + qs, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        method,
        msatoshi,
        payload
      })
    })

    //let resp = await r.json()

    if (!r.ok) {
      toast.warning(r.error)
      return
    }

    // ReferenceError: resetNextCall is not defined. there is no such function in repository. it was probably deprecated
    //resetNextCall()
  }
</script>

<div class="center">
  <p>Pay to finish the operation.</p>
  {#if isNegligible}
    <small
      title="For anti-spam reasons every method call on Etleneum is always charged a small fee, unrelated to the amount of satoshis included in the call."
      >Why do I have to pay?</small
    >
  {/if}
  <a href="lightning:{invoice}" style="background-color: {background}">
    <QR value={invoice} {color} size="{qrsize}"/>
  </a>
  <div class="invoice">{invoice}</div>
  <div class="button-wrapper">
    {#if $store.balance >= msatoshi}
      <button on:click={payWithBalance}>Pay with Etleneum balance</button>
    {/if}
    <button on:click={dispatchCancel}>Cancel</button>
  </div>
</div>

<style>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  small {
    cursor: pointer;
    cursor: help;
  }
  .invoice {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: break-all;
    padding: 20px;
    font-family: monospace;
    background: rgba(206, 203, 183, 0.2);
    font-size: 80%;
    margin: 0 20%;
  }
  button {
    margin-top: 23px;
  }
  .button-wrapper {
    display: flex;
  }
</style>
