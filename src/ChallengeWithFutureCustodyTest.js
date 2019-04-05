
// this script tests challengeWithFutureCustody on the peaceBridge

//------------------------------------------------------------------------------
//Require dependencies
var ethers = require('ethers');
var Web3 = require("web3");
var fs = require('fs');
var solc = require('solc');

const depositHelper = require('./DepositHelper.js');
const tokenHelper = require('./TokenHelper.js');

//------------------------------------------------------------------------------
//Set parameters
const tokenContractAddr = '0x20dD16A7CFb58b1a61a79CC0FD014342e75C16c7';
const depositContractAddr = '0x92c1f6641c1D2e7389812BD2C3b7b80046c9D7Ee';

const infuraAPI = '9744d40b99e34a57850802d4c6433ab8';

var foreignNetwork = 'kovan'; //'rinkeby', 'ropsten', 'kovan', 'homestead'
var foreignCustPrivateKey = '0x13410a539b4fdb8dabde37ff8d687cc'+
                            '23eea64ab11eaf348a2fd775ba71a31cc';
var foreignCustPublicAddr = '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4';
var foreignPrivateKey = '0x2b847e2e99d7600ab0fbae23643a6a8'+
                        '1d009aaf0573e887b41079b614f61e450';
var foreignPublicAddr = '0x9677044a39550cEbB01fa79bEC04Cf54E162d0C3';
var foreignPrivateKey2 = '0x546a0806a2d0240d50797f7f7b0120a'+
                         '6af0d6e8bfa5b4620365f5e8af9eb6fe7';
var foreignPublicAddr2 = '0x942BbcCde96bEc073e1DCfc50bc661c21a674d63';
var foreignPrivateKey3 = '0x0A90E10DDCEF51B9AD063518F90E2F4'+
                         'E6B8BF12C2B6B4359BF2310AA597898FC';
var foreignPublicAddr3 = '0xcE152b33c48be6e0c5876b057334eA01c8deC0e5';
var foreignBlockTimeDelay = 55000;

var homeNetwork = 'ropsten'; //'rinkeby', 'ropsten', 'kovan', 'homestead'
var homeCustPrivateKey = foreignCustPrivateKey;
var homeCustPublicAddr = foreignCustPublicAddr;
var homePrivateKey = foreignPrivateKey;
var homePublicAddr = foreignPublicAddr;
var homePrivateKey2 = foreignPrivateKey2;
var homePublicAddr2 = foreignPublicAddr2;
var homePrivateKey3 = foreignPrivateKey3;
var homePublicAddr3 = foreignPublicAddr3;
var homeBlockTimeDelay = 55000;

var gasPerChallenge = 206250;
var gasPrice = 10000000000;

//------------------------------------------------------------------------------
//Set wallets and providers
var web3ForeignProvider = new Web3(new Web3.providers.HttpProvider("https://" +
                                   foreignNetwork + ".infura.io/" + infuraAPI));
var web3HomeProvider = new Web3(new Web3.providers.HttpProvider("https://" +
                                   homeNetwork + ".infura.io/" + infuraAPI));
var foreignProvider = new ethers.providers.InfuraProvider(
    network = foreignNetwork, apiAccessToken = infuraAPI);
var homeProvider = new ethers.providers.InfuraProvider(
    network = homeNetwork, apiAccessToken = infuraAPI);

var custForeignWallet = new ethers.Wallet(foreignCustPrivateKey, foreignProvider);
var custHomeWallet = new ethers.Wallet(homeCustPrivateKey, homeProvider);
var foreignWallet = new ethers.Wallet(foreignPrivateKey, foreignProvider);
var foreignWallet2 = new ethers.Wallet(foreignPrivateKey2, foreignProvider);
var foreignWallet3 = new ethers.Wallet(foreignPrivateKey3, foreignProvider);
var homeWallet = new ethers.Wallet(homePrivateKey, homeProvider);
var homeWallet2 = new ethers.Wallet(homePrivateKey2, homeProvider);
var homeWallet3 = new ethers.Wallet(homePrivateKey3, homeProvider);

//------------------------------------------------------------------------------
//Get contract ABIs
var tokenContractInput = {
    language: "Solidity",
    sources: {
      'TokenContract_flat.sol':
      fs.readFileSync('../contracts/TokenContract_flat.sol','utf8')
    }
 }
 var tokenContractOutput = solc.compile(tokenContractInput, 1);
 const tokenContractAbi = JSON.parse(tokenContractOutput.contracts[
                          'TokenContract_flat.sol:TokenContract'].interface);
 var depositContractInput = {
     language: "Solidity",
     sources: {
       'DepositContract_flat.sol':
       fs.readFileSync('../contracts/DepositContract_flat.sol','utf8')
     }
 }
 var depositContractOutput = solc.compile(depositContractInput, 1);
 const depositContractAbi = JSON.parse(depositContractOutput.contracts[
                            'DepositContract_flat.sol:DepositContract'].interface);

//------------------------------------------------------------------------------
//Interacting with contract instances

