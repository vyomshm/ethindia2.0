pragma solidity >= 0.5.0 <0.7.0;
// import the aztec contracts so truffle compiles them
import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
import "@aztec/protocol/contracts/ACE/ACE.sol";
import "@aztec/protocol/contracts/ACE/validators/joinSplitFluid/JoinSplitFluid.sol";
import "@aztec/protocol/contracts/ACE/validators/swap/Swap.sol";
import "@aztec/protocol/contracts/ACE/validators/joinSplit/JoinSplit.sol";
import "@aztec/protocol/contracts/ACE/validators/dividend/Dividend.sol";
import "@aztec/protocol/contracts/ACE/validators/privateRange/PrivateRange.sol";
import "@aztec/protocol/contracts/interfaces/PrivateRangeInterface.sol";
import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract DummyContract {

}

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 * Sourced from OpenZeppelin and thoroughly butchered to remove security guards.
 * Anybody can mint - STRICTLY FOR TEST PURPOSES
 */
contract ERC20Mintable is ERC20 {
    /**
    * @dev Function to mint tokens
    * @param _to The address that will receive the minted tokens.
    * @param _value The amount of tokens to mint.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint(address _to, uint256 _value) public returns (bool) {
        _mint(_to, _value);
        return true;
    }
}

// contract zkSubscriber is ZkAsset {
// 	ACE public ace;
// 	event DebugProofs(bytes _proofOutputs);
// 	event Hello(uint);
// 	mapping(address => bytes32) proofHashes;

// 	constructor(
// 		address _aceAddress, 
// 		address _linkedTokenAddress, 
// 		uint256 _scalingFactor
// 	) public ZkAsset(_aceAddress, _linkedTokenAddress, _scalingFactor) {
// 		// ??
// 	}

// 	function validateSubscriptionProof(uint24 _proof, address _sender, bytes calldata _data) external {
// 		emit Hello(89767);
// 		// bytes memory proofOutputs = ace.validateProof(_proof, _sender, _data);
// 		// emit DebugProofs(proofOutputs);
// 		// bytes32 proofHash = keccak256(proofOutputs);
// 		// update mapping
// 		// proofHashes[_sender] = proofHash;
// 	}

// 	function isSubscribed() public view returns(bool){
// 		if(proofHashes[msg.sender] != bytes32(0)) return true;
// 		return false;
// 	}
// }