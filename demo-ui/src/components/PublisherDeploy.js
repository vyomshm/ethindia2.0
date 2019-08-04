import React, { Component } from 'react';
var QRCode = require('qrcode.react');


class PublisherDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {

    let {deployingAddress,deployedAddress} = this.props
    let contractAddress = deployingAddress

    if(deployedAddress){
      contractAddress=deployedAddress
      return (
        <div>
          <h1>Congratulations, your contract is ready.</h1>
          <h3>You can now accept subscriptions!</h3>
          <p>QR Code:</p>
          <QRCode value={contractAddress} />
        </div>
      )
    }else{
      return (
        <div>
            <h1>Your contract is being deployed</h1>
            <h3>(Make sure you <b>confirm</b> the metamask popup to deploy your contract!)</h3>
        </div>
      );
    }
  }
}

export default PublisherDeploy;
