// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CharityPlatform
 * @dev A decentralized charity platform for transparent donations
 */
contract CharityPlatform {
    // Structs
    struct Charity {
        address payable wallet;
        string name;
        string description;
        bool isActive;
        uint256 totalReceived;
        uint256 totalWithdrawn;
    }

    struct Campaign {
        uint256 charityId;
        string title;
        string description;
        uint256 goalAmount;
        uint256 raisedAmount;
        uint256 deadline;
        bool isActive;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 charityId;
        uint256 campaignId; // 0 if direct to charity
    }

    // State variables
    address public owner;
    uint256 public charityCount;
    uint256 public campaignCount;
    uint256 public totalDonations;
    uint256 public platformFeePercent; // Fee in basis points (e.g., 250 = 2.5%)
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public charityDonations;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(address => uint256[]) public donorHistory;

    // Events
    event CharityRegistered(
        uint256 indexed charityId,
        string name,
        address wallet
    );
    event CampaignCreated(
        uint256 indexed campaignId,
        uint256 indexed charityId,
        string title,
        uint256 goalAmount
    );
    event DonationReceived(
        uint256 indexed charityId,
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );
    event FundsWithdrawn(uint256 indexed charityId, address to, uint256 amount);
    event CharityStatusChanged(uint256 indexed charityId, bool isActive);
    event PlatformFeeUpdated(uint256 newFee);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier charityExists(uint256 _charityId) {
        require(
            _charityId > 0 && _charityId <= charityCount,
            "Charity does not exist"
        );
        _;
    }

    modifier onlyCharityOwner(uint256 _charityId) {
        require(
            charities[_charityId].wallet == msg.sender,
            "Not charity owner"
        );
        _;
    }

    constructor(uint256 _platformFeePercent) {
        owner = msg.sender;
        platformFeePercent = _platformFeePercent; // e.g., 250 for 2.5%
    }

    /**
     * @dev Register a new charity
     */
    function registerCharity(
        address payable _wallet,
        string memory _name,
        string memory _description
    ) external onlyOwner returns (uint256) {
        require(_wallet != address(0), "Invalid wallet address");
        require(bytes(_name).length > 0, "Name cannot be empty");

        charityCount++;
        charities[charityCount] = Charity({
            wallet: _wallet,
            name: _name,
            description: _description,
            isActive: true,
            totalReceived: 0,
            totalWithdrawn: 0
        });

        emit CharityRegistered(charityCount, _name, _wallet);
        return charityCount;
    }

    /**
     * @dev Create a fundraising campaign
     */
    function createCampaign(
        uint256 _charityId,
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        uint256 _durationDays
    )
        external
        charityExists(_charityId)
        onlyCharityOwner(_charityId)
        returns (uint256)
    {
        require(charities[_charityId].isActive, "Charity is not active");
        require(_goalAmount > 0, "Goal must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");

        campaignCount++;
        campaigns[campaignCount] = Campaign({
            charityId: _charityId,
            title: _title,
            description: _description,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            deadline: block.timestamp + (_durationDays * 1 days),
            isActive: true
        });

        emit CampaignCreated(campaignCount, _charityId, _title, _goalAmount);
        return campaignCount;
    }

    /**
     * @dev Donate to a charity directly
     */
    function donateToCharity(
        uint256 _charityId
    ) external payable charityExists(_charityId) {
        require(charities[_charityId].isActive, "Charity is not active");
        require(msg.value > 0, "Donation must be greater than 0");

        _processDonation(_charityId, 0, msg.value);
    }

    /**
     * @dev Donate to a specific campaign
     */
    function donateToCampaign(uint256 _campaignId) external payable {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.isActive, "Campaign is not active");
        require(block.timestamp <= campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than 0");

        campaign.raisedAmount += msg.value;
        _processDonation(campaign.charityId, _campaignId, msg.value);
    }

    /**
     * @dev Internal function to process donations
     */
    function _processDonation(
        uint256 _charityId,
        uint256 _campaignId,
        uint256 _amount
    ) private {
        Charity storage charity = charities[_charityId];
        charity.totalReceived += _amount;
        totalDonations += _amount;

        Donation memory donation = Donation({
            donor: msg.sender,
            amount: _amount,
            timestamp: block.timestamp,
            charityId: _charityId,
            campaignId: _campaignId
        });

        charityDonations[_charityId].push(donation);
        if (_campaignId > 0) {
            campaignDonations[_campaignId].push(donation);
        }
        donorHistory[msg.sender].push(_charityId);

        emit DonationReceived(_charityId, _campaignId, msg.sender, _amount);
    }

    /**
     * @dev Charity withdraws funds
     */
    function withdrawFunds(
        uint256 _charityId,
        uint256 _amount
    ) external charityExists(_charityId) onlyCharityOwner(_charityId) {
        Charity storage charity = charities[_charityId];
        uint256 availableBalance = charity.totalReceived -
            charity.totalWithdrawn;
        require(_amount <= availableBalance, "Insufficient balance");

        // Calculate platform fee
        uint256 fee = (_amount * platformFeePercent) / 10000;
        uint256 netAmount = _amount - fee;

        charity.totalWithdrawn += _amount;

        // Transfer net amount to charity
        (bool success, ) = charity.wallet.call{value: netAmount}("");
        require(success, "Transfer to charity failed");

        // Transfer fee to platform owner
        if (fee > 0) {
            (bool feeSuccess, ) = owner.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        emit FundsWithdrawn(_charityId, charity.wallet, netAmount);
    }

    /**
     * @dev Toggle charity active status
     */
    function setCharityStatus(
        uint256 _charityId,
        bool _isActive
    ) external onlyOwner charityExists(_charityId) {
        charities[_charityId].isActive = _isActive;
        emit CharityStatusChanged(_charityId, _isActive);
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(_newFeePercent);
    }

    /**
     * @dev Get charity balance available for withdrawal
     */
    function getCharityBalance(
        uint256 _charityId
    ) external view charityExists(_charityId) returns (uint256) {
        Charity memory charity = charities[_charityId];
        return charity.totalReceived - charity.totalWithdrawn;
    }

    /**
     * @dev Get all donations for a charity
     */
    function getCharityDonations(
        uint256 _charityId
    ) external view charityExists(_charityId) returns (Donation[] memory) {
        return charityDonations[_charityId];
    }

    /**
     * @dev Get all donations for a campaign
     */
    function getCampaignDonations(
        uint256 _campaignId
    ) external view returns (Donation[] memory) {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );
        return campaignDonations[_campaignId];
    }

    /**
     * @dev Get donor's donation history
     */
    function getDonorHistory(
        address _donor
    ) external view returns (uint256[] memory) {
        return donorHistory[_donor];
    }

    /**
     * @dev Get campaign progress percentage
     */
    function getCampaignProgress(
        uint256 _campaignId
    ) external view returns (uint256) {
        require(
            _campaignId > 0 && _campaignId <= campaignCount,
            "Campaign does not exist"
        );
        Campaign memory campaign = campaigns[_campaignId];
        if (campaign.goalAmount == 0) return 0;
        return (campaign.raisedAmount * 100) / campaign.goalAmount;
    }

    /**
     * @dev Emergency withdrawal by owner (use with caution)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Receive function to accept direct ETH transfers
    receive() external payable {
        revert("Please use donateToCharity or donateToCampaign functions");
    }
}
