'use strict';
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const mongoose = require('mongoose');
const Blockmodel = mongoose.model('block');
// const Organization = mongoose.model('organization');
const Nodes = mongoose.model('nodes');
const Ipfs = mongoose.model('ipfs');
const Merkle = mongoose.model('merkle');

//contracts
const { Block } = require('../contracts/block');

// organizations
const orgData = require('../organization');

const addBlock = (ipfshash, txnRefid)=> {
    return new Promise((resolve, reject)=>{
        //add block to blockchain
        const timestamp = new Date().getTime();
        const transactions = ipfshash;
        const previousHash = '';

        let block = new Block(timestamp, transactions, previousHash);
        block.mineBlock();;
        console.log('block mined: ()=> ', block);

        block.setTxnRef(txnRefid);

        //get last saved block
        Blockmodel.find({}).sort({ updatedAt: -1 }).limit(1).exec(function(err, data){
        if (err)
            return res.send(err);

        console.log('block found', data.length);

        if(data.length > 0){
            block.setPreviousHash(data[0].hash);
        }else{
            block.setPreviousHash('0000000000000000000000000000000000000000000000000000000000000000'); //first block
        }

        console.log('block previous hash set: ()=> ', block);

        let newBlock = new Blockmodel(block)
            newBlock.save().then((data)=>{
                console.log('block added to network ', data);
                resolve(1);
            }).catch((error)=>{
                reject(error);
            })
        });

    });
}

const broadCast = ()=> {
    console.log('broadcasting...');
    return new Promise((resolve,reject)=>{

        Blockmodel.find({}).sort({ updatedAt: -1 }).limit(1).exec(function (err, blocks) {
            if (err) reject(err);

            console.log('orgdata: ', orgData);
            console.log('blocks: ', blocks);

            //empty Nodes
            // Nodes.collection.deleteMany({});
            if(orgData.length == 0) reject('Could not find any node');
            orgData.forEach((org, i) => {
                const { publickey, code } = org;
                const copyBlocks = [...blocks];
                const copiesArr = copyBlocks.map((block)=> {
                    const { timestamp, transactions, nonce, previousHash, hash, txnRefid, createdAt, updatedAt } = block;
                    return {
                        orgPublickey: publickey,
                        timestamp, transactions, nonce, previousHash, hash, txnRefid, createdAt, updatedAt
                    }
                })
                //saved a copy of all blocks for each organization
                Nodes.collection.insertMany( copiesArr /* array of all blocks */, (err, docs)=>{
                    if(err)
                        reject(err);
                    console.log((i + 1) + '. ' + code.toUpperCase() + ' done');
                    if(i === orgData.length - 1) resolve();
                });

            });
        });
    })
}

const updateNodeBlock = (oldipfshash, newipfshash, txnRefid, orgPublickey)=> {
    console.log('updating node...');
    console.log(newipfshash, txnRefid, orgPublickey);
    return new Promise((resolve, reject)=>{
        //add block to blockchain
        const timestamp = new Date().getTime();
        const transactions = newipfshash;
        const previousHash = '';

        let block = new Block(timestamp, transactions, previousHash);
        block.mineBlock();
        console.log('block mined for update: ()=> ', block);
        block.setTxnRef(txnRefid);

        Nodes.findOneAndUpdate({ txnRefid, transactions: oldipfshash /* old ipfshash */, orgPublickey }, block, { new: true },
        function (err, data) {
            if (err) reject(err);
            console.log('data to update is :', data);
            resolve(data);
        });
    });
}

const myNode = (orgPublickey)=> {
    let outputData = {};
    let ipfsDt = [];
    return new Promise((resolve, reject)=> {
        Nodes.find({ orgPublickey }, function(err, data) {
            if (err) reject(err);
            if(data){
                //get each ipfs data for blocks
                data.forEach((block,i)=>{
                    const { transactions } = block;
                    //retrieve user record from ipfs using transaction of blocks
                    Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transactions) }, function (err, ipfsData) {
                        if (err) reject(err);
        
                        let userObj = JSON.parse(ipfsData.userData);
                        ipfsDt.push(userObj);
                        
                        //last index
                        if(i == data.length - 1){
                            outputData['blocks'] = data.map(({ orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid }, index) => { 
                                return {
                                  index, orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid
                                }
                            });
                            outputData['ipfsData'] = ipfsDt;                            
                            console.log('ipfs userObj :=> ', outputData);
                            resolve(outputData);
                        }
                    });
                });
            }else{
                reject(err);
            }
        });
    });
}

const allNode = ()=> {
    return new Promise((resolve, reject)=> {
        //output data
        let outputData = [];        

        if(orgData.length == 0) reject('Could not find any node');

        orgData.forEach((org, i) => {
            const { publickey, code } = org;
            console.log(publickey, code);
            //get blocks for each organization
            Nodes.find({ orgPublickey: publickey }, function(err, nodeDocs){
                //add to output array
                if(err) reject(err);
                outputData.push(
                    {
                        [code]: nodeDocs
                    }
                )
                if(i === orgData.length - 1) resolve(outputData);
            });
        }); 
    });
}

const addMerkle = (merkles,txnRefid)=> {

    return new Promise((resolve, reject)=>{
        //add block to blockchain
        const merkleroot = new Date().getTime();        
        const merklehash = SHA256(merkles).toString();
        const txnlist = merkles;
        console.log('Merkle Data', {merkleroot, merklehash, txnlist, txnRefid});

        let newMerkle = new Merkle({ merkleroot, merklehash, txnlist, txnRefid})
        newMerkle.save().then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
        
    });
}

module.exports = {
    addBlock,
    broadCast,
    updateNodeBlock,
    myNode,
    allNode,
    addMerkle
}
