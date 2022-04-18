<!-- @format -->
<script>
  import {setContext} from 'svelte'

  import initAliasContract from './contracts/alias.js'
  import initSimpleAuction from './contracts/simpleAuction.js'
  import initLotoAuction from './contracts/lotteryAuction.js'

  import { Router, Route } from "svelte-routing"
  import PrivateRoute from "./local-components/PrivateRoute.svelte";
  import Index from "./routes/Index.svelte"
  import SignIn from "./routes/SignIn.svelte"
  import CreateAuction from "./routes/CreateAuction.svelte"
  import CreateLottery from "./routes/CreateLottery.svelte"
  import AuctionPage from "./routes/Auction.svelte"
  import LotteryPage from "./routes/Lottery.svelte"
  import HostPage from "./routes/Host.svelte"
  import UserPage from "./routes/User.svelte"
  import Dashboard from "./routes/Dashboard.svelte"
  import Header from './views/Header.svelte'
  import Footer from './views/Footer.svelte'

  import { HomeRoute,
    CreateAuctionRoute,
    CreateLotteryRoute,
    SignInRoute,
    AuctionParentRoute,
    LotteryParentRoute,
    HostParentRoute,
    UserParentRoute,
    DashboardRoute,
  } from './constants/routes'

  export let url = "";

  var unsetCallListeners = []
  setContext('unset-call', callback => {
    unsetCallListeners.push(callback)
    return () =>
      unsetCallListeners.splice(unsetCallListeners.indexOf(callback), 1)
  })

  // thats awful and should be fixed
  initAliasContract(unsetCallListeners)
  initSimpleAuction(unsetCallListeners)
  initLotoAuction(unsetCallListeners)

</script>

<Router url={url}>
  <Header />
  <main class="container">
    <Route path={HomeRoute} component={Index} />
    <Route path={SignInRoute} component={SignIn} />
    <Route path={`${AuctionParentRoute}/:auctionId`} component={AuctionPage} />
    <Route path={`${LotteryParentRoute}/:auctionId`} component={LotteryPage} />
    <Route path={`${HostParentRoute}/:hostId`} component={HostPage} />
    <Route path={`${UserParentRoute}/:userId`} component={UserPage} />
    <PrivateRoute path={CreateAuctionRoute} let:location>
      <CreateAuction/>
    </PrivateRoute>
    <PrivateRoute path={CreateLotteryRoute} let:location>
      <CreateLottery/>
    </PrivateRoute>
    <PrivateRoute path={DashboardRoute} let:location>
      <Dashboard/>
    </PrivateRoute>
  </main>
  <Footer />
  
</Router>