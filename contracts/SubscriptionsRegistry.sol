pragma solidity >=0.4.21 <0.6.0;

import "./SubscriberContract.sol";

contract SubscriptionsRegistry {
	mapping(address => address) public platformToSubscriberContract;

	function createSubscriberContract(string memory name, string memory symbol, uint256 stake, address platform) public returns(SubscriberContract){
		SubscriberContract newContract = new SubscriberContract(name, symbol, stake, platform);
		newContract.transferOwnership(msg.sender);

		// add to registry
		platformToSubscriberContract[platform] = address(newContract);
		return newContract;
	}
}
