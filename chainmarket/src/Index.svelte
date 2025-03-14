<script>
  import {onMount, getContext} from 'svelte'

  import account from '../../components/etleneumAccountStore'
  import * as toast from '../../common/toast'
  import PayToCall from '../../components/PayToCall.svelte'

  const contract = getContext('contract')

  onMount(loadOffers)
  onMount(startListening)
  onMount(getBlockchainTip)

  var queueElement
  var addrInURL
  try {
    let [k, v] = location.hash.slice(1).split('=')
    if (k === 'addr') {
      addrInURL = v

      if (addrInURL.indexOf('bitcoin:') !== -1) {
        addrInURL = addrInURL.slice(8)
      }

      onMount(() => {
        queueElement.scrollIntoView()
      })
    }
  } catch (err) {}

  var offers = {}
  var creating = {fee_sat: 34, addr: addrInURL}
  var txid = null
  var to_reserve = {}
  var feerate = 1
  var call
  var tip = 1

  $: offers_list = Object.keys(offers)
    .map(addr => ({...offers[addr], addr}))
    .map(offer => ({
      ...offer,
      reserved:
        offer.reserved && offer.reserved.upto > tip ? offer.reserved : null
    }))
    .sort((a, b) => a.fee_msat - b.fee_msat)
  $: to_reserve_list = Object.keys(to_reserve).filter(addr => to_reserve[addr])
  $: to_reserve_fees =
    to_reserve_list
      .map(addr => offers[addr].fee_msat)
      .reduce((a, b) => a + b, 0) / 1000
  $: to_reserve_mining_fee = to_reserve_list.length
    ? (to_reserve_mining_fee =
        feerate * (190 + 34 * (1 + to_reserve_list.length)))
    : 0
  $: reserved_to_me_list = offers_list.filter(
    ({reserved}) => account.id && reserved && reserved.to === account.id
  )

  async function loadOffers() {
    try {
      offers = await contract.state()
    } catch (err) {
      toast.error(`Failed to load open offers: ${err}`)
    }
  }

  function startListening() {
    contract.stream(
      async id => {
        loadOffers()

        let newCall = await contract.loadCall(id)
        console.log('got call notification', newCall)
        switch (newCall.method) {
          case 'queuepay':
            if (call && call.id === id) {
              console.log('your fofer')
              toast.info(`Your offer has been posted.`)
              creating = {}
            } else {
              console.log('nw tc')
              toast.info(`New transaction offer to ${newCall.payload.addr}!`)
            }
            break
          case 'reserve':
            if (call && call.id === id) {
              toast.info(
                `Addresses [${newCall.payload.addresses.join(
                  ' '
                )}] are now reserved to you for 6 blocks.`
              )
              to_reserve = {}
            } else {
              toast.info(
                `Someone has reserved addresses [${newCall.payload.addresses.join(
                  ' '
                )}].`
              )
            }
            break
          case 'txsent':
            if (call && call.id === id) {
              toast.info(`Your transaction has been accepted!`)
              txid = null
            } else {
              toast.info(`New transaction sent!`)
            }
            break
        }

        if (call && call.id === id) {
          call = null
        }
      },
      (id, errMessage) => {
        if (call && call.id === id) {
          toast.warning(`Your call failed: ${errMessage}`)
        } else {
          toast.warning(`A call from someone else failed: ${errMessage}`)
        }
      }
    )
  }

  async function queuepay(e) {
    e.preventDefault()

    let {target_sat, fee_sat, addr} = creating
    let total_sat = target_sat + fee_sat

    try {
      call = await contract.prepareCall('queuepay', total_sat * 1000, {
        fee_msat: fee_sat * 1000,
        addr
      })
    } catch (err) {
      toast.warning(`Failed to prepare call: ${err}`)
    }
  }

  async function reserve(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall(
        'reserve',
        to_reserve_list.length * 100000,
        {addresses: to_reserve_list},
        $account.session
      )
    } catch (err) {
      toast.warning(`Failed to prepare call: ${err}`)
    }
  }

  async function txsent(e) {
    e.preventDefault()

    try {
      call = await contract.prepareCall('txsent', 0, {txid}, $account.session)
    } catch (err) {
      toast.warning(`Failed to prepare call: ${err}`)
    }
  }

  function cancel() {
    call = null
  }

  async function getBlockchainTip() {
    try {
      tip = await (
        await fetch('https://blockstream.info/api/blocks/tip/height')
      ).json()
    } catch (err) {
      toast.warning(`Failed to load blockchain tip: ${err}`)
    }
  }

  function scrollToLogin(e) {
    e.preventDefault()
    document.getElementById('login').scrollIntoView()
  }
