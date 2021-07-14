<script>
  import {onMount} from 'svelte'
  import debounce from 'debounce'
  import {Contract, Account} from 'etleneum'
  import {readable} from 'svelte/store'
  import QR from 'svelte-kjua'

  import Auth from '../../components/Auth.svelte'
  import {CONTRACT, NAME} from './constants'
  import * as toast from '../../common/toast'

  const etleneumAccount = Account()
  const account = readable(etleneumAccount, set =>
    etleneumAccount.subscribe(set)
  )

  const contract = Contract(CONTRACT)

  var accountFromKeybase
  var keybaseFromAccount
  var list
  var challenge
  var bundle = ''
  var keybase_name = ''
  var suggestions = []
  var call
  var errmessage

  const exampleBundle = `-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

73a1c52164efadb5194f7af75d71de1ccc0aa58586b8accc4f0a36ed49da27a4
-----BEGIN PGP SIGNATURE-----
Version: Keybase OpenPGP v2.1.3
Comment: https://keybase.io/crypto

wsBcBAABCgAGBQJdrR2oAAoJEAJs7pbOl+xqQA0H/32xUyVE+GSxsJ5xN1IbbBsK
eZH7H2IqQ+VTWUcS1x2JprsfKWlZ9Eks3mWpSOG6Jb9TUX08t+JAMS56uZNU5zeX
wN5i3Cc6V9R7q0Nzk/b2Z7wsZfuyhoxF/ybCnYy4Mj5NnkIo+yt44+s3L3MA1aEg
nkcg9JeJHzdu/jwQ4Lc6StJ8d3OV+7igQo8Ax0aAFV7pS3tSg3upqd6M5JtmiuIq
4lkU4NkaGGMJTnpCcUajn+z9isUUyQR5B+sMI3w7Q6jNZ0FRe7NAVKxl3d6QfwA9
pDYxl6ZWEnVSWjqM6V2Rncu1zR4g83++z8bqWrK2FBm8EzTHUVDPChPwEzFHLrQ=
=LcDv
-----END PGP SIGNATURE-----`

  onMount(loadContract)

  async function loadContract() {
    try {
      let state = await contract.state()
      challenge = state.challenge

      accountFromKeybase = state.identities
      delete accountFromKeybase['_']
      keybaseFromAccount = {}
      list = []
      for (let kb in accountFromKeybase) {
        keybaseFromAccount[accountFromKeybase[kb]] = kb
        list.push(kb)
      }
    } catch (err) {
      toast.error(`Failed to get contract: ${err}`)
    }
  }

  const autocompleteKeybase = debounce(async () => {
    let res = await fetch(
      'https://keybase.io/_/api/1.0/user/autocomplete.json?q=' + keybase_name
    )
    if (res.ok) {
      let {completions} = await res.json()
      suggestions = completions.map(c => c.components.username.val)
    }
  })

  async function action(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'link',
        0,
        {
          keybase_name,
          bundle
        },
        $account.session
      )

      let stop = contract.stream(
        id => {
          if (id === call.id) {
            toast.success('Success!')
            call = null
            setTimeout(stop, 1)
            loadContract()
          }
        },
        (id, err) => {
          if (id === call.id) {
            toast.warning('Error! Please reload to try again!')
            setTimeout(stop, 1)
            errmessage = err
          }
        }
      )
    } catch (err) {
      toast.warning(`Failed to prepare Etleneum call: ${err}`)
    }
  }

  function logout(e) {
    e.preventDefault()
    etleneumAccount.reset()
  }
</script>

<div class="center">
  <div>
    <h1>{NAME}</h1>
    <p>
      A place to create and search for identity links between Keybase accounts
      and the
      <a href="https://etleneum.com/">Etleneum</a> ecosystem.
    </p>
  </div>

  <div id="auth"><Auth account={etleneumAccount} /></div>

  {#if errmessage}
    <div>
      <h2>Error</h2>
      <div class="wrap">{errmessage}</div>
    </div>
  {:else if $account.id && keybaseFromAccount[$account.id]}
    <div>
      <h2>You are linked already</h2>
      <p>
        You are <em>{$account.id}</em> on Etleneum and
        <em>{keybaseFromAccount[$account.id]}</em> on Keybase.
      </p>
      <button on:click={logout}>Disconnect from Etleneum</button>
    </div>
  {:else if challenge}
    <div>
      <h2>Link myself</h2>
      {#if call}
        <p>Pay to finish the operation:</p>
        <a href="lightning:{call.invoice}"><QR value={call.invoice} /></a>
        <div class="wrap">{call.invoice}</div>
      {:else}
        <label>Keybase username: <input bind:value={keybase_name} /></label>
        {#if $account.id}
          <p>
            Visit
            <a href="https://keybase.io/sign" target="_blank"
              >https://keybase.io/sign</a
            >, sign the message <em>{challenge}</em>, copy the result and paste
            here. When using GPG, pass the option --clear-sign so it produces an
            output in the way we expect here.
          </p>
          <textarea bind:value={bundle} placeholder={exampleBundle} />
        {/if}
        <button disabled={!bundle || !keybase_name} on:click={action}>
          Link
        </button>
      {/if}
    </div>
  {/if}
  {#if list}
    <div id="list">
      <h2>Linked accounts</h2>
      {#each list as kb (kb)}
        <div class="item">
          <div class="kb">
            <a href="https://keybase.io/{kb}" target="_blank">{kb}</a>
          </div>
          <div class="etleneum">
            {accountFromKeybase[kb]}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    loading
  {/if}
</div>

<style>
  h1 {
    color: var(--emphasis-rare);
    text-shadow: 1px 1px 1px white;
  }
  #list {
    width: 600px;
  }
  .item {
    padding: 2px 4px;
    margin: 1px 0;
    display: flex;
    width: 100%;
  }
  .item:hover {
    background: var(--background-secondary);
    color: var(--color-secondary);
  }
  .item .kb {
    width: 49%;
  }
  .item .etleneum {
    width: 49%;
  }
  a[href^='lightning'] {
    display: block;
  }
  textarea {
    width: 461px;
    height: 389px;
  }
  button {
    font-size: 1.2rem;
    margin: 18px 0;
    padding: 4px 12px;
    display: block;
  }
  #auth {
    padding: 20px;
    transition: 0.2s ease-out background-color;
  }
  #auth:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
</style>
