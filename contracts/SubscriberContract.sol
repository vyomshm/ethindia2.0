pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./interfaces/CERC20.sol";
import "./interfaces/Comptroller.sol";

contract SubscriberContract is ERC20, Ownable {
  uint256 internal constant PRECISION = 10 ** 18;

  // Compount-v2 Mainnet Contract Setup
  address public constant COMPTROLLER_ADDRESS = 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B;
  address public constant CDAI_ADDRESS = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;
  address public constant DAI_ADDRESS = 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359;

  string private _name;
  string private _symbol;

  address public platform; // the account that will receive the interests from Compound

  uint256 public stake;

  mapping(address => bool) public isSubscriber;

  /**
    * @dev Sets the values for `name` and `symbol`. Both of
    * these values are immutable: they can only be set once during
    * construction.
    */
  constructor (string memory name, string memory symbol, uint256 _stake, address _platform) public {
    _name = name;
    _symbol = symbol;

    // Set beneficiary
    require(_platform != address(0), "Platform can't be zero");

    // Enter cDAI market
    Comptroller troll = Comptroller(COMPTROLLER_ADDRESS);
    address[] memory cTokens = new address[](1);
    cTokens[0] = CDAI_ADDRESS;
    uint[] memory errors = troll.enterMarkets(cTokens);
    require(errors[0] == 0, "Failed to enter cDAI market");
    platform = _platform;
    stake = _stake;
  }

  /**
    * @dev Returns the name of the token.
    */
  function name() public view returns (string memory) {
    return _name;
  }

  /**
    * @dev Returns the symbol of the token, usually a shorter version of the
    * name.
    */
  function symbol() public view returns (string memory) {
    return _symbol;
  }

  /**
    * @dev Returns the number of decimals used to get its user representation.
    * For example, if `decimals` equals `2`, a balance of `505` tokens should
    * be displayed to a user as `5,05` (`505 / 10 ** 2`).
    *
    * Tokens usually opt for a value of 18, imitating the relationship between
    * Ether and Wei.
    *
    * NOTE: This information is only used for _display_ purposes: it in
    * no way affects any of the arithmetic of the contract, including
    * {IERC20-balanceOf} and {IERC20-transfer}.
    */
  function decimals() public pure returns (uint8) {
    return 18;
  }

  function subscribe(address _subscriber) public returns (bool) {
    // transfer `stake` DAI from msg.sender
    ERC20 dai = ERC20(DAI_ADDRESS);
    require(dai.transferFrom(msg.sender, address(this), stake), "Failed to transfer DAI from msg.sender");

    // use `stake` DAI to mint cDAI
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    require(dai.approve(CDAI_ADDRESS, 0), "Failed to clear DAI allowance");
    require(dai.approve(CDAI_ADDRESS, stake), "Failed to set DAI allowance");
    require(cDAI.mint(stake) == 0, "Failed to mint cDAI");

    // mint `stake` pcDAI for `_subscriber`
    _mint(_subscriber, stake);
    isSubscriber[_subscriber] = true;

    return true;
  }

  function burn(address to) public returns (bool) {
    // burn `stake` pcDAI for msg.sender
    _burn(msg.sender, stake);

    // burn cDAI for `stake` DAI
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    require(cDAI.redeemUnderlying(stake) == 0, "Failed to redeem");

    // transfer DAI to `to`
    ERC20 dai = ERC20(DAI_ADDRESS);
    require(dai.transfer(to, stake), "Failed to transfer DAI to target");

    return true;
  }

  function accruedInterestCurrent() public returns (uint256) {
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    return cDAI.exchangeRateCurrent().mul(cDAI.balanceOf(address(this))).div(PRECISION).sub(totalSupply());
  }

  function accruedInterestStored() public view returns (uint256) {
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    return cDAI.exchangeRateStored().mul(cDAI.balanceOf(address(this))).div(PRECISION).sub(totalSupply());
  }

  function withdrawInterestInDAI() public onlyOwner returns (bool) {
    // calculate amount of interest in DAI
    uint256 interestAmount = accruedInterestCurrent();

    // burn cDAI
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    require(cDAI.redeemUnderlying(interestAmount) == 0, "Failed to redeem");

    // transfer DAI to platform
    ERC20 dai = ERC20(DAI_ADDRESS);
    require(dai.transfer(platform, interestAmount), "Failed to transfer DAI to beneficiary");

    return true;
  }

  function withdrawInterestInCDAI() public onlyOwner returns (bool) {
    // calculate amount of cDAI to transfer
    CERC20 cDAI = CERC20(CDAI_ADDRESS);
    uint256 interestAmountInCDAI = accruedInterestCurrent().mul(PRECISION).div(cDAI.exchangeRateCurrent());

    // transfer cDAI to subscriber platform
    require(cDAI.transfer(platform, interestAmountInCDAI), "Failed to transfer cDAI to Platform");

    return true;
  }

  // fallback fn
  function() external payable {
    revert("Contract doesn't support receiving Ether");
  }
}