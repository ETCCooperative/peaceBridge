const EthereumTx = require('ethereumjs-tx');

// var RLP = require('rlp');
var RLP = require("eth-lib/lib/rlp");
var Bytes = require("eth-lib/lib/bytes");
var Account = require("eth-lib/lib/account");
var Hash = require("eth-lib/lib/hash");

module.exports = {

// utils

formBundleLengthsHashes: function(rawTxArr) {
    console.log("rawTxArr: ", rawTxArr);
    var bundleArr = [];
    var txLengths = [];
    var txMsgHashes = [];
    rawTxArr.forEach((value, i) => {
      bundleArr[i] = value.rawTx.toString('hex');
      txLengths[i] = value.rawTx.toString('hex').length + 2;
      txMsgHashes[i] = value.msgHash;
    })
    var bytes32Bundle = module.exports.txsToBytes32BundleArr(bundleArr);
    return {bytes32Bundle: bytes32Bundle,
            txLengths: txLengths,
            txMsgHashes: txMsgHashes};
  },

  txsToBytes32BundleArr: function (rawTxStringArr) {
    var bytes32Bundle = [];
    rawTxStringArr.forEach(value => {
      var tempBundle = module.exports.toBytes32BundleArr(value);
      tempBundle.forEach(value => bytes32Bundle.push(value));
    })
    return bytes32Bundle;
  },

  toBytes32BundleArr: function (rawBundle) {
    var bytes32Bundle = [];
    for (var i = 0; i < rawBundle.length; i ++) {
      bytes32Bundle[Math.floor(i / 64)] = (bytes32Bundle[Math.floor(i / 64)]) ?
                                          bytes32Bundle[Math.floor(i / 64)] +
                                          rawBundle[i] : rawBundle[i] ;
    }
    bytes32Bundle.forEach((value, index) => {
      bytes32Bundle[index] = '0x' + bytes32Bundle[index];
    })
    return bytes32Bundle;
  },

  formBundleLengthsHashes: function(rawTxArr) {
    var bundleArr = [];
    var txLengths = [];
    var txMsgHashes = [];
    rawTxArr.forEach((value, i) => {
      bundleArr[i] = value.rawTx.toString('hex');
      txLengths[i] = value.rawTx.toString('hex').length + 2;
      txMsgHashes[i] = value.msgHash;
    })
    var bytes32Bundle = module.exports.txsToBytes32BundleArr(bundleArr);
    return {bytes32Bundle: bytes32Bundle, txLengths: txLengths, txMsgHashes: txMsgHashes};
  },

  txsToBytes32BundleArr: function (rawTxStringArr) {
    var bytes32Bundle = [];
    rawTxStringArr.forEach(value => {
      var tempBundle = module.exports.toBytes32BundleArr(value);
      tempBundle.forEach(value => bytes32Bundle.push(value));
    })
    return bytes32Bundle;
  },

  toBytes32BundleArr: function (rawBundle) {
    var bytes32Bundle = [];
    for (var i = 0; i < rawBundle.length; i ++) {
      bytes32Bundle[Math.floor(i / 64)] = (bytes32Bundle[Math.floor(i / 64)]) ? bytes32Bundle[Math.floor(i / 64)] + rawBundle[i] : rawBundle[i] ;
    }
    bytes32Bundle.forEach((value, index) => {
      bytes32Bundle[index] = '0x' + bytes32Bundle[index];
    })
    return bytes32Bundle;
  },

  generateRawTxAndMsgHash: async function(
    pubK, privK, to, value, data, web3Provider
  ){
    if (privK.substring(0,2) == "0x"){
      privK = privK.slice(2)
    }    

    var txParams = {};
    txParams.nonce = await web3Provider.eth.getTransactionCount(pubK);
    txParams.gasPrice = web3Provider.utils.toHex(500);
    txParams.gasLimit = web3Provider.utils.toHex(6721975);
    txParams.to = to;
    txParams.value = web3Provider.utils.toHex(value);
    txParams.data = data;
    var tx = new EthereumTx(txParams)
    tx.sign(new Buffer.from(privK, 'hex'));
    const rawTx = tx.serialize();

    //Form msgHash
    var decoded = RLP.decode('0x' + rawTx.toString('hex'));
    var txArrParams = []
    for (var i = 0; i < 6; i ++) {
      txArrParams.push('0x' + decoded[i].toString('hex'));
    }
    var msgHash = web3Provider.utils.sha3('0x' + RLP.encode(txArrParams).toString('hex'));

    return {rawTx: rawTx, msgHash: msgHash};
  },

  recreateRawTxAndMsgHash: async function(_txHash, _web3Provider) {
    var txParams = {};
    var tx = await _web3Provider.eth.getTransaction(_txHash);
    txParams.nonce = await _web3Provider.utils.toHex(tx['nonce']);
    txParams.gasPrice = await _web3Provider.utils.toHex(tx['gasPrice']);
    txParams.gasLimit = await _web3Provider.utils.toHex(tx['gas']);
    txParams.to = await tx['to'];
    txParams.value = await _web3Provider.utils.toHex(tx['value']);
    // txParams.value = _web3Provider.utils.toHex(0x0)
    txParams.data = await tx['input'];
    txParams.v = await tx['v']//.toString('hex');
    txParams.r = await tx['r']//.toString('hex');
    txParams.s = await tx['s']//.toString('hex');

    var txRaw = new EthereumTx(txParams)
    const rawTx = txRaw.serialize();

    var values = RLP.decode('0x' + rawTx.toString('hex'));

    var v = values[6]
    if (v.substr(v.length-1) == 7) {
      v = '0x1b'
    }
    if (v.substr(v.length-1) == 8) {
      v = '0x1c'
    }
    var r = values[7]
    var s = values[8]

    var txParams2 = {};
    txParams2.nonce = values[0];
    txParams2.gasPrice = values[1];
    txParams2.gasLimit = values[2];
    txParams2.to = values[3];
    txParams2.value = values[4];
    // txParams.value = _web3Provider.utils.toHex(0x0)
    txParams2.data = values[5];
    txParams2.v = v;
    // txParams2.v = v-27;
    txParams2.r = values[7];
    txParams2.s = values[8];

    var txRaw2 = new EthereumTx(txParams2)
    const rawTx2 = txRaw2.serialize();

    //Form msgHash
    var signature = Account.encodeSignature(values.slice(6,9));
    var recovery = Bytes.toNumber(values[6]);
    var extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), "0x", "0x"];
    var signingData = values.slice(0,6).concat(extraData);
    var signingDataHex = RLP.encode(signingData);

    var msgHash = Hash.keccak256(signingDataHex)

    console.log('v: ', v)
    console.log('r: ', r)
    console.log('s: ', s)

    console.log(_web3Provider.eth.accounts.recover(msgHash, v, r, s, true))

    return {rawTx: rawTx2, msgHash: msgHash};

  }
}