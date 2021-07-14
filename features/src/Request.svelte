<script>
  import {CONTRACT} from './constants'

  import LNURLPayCall from '../../components/LNURLPayCall.svelte'

  export let data
  export let key
  export var opened = false

  function show(e) {
    e.preventDefault()
    opened = true
  }

  function hide(e) {
    e.preventDefault()
    opened = false
  }
</script>

<aside class="request" class:opened>
  <header>
    <div class="points button" on:click={show}>
      <div class="upvote" />
      {parseInt(data.msatoshi / 1000)}
    </div>
    <h2 on:click={show}>
      {data.name} <span class="issue_number">#{data.idx}</span>
    </h2>
    <button class="close" on:click={hide}>-</button>
  </header>
  {#if opened}
    <div class="description full">{data.description}</div>
    <div>
      <div class="centralize">
        <h3>Show your support!</h3>
        Send satoshis to this
        <a
          href="https://github.com/fiatjaf/awesome-lnurl#wallets"
          target="_blank"
        >
          lnurl-pay
        </a>
        address to give more weight to this feature request:
      </div>
      <LNURLPayCall
        method="contribute"
        payload={{key, idx: data.idx}}
        contract={CONTRACT}
        minSendable="100000"
      />
    </div>
  {:else}
    <div class="description hidden" on:click={show}>
      {data.description}
    </div>
    <div class="mask" on:click={show} />
    <span class="expand" on:click={show}>...</span>
  {/if}
</aside>

<style>
  .request {
    margin: 0.4rem;
    padding: 0.7rem;
    width: 95%;
    background-color: var(--background-main);
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  h2 {
    color: var(--emphasis);
    cursor: pointer;
    max-width: 300px;
  }
  .opened h2 {
    cursor: auto;
  }
  h3 {
    text-align: center;
  }
  .points {
    background: var(--background-secondary);
    color: var(--color-secondary);
  }
  .upvote {
    width: 0;
    height: 0;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid var(--color-secondary);
    margin: auto;
    margin-bottom: 3px;
    transition: all 0.1s ease-in-out;
  }
  .issue_number {
    color: var(--color-secondary);
    font-size: 75%;
    opacity: 0.3;
  }
  .opened .issue_number {
    opacity: 0.7;
  }
  .description {
    white-space: pre-wrap;
    font-family: monospace;
    color: #555;
    margin: 0 14px;
  }
  .description.hidden {
    height: 3em;
    overflow: hidden;
    z-index: 1;
  }
  .mask {
    position: absolute;
    z-index: 2;
    box-shadow: inset 0px -55px 50px -30px var(--background-main);
    transform: translateY(-3em);
    height: 3em;
  }
  .description,
  .mask {
    width: 500px;
  }
  .close {
    cursor: pointer;
    text-decoration: none;
    background-color: var(--background-main);
    color: var(--color-main);
    display: inline-block;
    visibility: hidden;
  }
  .opened .close {
    visibility: visible;
  }
  .expand {
    display: block;
    text-align: center;
    font-size: 3em;
    line-height: 1em;
    cursor: pointer;
  }
  .centralize {
    width: 340px;
    margin: 10px auto;
  }
</style>
