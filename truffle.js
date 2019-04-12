const HDWalletProvider = require("truffle-hdwallet-provider");
const infuraKey = 'ce26c7d418db4e4695aaa359a1013ab2';
// const private = require('./private.json');
// const mnemonic = private.funds;
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
     development: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 6721975,
    },
    kovan: {
       provider: new HDWalletProvider(mnemonic, `https://kovan.infura.io/${infuraKey}`),
       network_id: '*',
       gas:7000000,
       gasPrice: 10000000000, // 50 gwei, this is very high
       skipDryRun: true,
     },
    ropsten: {
       provider: new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraKey}`),
       network_id: '*',
       gas: 7000000,
       gasPrice: 30000000000, // 50 gwei, this is very high
       skipDryRun: true,

     },
    //  rinkeby: {
    //     provider: new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${infuraKey}`),
    //     network_id: '*',
    //     gas: 3500000,
    //     gasPrice: 5000000000, // 50 gwei, this is very high
    //   },
   },
  //  // Configure your compilers
   compilers: {
    solc: {
      version: "0.4.24",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
      
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
        evmVersion: "byzantium"
      }
    }
   }

};
