const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  let charityPlatform;
  let owner, charity1, charity2, donor1, donor2;
  const platformFee = 250; // 2.5%

  beforeEach(async function () {
    [owner, charity1, charity2, donor1, donor2] = await ethers.getSigners();

    const CharityPlatform = await ethers.getContractFactory("CharityPlatform");
    charityPlatform = await CharityPlatform.deploy(platformFee);
    await charityPlatform.waitForDeployment();
  });

  describe("Charity Registration", function () {
    it("Should register a new charity", async function () {
      await charityPlatform.registerCharity(charity1.address, "Test Charity", "A test charity organization");

      const charity = await charityPlatform.charities(1);
      expect(charity.name).to.equal("Test Charity");
      expect(charity.wallet).to.equal(charity1.address);
      expect(charity.isActive).to.be.true;
    });

    it("Should increment charity count", async function () {
      await charityPlatform.registerCharity(charity1.address, "Charity 1", "Desc 1");
      expect(await charityPlatform.charityCount()).to.equal(1);

      await charityPlatform.registerCharity(charity2.address, "Charity 2", "Desc 2");
      expect(await charityPlatform.charityCount()).to.equal(2);
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await charityPlatform.registerCharity(charity1.address, "Test Charity", "Description");
    });

    it("Should accept donations to charity", async function () {
      const donationAmount = ethers.parseEther("1.0");

      await expect(charityPlatform.connect(donor1).donateToCharity(1, { value: donationAmount }))
        .to.emit(charityPlatform, "DonationReceived")
        .withArgs(1, 0, donor1.address, donationAmount);

      const charity = await charityPlatform.charities(1);
      expect(charity.totalReceived).to.equal(donationAmount);
    });

    it("Should track donor history", async function () {
      await charityPlatform.connect(donor1).donateToCharity(1, {
        value: ethers.parseEther("1.0"),
      });

      const history = await charityPlatform.getDonorHistory(donor1.address);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(1);
    });
  });

  describe("Campaigns", function () {
    beforeEach(async function () {
      await charityPlatform.registerCharity(charity1.address, "Test Charity", "Description");
    });

    it("Should create a campaign", async function () {
      const goalAmount = ethers.parseEther("10.0");
      const durationDays = 30;

      await charityPlatform
        .connect(charity1)
        .createCampaign(1, "Campaign Title", "Campaign Description", goalAmount, durationDays);

      const campaign = await charityPlatform.campaigns(1);
      expect(campaign.title).to.equal("Campaign Title");
      expect(campaign.goalAmount).to.equal(goalAmount);
      expect(campaign.isActive).to.be.true;
    });

    it("Should accept donations to campaigns", async function () {
      await charityPlatform.connect(charity1).createCampaign(1, "Campaign", "Desc", ethers.parseEther("10.0"), 30);

      const donationAmount = ethers.parseEther("2.0");
      await charityPlatform.connect(donor1).donateToCampaign(1, {
        value: donationAmount,
      });

      const campaign = await charityPlatform.campaigns(1);
      expect(campaign.raisedAmount).to.equal(donationAmount);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await charityPlatform.registerCharity(charity1.address, "Test Charity", "Description");

      await charityPlatform.connect(donor1).donateToCharity(1, {
        value: ethers.parseEther("10.0"),
      });
    });

    it("Should allow charity to withdraw funds", async function () {
      const withdrawAmount = ethers.parseEther("5.0");
      const fee = (withdrawAmount * BigInt(platformFee)) / BigInt(10000);
      const netAmount = withdrawAmount - fee;

      const initialBalance = await ethers.provider.getBalance(charity1.address);

      await charityPlatform.connect(charity1).withdrawFunds(1, withdrawAmount);

      const finalBalance = await ethers.provider.getBalance(charity1.address);
      expect(finalBalance - initialBalance).to.be.closeTo(
        netAmount,
        ethers.parseEther("0.01") // Account for gas costs
      );
    });

    it("Should update withdrawn amount", async function () {
      const withdrawAmount = ethers.parseEther("5.0");

      await charityPlatform.connect(charity1).withdrawFunds(1, withdrawAmount);

      const charity = await charityPlatform.charities(1);
      expect(charity.totalWithdrawn).to.equal(withdrawAmount);
    });
  });
});
