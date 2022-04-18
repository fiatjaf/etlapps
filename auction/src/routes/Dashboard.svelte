<script>
  import Topup from '../local-components/Topup.svelte'
  import Alias from '../local-components/Alias.svelte'
  import Auth from '../../../components/Auth.svelte'
  import account from '../../../components/etleneumAccountStore'
  import { HostParentRoute } from '../constants/routes'
</script>


<div class="dashboard_page">
  <a class="account_id" href={`${HostParentRoute}/${$account.id}`}><h3>{$account.id}</h3></a>
  <div class="balance_and_alias">
    <Alias/>
    <Topup/>
    <div class="auth_wrapper">
      <Auth qrsize="450" />
    </div>
  </div>
</div>

<style>
  .account_id, .account_id:hover{
    text-decoration: none;
  }
  .account_id h3{
    background: #fff;
    padding: 32px;
    margin: 32px 0;
    word-break: break-all;
    text-align: center;
  }
  .balance_and_alias{

  }
  .auth_wrapper{
    margin: 32px 0;
    padding: 32px;
    background: var(--background-secondary);
  }
</style>