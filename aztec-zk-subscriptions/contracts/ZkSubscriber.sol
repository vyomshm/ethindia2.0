pragma solidity >= 0.5.0 <0.7.0;


import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";


contract ZkSubscriber is ZkAsset {
	mapping(address => bytes32) proofHashes;

	constructor(
		address _aceAddress, 
		address _linkedTokenAddress, 
		uint256 _scalingFactor
	) public ZkAsset(_aceAddress, _linkedTokenAddress, _scalingFactor) {
	}

	function validateSubscriptionProof(uint24 _proof, address _sender, bytes calldata _data) external returns(bool) {
		bytes memory proofOutputs = ace.validateProof(_proof, _sender, _data);
		// return proofOutputs;
		// emit DebugProofs(proofOutputs);
		bytes32 proofHash = keccak256(proofOutputs);
		// update mapping
		proofHashes[_sender] = proofHash;
		return true;
	}

	function isSubscribed(address sender) public view returns(bool){
		if(proofHashes[sender] != bytes32(0)) return true;
		return false;
	}
}