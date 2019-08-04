import utils from '@aztec/dev-utils';

const aztec = require('aztec.js');
const dotenv = require('dotenv');
dotenv.config();
const secp256k1 = require('@aztec/secp256k1');
const BN = require('bn.js');

const ZkAssetMintable = artifacts.require('./ZkAssetMintable.sol');
const JoinSplit = artifacts.require('@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol');

const {
  proofs: {
    MINT_PROOF,
    PRIVATE_RANGE_PROOF
  },
} = utils;

const { padLeft, randomHex } = require('web3-utils');

const PrivateRange = artifacts.require('./PrivateRange');
const PrivateRangeInterface = artifacts.require('./PrivateRangeInterface');
PrivateRange.abi = PrivateRangeInterface.abi;
const ACE = artifacts.require('./ACE');
const ZkSubscriber = artifacts.require('./ZkSubscriber');
const ERC20Mintable = artifacts.require('./ERC20Mintable');

const { JoinSplitProof, MintProof, PrivateRangeProof } = aztec;

const subscriber = secp256k1.accountFromPrivateKey(process.env.GANACHE_TESTING_ACCOUNT_0);

const getDefaultNotes = async () => {
	const originalNote = await aztec.note.create(subscriber.publicKey, 1000);
	const comparisonNote = await aztec.note.create(subscriber.publicKey, 100);
	const utilityNote = await aztec.note.create(subscriber.publicKey, 900);
    return { originalNote, comparisonNote, utilityNote };
};


contract("Privacy preserving Subscriptions", async (accounts) => {
	const sender = accounts[0];

	describe('Initialization', () => {
        let ace;

        beforeEach(async () => {
            ace = await ACE.new({ from: sender });
        });

        it('should set the owner', async () => {
            const owner = await ace.owner();
            expect(owner).to.equal(sender);
        });

        it('should set the common reference string', async () => {
            await ace.setCommonReferenceString(utils.constants.CRS, { from: sender });
            const result = await ace.getCommonReferenceString();
            expect(result).to.deep.equal(utils.constants.CRS);
        });

        it('should set a proof', async () => {
            const privateRangeValidator = await PrivateRange.new({ from: sender });
            await ace.setProof(PRIVATE_RANGE_PROOF, privateRangeValidator.address);
            const resultValidatorAddress = await ace.getValidatorAddress(PRIVATE_RANGE_PROOF);
            expect(resultValidatorAddress).to.equal(privateRangeValidator.address);
        });
    });

    describe('Runtime', () => {
        let ace;
        let privateRangeValidator;
        let proof;

        let zkSubContract;
        let erc20;

        beforeEach(async () => {
            ace = await ACE.new({ from: sender });
            erc20 = await ERC20Mintable.new({ sender });
            await ace.setCommonReferenceString(utils.constants.CRS);
            privateRangeValidator = await PrivateRange.new({ from: sender });;
            await ace.setProof(PRIVATE_RANGE_PROOF, privateRangeValidator.address);

            const { originalNote, comparisonNote, utilityNote } = await getDefaultNotes();
            proof = new PrivateRangeProof(originalNote, comparisonNote, utilityNote, sender);
            zkSubContract = await ZkSubscriber.new(
                ace.address, 
                erc20.address, 
                new BN(10)
            );
        });


        it('should read the validator address', async () => {
            const validatorAddress = await ace.getValidatorAddress(PRIVATE_RANGE_PROOF);
            expect(validatorAddress).to.equal(privateRangeValidator.address);
        });

        it('should increment the latest epoch', async () => {
            const latestEpoch = new BN(await ace.latestEpoch()).add(new BN(1));
            await ace.incrementLatestEpoch();
            const newLatestEpoch = await ace.latestEpoch();
            expect(newLatestEpoch.toString()).to.equal(latestEpoch.toString());
        });

        it('should validate a private range proof', async () => {
            const data = proof.encodeABI(privateRangeValidator.address);
            const { receipt } = await ace.validateProof(
            	PRIVATE_RANGE_PROOF, 
            	sender, 
            	data
            );
            expect(receipt.status).to.equal(true);
        });

        it("should validate a conclusive proof of sub", async () => {
            // TO-DO
        });

        it("should deploy the ZkSubscriber contract", async () => {
            expect(zkSubContract.address != null).to.equal(true);
        });

        it("should validate proof", async () => {
            const data = proof.encodeABI(zkSubContract.address);

            const result = await zkSubContract.validateSubscriptionProof.call(PRIVATE_RANGE_PROOF, data, {from: sender});
            assert.equal(result, true);
        });

    });
});


// import the aztec contracts so truffle compiles them
// import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
// import "@aztec/protocol/contracts/ACE/ACE.sol";
// import "@aztec/protocol/contracts/ACE/validators/joinSplitFluid/JoinSplitFluid.sol";
// import "@aztec/protocol/contracts/ACE/validators/swap/Swap.sol";
// import "@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol";
// import "@aztec/protocol/contracts/ACE/validators/dividend/Dividend.sol";
// import "@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol";
// import "@aztec/protocol/contracts/interfaces/PrivateRangeInterface.sol";
// import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";
// import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

