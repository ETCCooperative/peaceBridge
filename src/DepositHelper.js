//------------------------------------------------------------------------------
/*
This script provides helper functions for testing DepositContract.sol
*/

//------------------------------------------------------------------------------
//Require dependencies
var ethers = require('ethers');

module.exports = {
  //------------------------------------------------------------------------------
  //Interacting with blockchain

  getTxHash: async function(_tx){
    var txHash = await _tx['hash'];
    return txHash;
  },

  getAddr: async function(_txHash, _provider){
    var tx = await _provider.getTransactionReceipt(_txHash);
    var addr = await tx['contractAddress'];
    await console.log("Contract deployed at: " + addr);
    return addr
  },

  deployContract: async function(_bytecode, _abi, _publicAddress, _wallet){
    var deployTransaction = ethers.Contract.getDeployTransaction("0x"+_bytecode,
                                                                 _abi,
                                                                 _publicAddress);
    deployTransaction.gasLimit = 3500000;
    var tx = await _wallet.sendTransaction(deployTransaction);
    var txHash = await module.exports.getTxHash(tx);
    await console.log('Created deployment transaction ' + txHash);
    return txHash;
  },

  instantiateContract: async function(_addr, _abi, _wallet){
    var contractInstance = await new ethers.Contract(_addr, _abi, _wallet);
    var depositContract = new Promise(resolve => {resolve(contractInstance);});
    return depositContract;
  },

  stakeCall: async function(_addr, _etherString, _wallet){
    var transaction = {
      to: _addr,
      value: ethers.utils.parseEther(_etherString)
    };
    var tx = await _wallet.sendTransaction(transaction);
    var txHash = await module.exports.getTxHash(tx);
    await console.log('Sent ' + _etherString + ' ETH to ' + _addr + ' at tx ' + txHash);
    return txHash;
  },

  //--------------------------------------------------------------------------------
  //Interacting with DepositContract instance

  setTokenContractCall: async function(_addr, _contractInstance){
    var result = await _contractInstance.setTokenContract(_addr);
    var txHash = await module.exports.getTxHash(result);
    await console.log('TokenContract set to contract at address ' + _addr +
                      ' in transaction ' + txHash);
    return txHash;
  },

  setCustodianForeignCall: async function(_addr, _contractInstance){
    var result = await _contractInstance.setCustodianForeign(_addr);
    var txHash = await module.exports.getTxHash(result);
    await console.log('TokenContract custodian set to address ' + _addr +
                      ' in transaction ' + txHash);
    return txHash;
  },

  finalizeStakeCall: async function(_contractInstance){
    var result = await _contractInstance.finalizeStake();
    var txHash = await module.exports.getTxHash(result);
    await console.log('Stake finalized at transaction: ' + txHash);
    return txHash;
  },

  depositCall: async function(_amt, _tokenId, _minter, _contractInstance) {
    var result = await _contractInstance.deposit(_tokenId, _minter, {value: _amt});
    var txHash = await module.exports.getTxHash(result);
    await console.log('deposit() txHash: ' + txHash);
    return txHash;
  },

  withdrawCall: async function(_amt, _to, _tokenId, _rawTxBundle,
                               _txLengths, _txMsgHashes,
                               _declaredNonce, _contractInstance){
     var result = await _contractInstance.withdraw(_to, _tokenId, _rawTxBundle,
                                                   _txLengths, _txMsgHashes,
                                                   _declaredNonce, {value: _amt});
     var txHash = await module.exports.getTxHash(result);
     await console.log('withdraw() txHash: ' + txHash);
     return txHash;
  },

  challengeWithFutureCustodyCall: async function(
    _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes, _contractInstance
  ){
    var result = await _contractInstance.challengeWithFutureCustody(
      _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes
    )
    var txHash = await module.exports.getTxHash(result);
    await console.log('challengeWithFutureCustody() txHash: ' + txHash);
    return txHash;
  },

  initiateChallengeWithPastCustodyCall: async function(
    _amt,
    _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes, _contractInstance
  ){
    var result = await _contractInstance.initiateChallengeWithPastCustody(
      _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes, {value: _amt}
    )
    var txHash = await module.exports.getTxHash(result);
    await console.log('initiateChallengeWithPastCustody() txHash: ' + txHash);
    return txHash; 
  },

  challengeWithPastCustodyCall: async function(
    _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes, _contractInstance
  ){
    var result = await _contractInstance.challengeWithPastCustody(
      _to, _tokenId, _rawTxBundle, _txLengths, _txMsgHashes
    )
    var txHash = await module.exports.getTxHash(result);
    await console.log('challengeWithPastCustody() txHash: ' + txHash);
    return txHash; 
  }


}