async function challengeWithFutureCustodyTest(
    _custTokenContractInstance,
    _tokenContractInstance,  _tokenContractInstance2, _tokenContractInstance3,
    _depositContractInstance, _depositContractInstance2, _depositContractInstance3){

    var tokenId;
    var transferTxHash;
    var transferTxHash2;
    var custodianApproveTxHash;
    var custodianApproveTxHash2;
    var withdrawalTxHash;
    var nonce;
    var nonce2;
    var challengeHash;

    //1. Alice mints on TokenContract
    var mintTxHash = await tokenHelper.mintCall(10000,
                            foreignPublicAddr,
                            _tokenContractInstance);

    //2. Alice deposits on DepositContract
    setTimeout(async function() {
    tokenId = await tokenHelper.getTokenIdFromMint(mintTxHash, foreignProvider);
    var depositTxHash = await depositHelper.depositCall(10000,
                                        tokenId,
                                        foreignPublicAddr,
                                        _depositContractInstance);
    }, foreignBlockTimeDelay)

    //3. Alice makes a transfer to Bob on TokenContract
    setTimeout(async function() {
    transferTxHash = await tokenHelper.transferCall(
        foreignPublicAddr, foreignPublicAddr2, tokenId, 0, _tokenContractInstance);
    }, foreignBlockTimeDelay + homeBlockTimeDelay)

    //4. Custodian approves transfer on TokenContract
    setTimeout(async function() {
    nonce = await tokenHelper.getNonceFromTransferRequest(
        transferTxHash, foreignProvider);
    }, foreignBlockTimeDelay*2 + homeBlockTimeDelay)

    setTimeout(async function() {
    custodianApproveTxHash = await tokenHelper.custodianApproveCall(tokenId,
                nonce, _custTokenContractInstance);
    }, foreignBlockTimeDelay*3 + homeBlockTimeDelay)

    //5. Bob makes a transfer to Charlie on TokenContract
    setTimeout(async function() {
    transferTxHash2 = await tokenHelper.transferCall(
        foreignPublicAddr2, foreignPublicAddr3, tokenId, 1, _tokenContractInstance2);
    }, foreignBlockTimeDelay*4 + homeBlockTimeDelay)

    //6. Custodian approves transfer on TokenContract
    setTimeout(async function() {
        nonce2 = await tokenHelper.getNonceFromTransferRequest(
            transferTxHash2, foreignProvider);
    }, foreignBlockTimeDelay*5 + homeBlockTimeDelay)
    
    setTimeout(async function() {
    custodianApproveTxHash2 = await tokenHelper.custodianApproveCall(
        tokenId, nonce2, _custTokenContractInstance);
    }, foreignBlockTimeDelay*6 + homeBlockTimeDelay)

    //7. Bob withdraws fraudulently
    setTimeout(async function(){
    withdrawalTxHash = await tokenHelper.withdrawCall(
        tokenId, _tokenContractInstance2)
    }, foreignBlockTimeDelay*7 + homeBlockTimeDelay)

    setTimeout(async function(){
    var rawTransferFrom = await helper.recreateRawTxAndMsgHash(
        transferTxHash, web3ForeignProvider)
    var rawCustodianApprove = await helper.recreateRawTxAndMsgHash(
        custodianApproveTxHash, web3ForeignProvider)
    var rawWithdrawal = await helper.recreateRawTxAndMsgHash(
        withdrawalTxHash, web3ForeignProvider)
    var withdrawArgs = await helper.formBundleLengthsHashes(
        [rawWithdrawal, rawTransferFrom, rawCustodianApprove]);
    
    result = await depositHelper.withdrawCall(gasPerChallenge*gasPrice,
                            homePublicAddr2,
                            tokenId,
                            withdrawArgs.bytes32Bundle,
                            withdrawArgs.txLengths,
                            withdrawArgs.txMsgHashes,
                            1, _depositContractInstance2);
    }, foreignBlockTimeDelay*8 + homeBlockTimeDelay)

    //8. Charlie challenges using challengeWithFutureCustody
    setTimeout(async function() {
    var rawTransferFrom = await helper.recreateRawTxAndMsgHash(
        transferTxHash2, web3ForeignProvider)
    var rawCustodianApprove = await helper.recreateRawTxAndMsgHash(
        custodianApproveTxHash2, web3ForeignProvider)
    var withdrawArgs = await helper.formBundleLengthsHashes(
        [rawTransferFrom, rawCustodianApprove]);
    challengeHash = await depositHelper.challengeWithFutureCustodyCall(
        homePublicAddr3,
        tokenId, 
        withdrawArgs.bytes32Bundle,
        withdrawArgs.txLengths,
        withdrawArgs.txMsgHashes,
        _depositContractInstance3);
    }, foreignBlockTimeDelay*9 + homeBlockTimeDelay)


}

//------------------------------------------------------------------------------
//Run tests

async function instantiateAndTest(){
    var custTokenContract = await tokenHelper.instantiateContract(
        tokenContractAddr, tokenContractAbi, custForeignWallet);
    var tokenContract = await tokenHelper.instantiateContract(
        tokenContractAddr, tokenContractAbi, foreignWallet);
    var tokenContract2 = await tokenHelper.instantiateContract(
        tokenContractAddr, tokenContractAbi, foreignWallet2);
    var tokenContract3 = await tokenHelper.instantiateContract(
        tokenContractAddr, tokenContractAbi, foreignWallet3);
    var depositContract = await depositHelper.instantiateContract(
        depositContractAddr, depositContractAbi, homeWallet);
    var depositContract2 = await depositHelper.instantiateContract(
        depositContractAddr, depositContractAbi, homeWallet2);
    var depositContract3 = await depositHelper.instantiateContract(
        depositContractAddr, depositContractAbi, homeWallet3);
    await challengeWithFutureCustodyTest(
        custTokenContract, 
        tokenContract, tokenContract2, tokenContract3,
        depositContract, depositContract2, depositContract3)
  }
  
  instantiateAndTest()