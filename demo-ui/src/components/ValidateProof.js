import React from 'react';
import utils from '@aztec/dev-utils';

import ACE from '../az/ACE.json';
import ZkSubscriber from '../az/ZkSubscriber.json';
import ERC20Mintable from '../az/ERC20Mintable.json';

import { Button, Form, FormGroup, Label, Input, FormText, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle } from 'reactstrap';
import Web3 from 'web3';

const aztec = require('aztec.js');
const secp256k1 = require('@aztec/secp256k1');
const BN = require('bn.js');
const {
  proofs: {
    MINT_PROOF,
    PRIVATE_RANGE_PROOF
  },
} = utils;

const { PrivateRangeProof } = aztec;

class ValidateProof extends React.Component {
	state={
		service: null,
		un: null,
		cn: null,
		on: null,
		status: 'contracts not deployed',

	}

	getNoteInt = (service) => {
		return 100;
	}

	getDefaultNotes = async () => {
		const subscriber = secp256k1.accountFromPrivateKey('0x60cd6638b6578d0bced19e5d8673d15a8d3a148136e914ea442b1cc9fd0970a2');
		const originalNote = await aztec.note.create(subscriber.publicKey, 1000);
		const comparisonNote = await aztec.note.create(subscriber.publicKey, 100);
		const utilityNote = await aztec.note.create(subscriber.publicKey, 900);
		this.setState({subscriber, originalNote, comparisonNote, utilityNote});
	    return { originalNote, comparisonNote, utilityNote };
	};

	generateProofs = async (service)=> {
		this.setState({status: "genrating bullet proofs ..."});
		const { originalNote, comparisonNote, utilityNote } = await this.getDefaultNotes();
		const subscriber = secp256k1.accountFromPrivateKey('0x60cd6638b6578d0bced19e5d8673d15a8d3a148136e914ea442b1cc9fd0970a2');
		const proof = new PrivateRangeProof(originalNote, comparisonNote, utilityNote, subscriber.address);
		this.setState({subscriber, proof:"Logged to console", proofHash: proof.validatedProofHash, status: "bullet proofs"});
		console.log(proof, typeof proof);
		return { originalNote, comparisonNote, utilityNote, subscriber };
	}

	validateProof = async () => {
		const { originalNote, comparisonNote, utilityNote, subscriber } = await this.generateProofs('A');
		const proof = new PrivateRangeProof(originalNote, comparisonNote, utilityNote, subscriber.address);
		if(this.state.zkSub) {
			let data = proof.encodeABI(this.state.zkAddr);
			let result = this.state.zkSub.methods.validateSubscriptionProof(
				PRIVATE_RANGE_PROOF, 
				subscriber.address, 
				data
			).send({
				from: subscriber.address,
	        	gas: 4712388,
  				gasPrice: 100000000000
  			});
  			console.log("validation", result);
  			this.setState({validatedResult: result.toString()});
  			// this.setState({validatedResult: 'true'});
		} else {
			this.setState({status: "wait for contracts to be deployed !!!"});
		}
	}

	deployContract = async ()=> {
		let web3 = new Web3("http://localhost:8545/");
		// let web3 = new Web3(window.web3);

		const subscriber = secp256k1.accountFromPrivateKey('0x60cd6638b6578d0bced19e5d8673d15a8d3a148136e914ea442b1cc9fd0970a2');
		this.setState({status: 'being awesomely cryptografic...'});
		try {
	      let zkSub;
	      let ace;
	      let erc20;
	      // console.log(SubscribeContract);
	      erc20 = await new web3.eth.Contract(ERC20Mintable.abi)
	        .deploy({
	          data: ERC20Mintable.bytecode
	        })
	        .send({
	          from: subscriber.address,
	          gas: 4712388,
  			  gasPrice: 100000000000
	        });

	       console.log({erc20});

	      ace = await new web3.eth.Contract(ACE.abi)
	        .deploy({
	          data: ACE.bytecode,
	        })
	        .send({
	          from: subscriber.address,
	          gas: 4712388,
  			  gasPrice: 100000000000
	        });

	        console.log({ace});

	      this.setState({ace:ace.options.address});

	      zkSub = await new web3.eth.Contract(ZkSubscriber.abi)
	        .deploy({
	          data: ZkSubscriber.bytecode,
	          arguments: [ace.options.address, erc20.options.address, 10],
	        })
	        .send({
	          from: subscriber.address,
	          gas: 4712388,
  			  gasPrice: 100000000000
	        });

	        console.log({zkSub});

	      this.setState({zkAddr:zkSub.options.address, zkSub, status: 'Contracts deployed !!!'});
	    }catch(err) {
	      console.log(err);
	    }
	} 

	componentDidMount = async () => {
		await this.deployContract();
	}

	selectService = async (service) => {
		this.setState({service});
		this.generateProofs(service);
	};

	render () {
		return (
			<Card style={{padding: '20px', margin:'auto', maxHeight:'90vh', maxWidth:'90vw'}}>
			<h1> Select your Subscription Servive </h1>
				<Button 
					color="danger" style={{padding: '20px', margin:'auto',width:'40vw'}}onClick={()=>this.selectService("Netflix")} >Netflix</Button>
				<hr />
				<Button 
					color="primary" style={{padding: '20px', margin:'auto', width:'40vw'}}onClick={()=>this.selectService("Dropbox")} >DropBox</Button>
				<hr />
				<h3> Selected service: {this.state.service ? this.state.service : "Nothing"} </h3>
				<hr />
				status : {this.state.status ? this.state.status : "loading"}
				<hr />
				Proof : {this.state.proof ? this.state.proof : "Proof not generated yet"}
				<hr />
				ProofHash : {this.state.proofHash ? this.state.proofHash: "null"}
				<hr />
				ACE  : {this.state.ace ? this.state.ace: "null"}
				<hr />
				ZK Subscribe : {this.state.zkAddr ? this.state.zkAddr: "null"}
				<hr />

				Proof Validated : {this.state.validatedResult ? this.state.validatedResult: 'false'}

				<Button 
					outline 
					color="danger"
					onClick={
						async () => {
							this.setState({status: "being awesomely cryptografic..."});
							let result = await this.validateProof();
							this.setState({validatedResult: result, status: 'done'})
						}
					}
				> Validate Subscription with Proof with ACE</Button>

			</Card>
		);
	}
}


export default ValidateProof;