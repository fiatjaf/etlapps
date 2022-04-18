<script>
	import Foot from '../../../components/Footer.svelte'
	import { ALIAS_CONTRACT,
    SIMPLE_AUCTION_CONTRACT,
    LOTO_AUCTION_CONTRACT 
  } from '../constants/contracts'
</script>

<footer>
  Simple Auction is based on <a href={`https://etleneum.com/#/contract/${SIMPLE_AUCTION_CONTRACT}`} target="_blank">Simple Auction</a>, <a href={`https://etleneum.com/#/contract/${LOTO_AUCTION_CONTRACT}`} target="_blank">Lottery Auction</a> and <a href={`https://etleneum.com/#/contract/${ALIAS_CONTRACT}`} target="_blank">Alias</a> Etleneum contracts. All its core functionalities are defined there within visible and immutable code you should read before calling methods here.
  <br>
  <a href="https://etleneum.com/static/terms.txt">Etleneum Terms</a>
</footer>

<style>
footer {
  margin-top: 100px;
  --text-muted: --black;
  text-align: center;
}  
@media (max-width: 992px) {
  footer {
    margin-top: 50px;
  }  
}
</style>