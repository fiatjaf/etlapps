<!-- @format -->

<script>
  import {createEventDispatcher} from 'svelte'
  import QR from 'svelte-kjua'

  import store from './etleneumAccountStore'

  const dispatch = createEventDispatcher()

  export let invoice
  export let color = '#333'
  export let background = 'transparent'

const MULTIPLIERS = {
  m: 100000000,
  u: 100000,
  n: 100,
  p: 0.1,
}

  let hrp = invoice.split('1').slice(0, -1).join('')
  let numbers = 0
  try {
    numbers = hrp.match(/\d+/)[0].length
  } catch (err) {}
  let multiplier = hrp[hrp.length - 1]
  let msatoshi = Math.round(MULTIPLIERS[multiplier] * numbers)
  let isNegligible = msatoshi < 10

  function dispatchCancel(e) {
    e.preventDefault()
    dispatch('cancel')
  }

  async function payWithBalance(e) {
    e.preventDefault()

    let {method, msatoshi, payload} = nextcall

    if (!method) {
      toast.warning('you must select a method to call!')
      return
    }

    let qs = `?session=${$store.session}&use-balance=true`

    let r = await fetch('/~/contract/' + params.ctid + '/call' + qs, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        method,
        msatoshi,
        payload
      })
    })
    let resp = await r.json()

    if (!resp.ok) {
      toast.warning(resp.error)
      return
    }

    resetNextCall()
  }
</script>

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
  .wrap {
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

<div class="center">
  <p>Pay to finish the operation.</p>
  {#if isNegligible}
  <small
    title="For anti-spam reasons every method call on Etleneum is always charged a small fee, unrelated to the amount of satoshis included in the call."
    >Why do I have to pay?</small
  >
  {/if}
  <a href="lightning:{invoice}" style="background-color: {background}">
    <QR value="{invoice}" color="{color}" />
  </a>
  <div class="wrap">{invoice}</div>
  <div class="button-wrapper">
    {#if $store.balance >= msatoshi}
    <button on:click="{payWithBalance}">Pay with Etleneum balance</button>
    {/if}
    <button on:click="{dispatchCancel}">Cancel</button>
  </div>
</div>