</script>

<div>
  {#if call}
    <PayToCall {call} on:cancel={cancel} />
  {:else}
    <h2>How it works, in short</h2>
    <ol>
      <li>
        Multiple people submit Lightning transactions naming onchain addresses
        and specific amounts they want to pay, these submissions stand floating
        as pending offers
      </li>
      <li>
        Someone sends an onchain transaction fulfilling all pending offers and
        gets the money that was parked on ChainMarket
      </li>
    </ol>
    <img
      src="/scheme.png"
      alt="~"
      style="width: 80%; display: block; margin: auto;"
    />
    <p>
      Before making transactions, please make sure to read about the details by
      hovering the 🛈 icons below and examining the
      <a href="https://etleneum.com/#/contract/c8w0c13v75"
        >description and code</a
      >
      that powers this automated market.
    </p>
    <h2 id="queue" bind:this={queueElement}>
      <span class="role maker">[ maker ]</span> Queue a payment
      <span
        data-wenk="Your payment will be pending until someone decides to fulfill it: which means to send a transaction with exact amounts to the onchain address and take the sats."
        data-wenk-length="large">&#x1f6c8;</span
      >
    </h2>
    <form id="queue" on:submit={queuepay}>
      <label>
        Bitcoin address: <input type="text" bind:value={creating.addr} />
      </label>
      <label>
        Amount to send (sat):
        <input
          step="1"
          min="0"
          type="number"
          bind:value={creating.target_sat}
        />
      </label>
      <label>
        Fee to include (sat):
        <input step="1" type="number" bind:value={creating.fee_sat} />
      </label>
      <button>Post</button>
    </form>

    <div>
      {#if offers_list.length}
        <div
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <h2>
            <span class="role taker">[ taker ]</span>
            Open offers
            <span
              data-wenk="These are funded offers waiting for someone to fulfill onchain and earn the fees. Select the ones you intend to fulfill and proceed to reserve them before actually broadcasting the transaction."
              data-wenk-length="large">&#x1f6c8;</span
            >
          </h2>
          <label style="display: flex; align-items: center;">
            <input
              min="1"
              max="100"
              step="1"
              bind:value={feerate}
              type="range"
            />
            <span style="width: 105px">fee: {feerate} sat/vb</span>
          </label>
        </div>
        <table id="offers">
          <thead>
            <tr>
              <th>reserve</th>
              <th>fee</th>
              <th>addr</th>
              <th>amount</th>
            </tr>
          </thead>
          <tbody>
            {#each offers_list as offer (offer.addr)}
              <tr
                class:to_reserve={to_reserve[offer.addr]}
                class:fee_too_low={!offer.reserved &&
                  !offer.waiting &&
                  offer.fee_msat / 1000 < 34 * feerate}
                class:reserved={offer.reserved || offer.waiting}
              >
                <td>
                  {#if offer.reserved}
                    <span
                      data-wenk="Reserved to {offer.reserved
                        .to} until block {offer.reserved.upto}"
                      data-wenk-pos="right"
                    >
                      🔒 <small>{offer.reserved.upto}</small>
                    </span>
                  {:else if offer.waiting}
                    <span
                      data-wenk="Waiting for a transaction to confirm."
                      data-wenk-pos="right"
                    >
                      &#8987;
                    </span>
                  {:else}
                    <input
                      id="offer-{offer.addr}"
                      type="checkbox"
                      bind:checked={to_reserve[offer.addr]}
                    />
                  {/if}
                </td>
                <td>
                  <label for="offer-{offer.addr}">
                    {(offer.fee_msat / 1000).toFixed(3)}
                  </label>
                </td>
                <td>
                  <label for="offer-{offer.addr}">
                    {offer.addr}
                  </label>
                </td>
                <td>
                  <label for="offer-{offer.addr}">
                    {offer.sat}
                  </label>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>

    <div>
      <h2>
        <span class="role taker">[ taker ]</span>
        Reserve checked offers
        <span
          data-wenk="After reserving, you'll have 6 blocks of guaranteed priority in fulfilling these onchain. Send a batched transaction paying exact amounts to each of the reserved addresses, then come back here immediately and notify this app with transaction id using the form below."
          data-wenk-length="large">&#x1f6c8;</span
        >
      </h2>
      <form id="reservation" on:submit={reserve}>
        <table>
          <tr>
            <td>Satoshis to send:</td>
            <td>
              <b
                >{to_reserve_list
                  .map(addr => offers[addr].sat)
                  .reduce((a, b) => a + b, 0)}</b
              >
            </td>
          </tr>
          <tr>
            <td>Fees to earn:</td>
            <td>
              <b>{to_reserve_fees.toFixed(3)}</b>
            </td>
          </tr>
          <tr>
            <td>Roughly estimated mining fee (for 1 input):</td>
            <td>
              <b>{to_reserve_mining_fee.toFixed(0)}</b> (at {feerate}sat/vb)
            </td>
          </tr>
          <tr>
            <td>Estimated profit:</td>
            <td>
              <b
                class:profit={to_reserve_fees - to_reserve_mining_fee > 0}
                class:loss={to_reserve_fees - to_reserve_mining_fee < 0}
                >{(to_reserve_fees - to_reserve_mining_fee).toFixed(3)}</b
              >
            </td>
          </tr>
          <tr>
            <td>Satoshis to stake:</td>
            <td><b>{to_reserve_list.length * 100}</b></td>
          </tr>
        </table>

        <div>
          {#if reserved_to_me_list.length}
            <b>
              You must publish a transaction containing the following outputs at
              least:
            </b>
            <table>
              {#each reserved_to_me_list as offer}
                <tr>
                  <td>{offer.addr}</td>
                  <td>{offer.sat}</td>
                </tr>
              {/each}
            </table>
          {/if}
        </div>

        {#if $account.id}
          <button>Reserve</button>
        {:else}
          <button on:click={scrollToLogin}>
            Login first to be able to notify
          </button>
        {/if}
      </form>
    </div>

    <h2>
      <span class="role taker">[ taker ]</span>
      Notify a transaction was broadcasted
      <span
        data-wenk="After sending the transaction that fulfills the reserved offers, you must send the transaction id here, otherwise you'll lose everything. There's no recourse. The offers will be reserved to you until the transaction is confirmed on the blockchain (in which case you'll receive the sats in your account) or it is not in the mempool anymore."
        data-wenk-length="large">&#x1f6c8;</span
      >
    </h2>
    <p>
      Wallets that support sending to multiple addresses in the same
      transaction:
      <a href="https://sbw.app/" target="_blank">SimpleBitcoinWallet</a>,
      <a href="https://www.sparrowwallet.com" target="_blank">Sparrow</a>,
      <a href="https://bluewallet.io" target="_blank">BlueWallet</a>,
      <a href="https://electrum.org" target="_blank">Electrum</a>,
      <a href="https://docs.specter.solutions/desktop/" target="_blank"
        >Specter</a
      >,
      <a href="https://github.com/LightningNetwork/lnd" target="_blank">lnd</a>,
      <a href="https://github.com/ElementsProject/lightning/" target="_blank"
        >c-lightning</a
      >, <a href="https://bitcoincore.org/" target="_blank">Bitcoin Core</a>,
      <a href="https://samouraiwallet.com/" target="_blank">Samourai</a>.
    </p>
    <form id="notify" on:submit={txsent}>
      <label> Transaction ID: <input bind:value={txid} /> </label>
      {#if $account.id}
        <button>Notify</button>
      {:else}
        <button on:click={scrollToLogin}
          >Login first to be able to notify</button
        >
      {/if}
    </form>
  {/if}
</div>

<style>
  .role {
    font-family: monospace;
    font-size: 90%;
    opacity: 0.7;
  }
  .role.taker {
    color: #074dff;
  }
  .role.maker {
    color: #ffce2f;
    text-shadow: white 1px 1px 3px;
  }

  #offers {
    width: 100%;
  }
  #offers tr:not(.to_reserve) {
    opacity: 0.8;
  }
  #offers tr:not(.to_reserve):hover {
    opacity: 1;
  }
  #offers tr.to_reserve {
    background: var(--background-secondary);
  }
  #offers tr.fee_too_low {
    background: var(--emphasis-rare);
    opacity: 0.7;
  }
  #offers tr.reserved {
    cursor: not-allowed;
    opacity: 0.5;
  }
  #offers tr * {
    cursor: inherit;
  }
  #offers td {
    padding: 4px 7px;
    text-align: center;
  }

  #queue {
  }
  #queue label {
    display: block;
    margin: 3px 0;
  }
  #queue input[type='text'] {
    width: 57%;
  }
  #queue input[type='number'] {
    width: 100px;
  }

  #reservation {
  }
  #reservation td {
    padding: 0 8px;
  }
  #reservation td:nth-child(1) {
    text-align: right;
  }
  #reservation .profit {
    color: var(--emphasis);
  }
  #reservation .loss {
    color: var(--emphasis-rare);
  }
</style>
