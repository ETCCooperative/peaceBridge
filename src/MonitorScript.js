/*
akombalabs.com

This script allows a Monitor to:
- listen to HomeChain withdraws
- be alerted of conflicts on HomeChain withdraws
- get chain of custody of particular tokenID on ForeignChain TokenContract
- submit chain of custody to HomeChain DepositContract in a challenge

*/

//require dependencies
var ethers = require('ethers');
var infuraAPI = '9744d40b99e34a57850802d4c6433ab8';
var provider = new ethers.providers.InfuraProvider(network='rinkeby', apiAccessToken=infuraAPI);
var fs = require('fs');

//specify Monitor's account
var privateKey = '0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc';
var publicAddress = '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4';
var wallet = new ethers.Wallet(privateKey, provider);

// //specify TokenContract
// var tokenContractAddress = '0xF22999d07Bf99C75112C292AB1B399423Cb770ce';
// var jsonFile = '../Contracts/tokenContract.json';
// var parsed = JSON.parse(fs.readFileSync(jsonFile));
// //var abi = parsed.abi
// var bytecodeFile = '../Contracts/tokenContract.txt';
// var bytecode = fs.readFileSync(bytecodeFile, "utf-8");

// var tokenContract = new ethers.Contract(tokenContractAddress, parsed, wallet);

var abiFile = fs.readFileSync('../Contracts/TokenContract_sol_TokenContract.abi')
// var abiFile = fs.readFileSync('../Contracts/Ownable_sol_Ownable.abi')
var abi = JSON.parse(abiFile.toString())
var binFile = fs.readFileSync('../Contracts/TokenContract_sol_TokenContract.bin', "utf-8")
// var binFile = fs.readFileSync('../Contracts/Ownable_sol_Ownable.bin', "utf-8")
var bin = "0x"+binFile.toString()
var deployTransaction = ethers.Contract.getDeployTransaction(bin, abi,
	'0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4');
var sendPromise = wallet.sendTransaction(deployTransaction);
sendPromise.then(function(err,transaction) {
    //console.log(err,transaction);
});

//--------------------------------------------------------------------------------
//Retrieving transfer history of a tokenID

var transferMethodID = '0xb22781db7a1c1a87b86b7215e93e2ad8791bb8cc984291af99060086f14f0b4a';

async function transferHistory(tokenID) {
	var filter = {
		fromBlock: 3788780,
		toBlock: 'latest',
		topics: [
		transferMethodID,
		null,null,
		tokenID
		]
	}
	var transferEvents = provider.getLogs(filter)
	transferEvents.then(function(result){
	   console.log(result);
	});
}
