<script>
  import { navigate } from "svelte-routing";
  import PayToCall from '../../../components/PayToCall.svelte'
  import Auth from '../../../components/Auth.svelte'
  import account from '../../../components/etleneumAccountStore'
  import { DashboardRoute } from '../constants/routes'
</script>

{#if !$account.id}
  <div class="text-center">
    Sign in to get access to contract features.
    <Auth qrsize="300" />
    You don't need to register for first login just enter any login and password
  </div>
{:else}
  {navigate(DashboardRoute, { replace: true })}
{/if}