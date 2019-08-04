import React from 'react';
import Web3 from 'web3';
import './App.css';
import Subscription from './components/DeploySubscription'
import PublisherDeploy from './components/PublisherDeploy'
import ValidateSubscription from './components/ValidateSubscription'
import logo from './ethstudio.jpeg'
import SubscriptionsRegistry from './contracts/SubscriptionsRegistry.json';
import SubscriberContract from './contracts/SubscriberContract.json';

const MAINNET_REGISTRY = "0x14b5286D41c219B5Dc6744dA8FACEa62043dDCBB";

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
    view:'main'
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

  deployContract = async (name, symbol, stake, platform) => {
    let contract;
    let tx;
    let web3 = this.state.web3;
    if(!this.state.web3) {
      web3 = new Web3(window.web3);
    } else {
      web3 = this.state.web3;
    }

    // console.log(SubscribeContract.bytecode);
    // const bt = SubscribeContract.bytecode;
    // try {
    //   let tx;
    //   // console.log(SubscribeContract);
    //   tx = await web3.eth.Contract(JSON.parse(SubscribeContract.abi))
    //     .deploy({
    //       data: '0x' + SubscribeContract.bytecode,
    //       arguments: ["Netflix", "NTF", 100],
    //     })
    //     .send({
    //       from: this.state.account,
    //     });

    //   console.log(tx)
    // }catch(err) {
    //   console.log(err);
    // }

    try {
      // console.log(SubscribeContract);
      contract = new web3.eth.Contract(SubscriptionsRegistry.abi, MAINNET_REGISTRY, {
        from: this.state.account
      });

      tx = await contract.methods.createSubscriberContract(
        name || "EthFlix2.0",
        symbol || "EFX",
        stake || 5000000000000000000,
        platform || "0x0DBcCB2F2B16926dD60770ff72C6bF6E5cAb3CBE"
      ).send({
        from: this.state.account
      });

      console.log(tx);

      this.setState({ tx });
    }catch(err) {
      console.log(err);
    }
  }


  switchView = (view)=>{
    this.setState({view});
  }

  render(){
    let {connected, account, provider, network, accountsLocked, injectedWeb3Provider, diffProvidersDetected } = this.state;

    let message = diffProvidersDetected == true ? <div style={{color: 'red'}}> Alert : Two different web3 providers <hr /> Go to chrome://extensions/  and turn one off !!!! </div> : <br />;
    return (
      <div className="App pb-2" >
      <br />
      <h1> Configure your subscription service contract </h1>
      <br />
      
        <Subscription 
          className="mt-5" 
          style={{marginTop: "20px"}} 
          account={this.state.account}
          deployContract={this.deployContract}
        />

      <button onClick={()=>this.switchView('zk')}> zk </button>
      <button onClick={()=>this.switchView('zk')}> launch </button>
      </div>


    );
  }
}

export default App;
