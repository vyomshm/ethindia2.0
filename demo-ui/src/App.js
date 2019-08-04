import React from 'react';
import Web3 from 'web3';
import './App.css';
import Subscription from './components/Subscription'
import PublisherDeploy from './components/PublisherDeploy'
import logo from './ethstudio.jpeg'

let interval;

function translateNetwork(id) {
  const networks = {
    1:   'Mainnet',
    2:   'Morden',
    3:   'Ropsten',
    4:   'Rinkeby',
    42:  'Kovan',
    99:  'POA',
    100: 'xDai',
    5777: 'Private',
  }
  return networks[id] || 'Unknown';
}


class App extends React.Component {
  state = {
    connected: false,
    accountsLocked: true,
    account: "",
    injectedWeb3Provider: null,
    diffProvidersDetected: false,
  }

  pollForNetwork = async () => {
    interval = setInterval(async ()=>{
      let web3 = this.state.web3;
      let secondaryWeb3 = this.state.secondaryWeb3;
      let provider;
      if(web3 == null && window.ethereum != null) {
        try{
          web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          let netId = await web3.eth.net.getId();
          let network = translateNetwork(netId);
          this.setState({web3, connected: true, netId, network});
        } catch(err) {
          this.setState({connected: false})
        } 

        // secondary web3 
        if(window.web3 != null) {
          secondaryWeb3 = window.web3;
          this.setState({secondaryWeb3});
        }
      }

      if(web3 != null) {
        if(web3.currentProvider.isMetaMask == true) {
          provider = 'METAMASK';
        } else if(web3.currentProvider.isDapper == true) {
          provider = 'DAPPER';
        } else {
          provider = 'UNKNOWN';
        }

        if(provider != this.state.provider) {
          this.setState({web3, provider});
        }

        let accounts = await web3.eth.getAccounts();
        if(web3 != null && accounts.length == 0) {
          // Detect if Logged out of Dapper
          this.setState({accountsLocked: true, account: ""});
        }

        if(provider != 'UNKNOWN' && accounts[0] != null) {
          let netId = await web3.eth.net.getId();
          let network = translateNetwork(netId);
          // check if network/account changed
          if(this.state.account !== accounts[0].toString() || this.state.netId !== netId || this.state.network !== network) {
            console.log('detected change, updating web3 details...');
            this.setState({connected: true, web3, account: accounts[0].toString(), netId, network, provider, accountsLocked: false });
          }
        } 
      }

      let secondayProvider;
      if(secondaryWeb3 != null) {
        
        if(secondaryWeb3.currentProvider.isMetaMask == true) {
          secondayProvider = 'METAMASK';
        } else if(secondaryWeb3.currentProvider.isDapper == true) {
          secondayProvider = 'DAPPER';
        } else {
          secondayProvider = 'UNKNOWN';
        }
      }

      if(secondayProvider != provider) {
        this.setState({injectedWeb3Provider: secondayProvider, diffProvidersDetected: true});
      } else {
        this.setState({injectedWeb3Provider: secondayProvider });
      }
    }, 250);
  }

  async componentDidMount() {
    this.pollForNetwork();
  }

  componentWillUnmount() {
    clearInterval(interval);
  }

  render(){
    let {connected, account, provider, network, accountsLocked, injectedWeb3Provider, diffProvidersDetected } = this.state;

    let message = diffProvidersDetected == true ? <div style={{color: 'red'}}> Alert : Two different web3 providers <hr /> Go to chrome://extensions/  and turn one off !!!! </div> : <br />;
    return (
      <div className="App">
        <header className="App-header">
          <div style={{margin: "5vh " }}> 
            <img src={logo} alt="golf" style={{width: '10%', height: '10%', position: 'absolute', top: '10px', left: '5px'}}/>
            <h3> ZK based Privacy preserving Subscriptions using Range proofs powered by Aztec Protocol  </h3>
            <br/>
            Ethereum enabled: {connected.toString()} 
            <hr />
            Primary Web3 Provider : {provider}
            <hr />
            Secondary Web3 Provider : {injectedWeb3Provider}
            <hr />
            Network : {network}
            <hr />
            Accounts Locked : {accountsLocked.toString()} 
            <hr />
            Account : {account}
          </div>
          <br />
          {message}
          <br />
        </header>
        <Subscription />
      </div>
    );
  }
}

export default App;
