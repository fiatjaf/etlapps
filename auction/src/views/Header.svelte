<script>
	import account, {account as acc} from '../../../components/etleneumAccountStore'
  import { link } from "svelte-routing";
  import { HomeRoute,
    CreateAuctionRoute,
    CreateLotteryRoute,
    SignInRoute,
    AuctionParentRoute,
    HostParentRoute,
    DashboardRoute,
  } from '../constants/routes'

  function logout(e) {
    e.preventDefault()
    acc.reset()
  }

</script>
<header>
  <a id="headerTitle" href={HomeRoute} use:link>Simple Auction</a>
  <div class="right_header_part">
    {#if $account.id}
    <div id="account_info">
      Your account balance: {$account.balance / 1000} sat 
    </div>
    <hr>
    <nav>
      <a href={DashboardRoute} use:link>My account</a>
      <a href={CreateAuctionRoute} use:link>Create Auction</a>
      <a href={CreateLotteryRoute} use:link>Create Lottery</a>
      <a href="https://etleneum.com/" on:click={logout}>Logout</a>
    </nav>
    {:else}
    <nav>
      <a href={SignInRoute} use:link>Sign in / Sign up</a>
    </nav>
    {/if}
  </div>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--color-main);
    margin-bottom: 50px;
  }

  header #account_info{
    text-align: right;
  }

  header nav{
    display: flex;
    gap: 20px;
  }

  #headerTitle, #headerTitle:hover {
    cursor: pointer;
    margin-right: 20px;
    min-width: 40%;
    text-decoration: none;
    font-size: 28px;
  }


  @media (max-width: 992px) {
    header{
      flex-flow: column;
      margin-bottom: 0px;
    }
    header nav{
      flex-flow: column;
      text-align: center;
      margin: 16px 0;
      gap: 10px;
    }
    #headerTitle, #headerTitle:hover {
      margin-right: 0;
    }
  }
</style>