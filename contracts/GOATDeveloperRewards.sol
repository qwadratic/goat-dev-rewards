// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GOATDeveloperRewards is ERC721Enumerable, Ownable {
    uint256 public constant GAS_THRESHOLD = 1 ether;
    uint256 private _tokenIdCounter;

    struct ContractInfo {
        address deployer;
        uint256 uniqueUsers;
        uint256 totalGasSpent;
        bool userMilestoneBadgeAwarded;
        bool gasMilestoneBadgeAwarded;
    }

    mapping(address => ContractInfo) public contracts;
    mapping(address => uint32) public deployers;
    mapping(address => mapping(address => bool)) public hasInteracted;

    bool public speedrunActive;
    address public speedrunWinner;
    uint256 public speedrunWinningTime;

    event BadgeAwarded(address indexed recipient, string badgeType);
    event SpeedrunWinner(address indexed contractAddress, address indexed deployer, uint256 timestamp);

    constructor() ERC721("GOAT Developer Achievements", "GOATNFT") Ownable(msg.sender) {
        speedrunActive = false;
    }

    function toggleSpeedrun(bool isActive) external onlyOwner {
        speedrunActive = isActive;
    }

    function recordDeployment(address contractAddress, address deployer) external onlyOwner {
        require(contracts[contractAddress].deployer == address(0), "Contract already recorded");
        contracts[contractAddress].deployer = deployer;
        
        if (deployers[deployer] == 0) {
            _mintBadge(deployer, "First Deployment");
        }
        deployers[deployer] += 1;
    }

    // TODO: allow to submit interactions in batches
    function recordInteraction(
        address contractAddress, 
        address user, 
        uint256 gasUsed
    ) external onlyOwner {
        ContractInfo storage info = contracts[contractAddress];
        require(info.deployer != address(0), "Contract deployed before Reward Program started");
        if (!hasInteracted[contractAddress][user]) {
            hasInteracted[contractAddress][user] = true;
            info.uniqueUsers++;

            if (info.uniqueUsers >= 10 && !info.userMilestoneBadgeAwarded) {
                _mintBadge(info.deployer, "10 Unique Users");
                info.userMilestoneBadgeAwarded = true;
                if (speedrunActive) {
                    speedrunActive = false;
                    speedrunWinner = info.deployer;
                    speedrunWinningTime = block.timestamp;
                    _mintBadge(info.deployer, "Speedrun Champion");
                    emit SpeedrunWinner(contractAddress, info.deployer, block.timestamp);
                }
            }

        }

        info.totalGasSpent += gasUsed;

        if (info.totalGasSpent >= GAS_THRESHOLD && !info.gasMilestoneBadgeAwarded) {
            _mintBadge(info.deployer, "Gas Spent Milestone");
            info.gasMilestoneBadgeAwarded = true;

            if (speedrunActive) {
                speedrunActive = false;
                speedrunWinner = info.deployer;
                speedrunWinningTime = block.timestamp;
                _mintBadge(info.deployer, "Speedrun Champion");
                emit SpeedrunWinner(contractAddress, info.deployer, block.timestamp);
            }
        }
    }

    function _mintBadge(address to, string memory badgeType) internal {
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
        emit BadgeAwarded(to, badgeType);
    }

}
