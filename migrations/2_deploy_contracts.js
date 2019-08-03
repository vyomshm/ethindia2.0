const SubscriptionsRegistry = artifacts.require("SubscriptionsRegistry");

module.exports = function(deployer) {
  deployer.deploy(SubscriptionsRegistry);
};

