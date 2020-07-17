<!-- @format -->

<script>
  import {createEventDispatcher} from 'svelte'
  import QR from 'svelte-kjua'

  const dispatch = createEventDispatcher()

  export let invoice
  export let color = '#333'
  export let background = 'transparent'

  let hrp = invoice
    .split('1')
    .slice(0, -1)
    .join('')
  let numbers = 0
  try {
    numbers = hrp.match(/\d+/)[0].length
  } catch (err) {}
  let multiplier = hrp[hrp.length - 1]
  let isNegligible =
    (multiplier === 'n' && numbers <= 3) || (multiplier === 'p' && numbers <= 5)

  function dispatchCancel(e) {
    e.preventDefault()
    dispatch('cancel')
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
  .cancel {
    margin-top: 23px;
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
  <button class="cancel" on:click="{dispatchCancel}">Cancel</button>
</div>
