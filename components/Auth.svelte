

<script>
  import {afterUpdate} from 'svelte'
  import * as toast from '../common/toast'
  import QR from 'svelte-kjua'
  import PromiseWindow from 'promise-window'
  import store, {account} from './etleneumAccountStore'

  const SEEDAUTH = window.SEEDAUTH || 'https://seed-auth.etleneum.com'

  export let qrsize = (window.matchMedia("(max-width: 992px)").matches ? 200 : 300 )
  export let color = '#333'
  export let background = 'transparent'
  export let fluid = false

  var awaitingSeedAuth = false
  var popupBlocked = false

  afterUpdate(() => {
    if(!fluid) return

    const img = document.getElementsByTagName('img')
    if(img[0]){
      img[0].style.width = '100%'
      img[0].style.maxWidth = `${qrsize}px`
      img[0].style.height = 'auto'
    }
  })

  async function handleSeedAuth(e) {
    if (popupBlocked) {
      return
    } else {
      e.preventDefault()
    }

    awaitingSeedAuth = true
    try {
      await PromiseWindow.open(`${SEEDAUTH}/#/lnurl/${$store.lnurl.auth}`, {
        windowName: 'Login to etleneum.com',
        height: 500,
        width: 400
      })
    } catch (err) {
      if (err !== 'closed') {
        if (err === 'blocked') {
          popupBlocked = true
        }
        toast.warning(`${err}`)
        console.log(err)
      }
    }
    awaitingSeedAuth = false
  }

  function logout(e) {
    e.preventDefault()
    account.reset()
  }
</script>

<div class="widget">
  {#if awaitingSeedAuth}
  <div>
    <svg
      width="45"
      height="45"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#666"
    >
      <g
        fill="none"
        fill-rule="evenodd"
        transform="translate(1 1)"
        stroke-width="2"
      >
        <circle cx="22" cy="22" r="6" stroke-opacity="0">
          <animate
            attributeName="r"
            begin="1.5s"
            dur="3s"
            values="6;22"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            begin="1.5s"
            dur="3s"
            values="1;0"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-width"
            begin="1.5s"
            dur="3s"
            values="2;0"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="22" cy="22" r="6" stroke-opacity="0">
          <animate
            attributeName="r"
            begin="3s"
            dur="3s"
            values="6;22"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            begin="3s"
            dur="3s"
            values="1;0"
            calcMode="linear"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-width"
            begin="3s"
            dur="3s"
            values="2;0"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="22" cy="22" r="8">
          <animate
            attributeName="r"
            begin="0s"
            dur="1.5s"
            values="6;1;2;3;4;5;6"
            calcMode="linear"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  </div>
  {:else if !$store.id}
  <p>
    Login to Etleneum using an
    <a href="https://github.com/fiatjaf/awesome-lnurl#wallets" target="_blank"
      >lnurl-auth</a
    >-powered wallet:
  </p>
  <a
    class="qr"
    href="lightning:{$store.lnurl.auth}"
    style="background-color: {background}"
    >{#if $store.lnurl.auth}<QR
      value="{$store.lnurl.auth}"
      size="{qrsize}"
      color="{color}"
    />{/if}</a
  >
  <p>
    or using
    <a
      href="https://seed-auth.etleneum.com/#/lnurl/{$store.lnurl.auth}"
      on:click="{handleSeedAuth}"
      target="_blank"
      >login and password</a
    >.
  </p>
  {:else}
  <p>
    Logged as <em>{$store.id}</em> on
    <a href="https://etleneum.com/" target="_blank">etleneum.com</a>.
    <a href="https://etleneum.com/" class="logout" on:click="{logout}">Logout</a
    >.
  </p>
  {#if $store.balance}
  <a
    class="qr"
    href="lightning:{$store.lnurl.withdraw}"
    style="background-color: {background}"
  >
    <QR value="{$store.lnurl.withdraw}" size="{qrsize/2}" color="{color}" />
    Withdraw balance: {$store.balance/1000}sat
  </a>
  {/if} {/if}
</div>

<style>
  .widget {
    max-width: 100%;
    /*margin: 50px auto;*/
  }
  .qr {
    text-align: center;
    display: block;
  }
  p {
    text-align: center;
    word-wrap: break-word;
  }
  * {
    font-size: 90%;
  }
</style>
