const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Blockchain {
  constructor(data) {
    this.chain = data;
    this.temperedBlock = null;
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return this.chain[0];
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      let currentBlock = this.chain[i];
      let previousBlock = this.chain[i - 1];

      //check if it was created by someone with a valid address using
      //signature
      // if (!currentBlock.hasValidTransactions()) {
      //   return false;
      // }

      console.log(i, currentBlock.previousHash, previousBlock.hash);

      if (currentBlock.previousHash !== previousBlock.hash) {
        console.log('it is not equal ? ')
        this.temperedBlock = currentBlock;
        return false;
      }

    }

    return true;
  }

  /**
   * check to see if the current block is the tampered block
   *
   * @returns {boolean}
   */
  confirmTamperedBlock(datablock) {
    console.log(datablock, this.temperedBlock);
    if (datablock.txnRefid == this.temperedBlock.txnRefid) {
      return true
    }
    return false
  }


}

module.exports.Blockchain = Blockchain;