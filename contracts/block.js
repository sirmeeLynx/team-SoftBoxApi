const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block {
  /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions
   * @param {string} previousHash
   */
  constructor(timestamp, ipfshash, previousHash = '') {
    this.timestamp = timestamp;
    this.txnRefid = null;
    this.transactions = ipfshash; //reference to user data saved
    this.nonce = 0;
    this.previousHash = previousHash;
    this.difficulty = 4; //set difficulty level
    this.hash = this.calculateHash();
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + this.transactions + this.nonce).toString();
  }

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  mineBlock() {
    while (this.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }

  setPreviousHash(hash) {
    this.previousHash = hash;
  }

  setTxnRef(_id) {
    this.txnRefid = _id;
  }

  /**
   * Validates all the data inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid.
   *
   * @returns {boolean}
   */
  hasValiddata() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Block = Block;