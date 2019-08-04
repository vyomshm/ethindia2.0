pragma solidity >= 0.5.0 <0.7.0;


import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";


contract ZkSubscriber is ZkAsset {
	event DebugProofs(bytes _proofOutputs);
	event Hello(uint word);
	event Sender(address senderAddress);
	event ProofID(uint _proof);
	event Data(bytes _data);
	mapping(address => bytes32) proofHashes;

	constructor(
		address _aceAddress, 
		address _linkedTokenAddress, 
		uint256 _scalingFactor
	) public ZkAsset(_aceAddress, _linkedTokenAddress, _scalingFactor) {
	}

	function validateSubscriptionProof(uint24 _proof, bytes calldata _data) external returns(bool) {
		bytes memory proofOutputs = ace.validateProof(_proof, msg.sender, _data);
		// return proofOutputs;
		// emit DebugProofs(proofOutputs);
		bytes32 proofHash = keccak256(proofOutputs);
		// update mapping
		proofHashes[msg.sender] = proofHash;
		return true;
	}

	function isSubscribed() public view returns(bool){
		if(proofHashes[msg.sender] != bytes32(0)) return true;
		return false;
	}
}