<script>
  import {onMount, getContext} from 'svelte'
  import {readable} from 'svelte/store'

  import * as toast from '../../common/toast'

  const contract = getContext('contract')
  const kbaccounts = getContext('kbaccounts')

  onMount(loadBanners)

  var banners = []

  async function loadBanners() {
    try {
      banners = await contract.state(
        `.ad_queue as $q | .current_ads as $c | .banners | to_entries | map(select(.key != "_")) | map(.value.id = .key | .value) | map(.currently = if $q[.id] then $q[.id] | map(.msatoshi) | add else 0 end + if $c[.id] then $c[.id].msatoshi else 0 end) | sort_by(.currently) | reverse`
      )
    } catch (err) {
      toast.error(`Failed to get contract: ${err}`)
    }
  }
</script>

<div id="howitworks">
  <h2>How it works</h2>
  <p>
    <b>You have a website</b>, you want to get paid satoshis: you
    <a href="#/account">create an ad</a> and paste the supplied code snippet (or
    a custom version) somewhere in your website to show a banner. People will be
    able to pay the price you've chosen to get their ads showing up in your banner.
  </p>
  <p>
    <b>You want to advertise something</b>, you're willing to pay satoshis: you
    find a banner in the list below and checks if there's really a banner with
    the correct banner id at its URL. You go to he banner page and post the
    details of your ad -- either text or an image, and an URL -- and the amount
    you're paying. Your ad will begin to show right away, or be put in the
    queue.
  </p>
</div>
<div>
  <h2>Available banners</h2>
  {#each banners as banner (banner.id)}
    <div class="banner">
      <header>
        <a href="#/{banner.id}">{banner.id}</a>
        by {#if $kbaccounts[banner.account]}<a
            href="https://keybase.io/{$kbaccounts[banner.account]}"
            target="_blank">{$kbaccounts[banner.account]}</a
          >{:else}{banner.account}{/if}
      </header>
      <div>
        <em>{banner.url}</em> at
        <em>{parseInt((banner.msatoshi_per_hour * 24) / 1000)} sat per day</em>
      </div>
      <div>
        {#if banner.currently}
          {parseInt(banner.currently / 1000)} sat queued
        {:else}
          empty now
        {/if}
        <a href="#/{banner.id}" class="button">Advertise</a>
      </div>
    </div>
  {/each}
</div>
<h3><a href="#/account" class="button">Add or manage a banner</a></h3>

<style>
  .banner {
    margin-bottom: 10px;
  }
  .banner header {
    display: block;
    font-size: 80%;
  }
  .banner a.button {
    display: inline-block;
  }
  h3 {
    margin-top: 50px;
  }
  #howitworks b {
    color: var(--emphasis-rare);
  }
  h3 a.button {
    padding-top: 16px;
  }
</style>
