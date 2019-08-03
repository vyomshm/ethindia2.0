import utils from '@aztec/dev-utils';
// import bn128  from '@aztec/bn128';

const aztec = require('aztec.js');
const dotenv = require('dotenv');
dotenv.config();
// const bn128 = require('@aztec/bn128');
const secp256k1 = require('@aztec/secp256k1');
const BN = require('bn.js');

// const PrivateVenmo = artifacts.require('./PrivateVenmo.sol');
const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');

const {
  proofs: {
    MINT_PROOF,
    PRIVATE_RANGE_PROOF
  },
} = utils;

const { padLeft, randomHex } = require('web3-utils');

// const { mockZeroPrivateRangeProof } = require('../../../helpers/proof');

const PrivateRange = artifacts.require('./PrivateRange');
const PrivateRangeInterface = artifacts.require('./PrivateRangeInterface');
PrivateRange.abi = PrivateRangeInterface.abi;

const { JoinSplitProof, MintProof, PrivateRangeProof } = aztec;

contract("private subscriptions", async (accounts) => {
	const sender = accounts[0];
	console.log({ sender });

	const bob = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_0);
	console.log({ bob });
	const sally = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_1);
	const alice = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_2);

	// let privatePaymentContract;
	let privateRangeValidator;

	// beforeEach(async () => {
	// 	// privatePaymentContract = await ZkAssetMintable.deployed();
	// 	privateRangeValidator = await PrivateRange.new({ from: alice.publicKey });
	// });

	before(async () => {
        privateRangeValidator = await PrivateRange.new({ from: sender });
    });

	it('Bob should be able to mint different range notes ', async() => {
		const testAccount = secp256k1.generateAccount();
		console.log({ testAccount });
		console.log('Bob wants to deposit 100');
		console.log({ sender });
    	const originalNote = await aztec.note.create(bob.publicKey, 1000);
    	console.log('bobnote');

    	const comparisonNote = await aztec.note.create(bob.publicKey, 100);
    	const utilityNote = await aztec.note.create(bob.publicKey, 900);
    	console.log('created notesß');

        // const { originalNote, comparisonNote, utilityNote } = await getDefaultNotes();
        const proof = new PrivateRangeProof(originalNote, comparisonNote, utilityNote, sender);
        console.log('creates proof');
        const data = proof.encodeABI();
        const result = await privateRangeValidator.validatePrivateRange(data, sender, utils.constants.CRS, { from: sender });
        console.log('validates proof');
        console.log(result);
        console.log(proof.eth.outputs);
        expect(result).to.equal(proof.eth.outputs);
	});
});