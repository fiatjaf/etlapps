

<script>
  import {createEventDispatcher} from 'svelte'
  import QR from 'svelte-kjua'
  import bech32 from 'bech32'

  const dispatch = createEventDispatcher()

  export let color = '#333'
  export let background = 'transparent'
  export let contract
  export let method
  export let payload
  export let amount = null
  export let minSendable = null
  export let maxSendable = null

  $: lnurl = lnurlpay(contract, method, payload, amount)

  function lnurlpay(contract, method, payload, amount) {
    let amountpath = amount ? `/${amount}` : ''

    var url = new URL(
      `https://etleneum.com/lnurl/contract/${contract}/call/${method}${amountpath}`
    )
    var qs = new URLSearchParams()
    for (let k in payload) {
      qs.set(k, payload[k])
    }

    if (minSendable) qs.set('_minsendable', minSendable)
    if (maxSendable) qs.set('_maxsendable', maxSendable)

    url.search = qs.toString()

    return bech32.encode(
      'lnurl',
      bech32.toWords(
        url
          .toString()
          .split('')
          .map(l => l.charCodeAt(0))
      ),
      5000
    )
  }
</script>

<style>
  .center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
</style>

<div class="center">
  <a href="lightning:{lnurl}" style="background-color: {background}">
    <QR value="{lnurl.toUpperCase()}" color="{color}" />
  </a>
  <div class="wrap">{lnurl}</div>
</div>
