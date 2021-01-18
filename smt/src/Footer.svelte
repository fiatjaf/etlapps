<script>
  export let name;
  export let contract;
</script>

<style>
  footer {
    padding-top: 3em;
    padding-bottom: 3em;
  }
</style>


<footer class="bg-gray">
  <div class="container grid-lg text-center">
    <p>
      <b>{name}</b>
      is an
      <a href="https://etleneum.com/#/contract/{contract}" target="_blank">
        Etleneum contract
      </a>.
    </p>
    <p>
      All its core functionalities are defined there within visible and
      immutable code you should read before calling methods here.
    </p>
  </div>

</footer>
