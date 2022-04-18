<script>
  import {getContext} from 'svelte'
  import { navigate } from "svelte-routing";
  import account from '../../../components/etleneumAccountStore'
  import { SignInRoute } from '../constants/routes'
  import Auth from '../../../components/Auth.svelte'
</script>

{#if $account.id}
  <slot/>
{:else}
  <div class="text-center">
    Sign in to get access to contract features.
    <Auth qrsize="300" />
    You don't need to register for first login just enter any login and password
  </div>
{/if}