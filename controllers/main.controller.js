'use strict';
const fs = require('fs');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const mongoose = require('mongoose');

const User = mongoose.model('users');
const Blockmodel = mongoose.model('block');
const Ipfs = mongoose.model('ipfs');
const Nodes = mongoose.model('nodes');
const Fingerprint = mongoose.model('fingerprint');

const organization = require('../organization');
const reqPaser = require('ua-parser');

//blockchain network Contract
const { Blockchain } = require('../contracts/blockchain');
const Contract = require('../contracts/blockchainNetwork');

const concatNameFields = (obj)=> {
	const nameFields = Object.keys(obj).filter((field)=> field.includes('name'));
	if(!nameFields.length) return '';
	let str = [];
	for(let prop in obj){
		if(nameFields.indexOf(prop) !== -1){
			str.push(obj[prop]);
		}
	}
	if(!str.length) return '';
	//concatenate the STR
	str = str.join(',');
	if(!str.trim().includes(' ')){
		return str;
	}
	//split STR and return concatenated STR
	return str.split(' ').join(',');
}

const buildUserobject = (obj)=> {
	let userObj = {};
	const otherFields = Object.keys(obj).filter((field)=> !field.includes('name'));
	for(let prop in obj){
		if(otherFields.indexOf(prop) !== -1) userObj[prop] = obj[prop];
		if(concatNameFields(obj) !== '') userObj['name'] = concatNameFields(obj);
	}
	return userObj;
}

const fetchAlltxnID = (txnRefid) => {
  return new Promise((resolve,reject)=>{
    //retrieve user publickey using _id
    
    User.findOne({ "_id": mongoose.Types.ObjectId(txnRefid) }, function (err, userData) {
      if (err || userData == undefined) reject(err);
      let txnArr = [];

      //retrieve transactions from Nodes using userid && orgPublickey
      Blockmodel.find({ txnRefid }, function(err, blocks) {
        if (err) reject(err);

        if(blocks.length){
          //list of all user ipfsHash == transactions on blocks
          const transArray = blocks.map( block => block.transactions );
          let count = 0;
          transArray.forEach((transaction,i) => { 
            //retrieve user txn_id for banks from ipfs using transaction of blocks
            Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
              if (err) reject(err);
              
              if(ipfsData){
                let txnObj = JSON.parse(ipfsData.userData);
                if(Object.keys(txnObj).includes('txn_id')){
                  const { txn_id } = txnObj;
                  txnArr.push(txn_id);
                } 
                count++;                    
                if(count == transArray.length){
                  resolve(txnArr);
                }            
              }              

            });
          });

        }
        //no block found

      });
      //end Nodes

    });
  })
}

const fetchAlltxn = (txnRefid) => {
  return new Promise((resolve,reject)=>{
    //retrieve user publickey using _id
    
    User.findOne({ "_id": mongoose.Types.ObjectId(txnRefid) }, function (err, userData) {
      if (err || userData == undefined) reject(err);
      let txnArr = [];

      //retrieve transactions from Nodes using userid && orgPublickey
      Blockmodel.find({ txnRefid }, function(err, blocks) {
        if (err) reject(err);

        if(blocks.length){
          //list of all user ipfsHash == transactions on blocks
          const transArray = blocks.map( block => block.transactions );
          let count = 0;
          transArray.forEach((transaction,i) => { 
            //retrieve user txn_id for banks from ipfs using transaction of blocks
            Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
              if (err) reject(err);
              
              if(ipfsData){
                let txnObj = JSON.parse(ipfsData.userData);
                if(Object.keys(txnObj).includes('txn_id')){
                  txnArr.push(txnObj);
                } 
                count++;                    
                if(count == transArray.length){
                  resolve(txnArr);
                }            
              }              

            });
          });

        }
        //no block found

      });
      //end Nodes

    });
  })
}

const fetchAcctInfoWithID = (txnRefid) => {
  return new Promise((resolve,reject)=>{
    //retrieve user publickey using _id
    
    User.findOne({ "_id": mongoose.Types.ObjectId(txnRefid) }, function (err, userData) {
      if (err || userData == undefined) reject(err);
      let bankAccounts = [];

      //retrieve transactions from Nodes using userid && orgPublickey
      Blockmodel.find({ txnRefid }, function(err, blocks) {
        if (err) reject(err);

        if(blocks.length){
          //list of all user ipfsHash == transactions on blocks
          const transArray = blocks.map( block => block.transactions );
          let count = 0;

          transArray.forEach((transaction,i) => { 
            //retrieve user txn_id for banks from ipfs using transaction of blocks
            Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
              if (err) reject(err);
              
              if(ipfsData){
                let accInfo = JSON.parse(ipfsData.userData);
                if(Object.keys(accInfo).filter(prop => prop.includes('accno'))){
                  bankAccounts.push(accInfo);
                } 
                count++;                    
                if(count == transArray.length){
                  resolve(accInfo);
                }            
              }              

            });
          });
          //end txnsArray

        }
        //no block found

      });
      //end Nodes

    });
  })
}

const fetchAcctInfo = () => {
  return new Promise((resolve,reject)=>{
    
    Blockmodel.find({ }, function(err, blocks) {
      if (err) reject(err);

      if(blocks.length){
        //list of all user ipfsHash == transactions on blocks
        const transArray = blocks.map( block => block.transactions );
        let count = 0;

        transArray.forEach((transaction,i) => { 
          //retrieve user txn_id for banks from ipfs using transaction of blocks
          Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
            if (err) reject(err);
            
            if(ipfsData){
              let accInfo = JSON.parse(ipfsData.userData);
              if(Object.keys(accInfo).filter(prop => prop.includes('accno'))){
                bankAccounts.push(accInfo);
              } 
              count++;                    
              if(count == transArray.length){
                
                resolve(accInfo);
              }            
            }              

          });
        });
        //end txnsArray

      }
      //no block found

    });
    //end Nodes

  })
}

const showMerkleTree = (arr) => {
  return new Promise((resolve,reject)=>{
    let result = [];
    for(let index = 0; index <= arr.length - 1; index+=2){
      let str_root = '';
      //check if not last index
      if(index !== arr.length -1){
        //str_root = current eleent + next element
        str_root = `${arr[index]},${arr[index+1]}`;
        result.push(str_root);
      }
      //check if it is last index and arr is odd
      if((arr.length % 2) !== 0 && index == arr.length -1){
        str_root = `${arr[index]}`;
        result.push(str_root);
      }
    }
    
    return result.length == 1 || result.length == 0 ? resolve(result) : showMerkleTree(result);
  })
}

const generateMerkle = arr => arr.join(',');

const processMerkle = (userID)=> {
  return new Promise((resolve,reject)=>{
    fetchAlltxnID(userID).then((txns)=>{
      //perform merke root generation login
      
      if(txns.length == 0){
        reject(null)
      }else{
        resolve(generateMerkle(txns),txns)
      }
    })
    .catch((err => reject(err)));
  });
}

/**
 * action
-ip
-client
-source
-type
-duration
-status: error/success
-message
-browser
-os
-action_data
 */
const logAction = (req, code, action_type, duration, status, message, action_data)=> {
  const url = `log.json`;
  const ra = reqPaser.parse(req.headers['user-agent']);

  const browser = ra.ua.family;
  const os = ra.os.family;
  const ip = req.connection.remoteAddress

  return new Promise((resolve,reject)=>{

    fs.readFile(url, 'utf8', (err, data)=>{
      if (err){
        reject(err);
      } else {
          const id = new Date().getTime();                
          const logs = JSON.parse(data);

          const log = { ip, code, action_type, duration, status, message, browser, os, action_data };

          logs.push(log); 
          const json = JSON.stringify(logs,null,2);

          fs.writeFile(url, json, 'utf8', (e,dt)=>{
            resolve(log);
          });
      }
  });
  });
}

module.exports = {

  /**
   * @param {String} orgPublickey
   * @param {Object} user_info
   * @returns {object} user  
   */
  create_citizen: (req, res) => {

    let { orgPublickey, user_info } = req.body;

    const start_time = new Date().getTime();
    let duration, message, status;
    const { code } = organization.find(org => org.publickey == orgPublickey);
    const action_type = "create citizen";

    if(!orgPublickey || !user_info){
      // return res.json({ status: 'error', message: 'Some fields are empty', data: null });

      duration = new Date().getTime() - start_time;   
      message = "Some fields are empty";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    }

    if(typeof(orgPublickey) !== 'string'){
      // return res.json({ status: 'error', message: 'Invalid parameter was sent', data: { orgPublickey, user_info } });

      duration = new Date().getTime() - start_time;   
      message = "Invalid parameter was sent";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  { orgPublickey, user_info })
        .then((data)=>{
          return res.json({ status, message, data: { orgPublickey, user_info } });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    }

    //1. generate a keypair
    const key = ec.genKeyPair();
    const privatekey = key.getPrivate('hex');
    const publickey = key.getPublic('hex');

    const userObj = buildUserobject(JSON.parse(user_info));
    // const ssoID = new Date().getTime(); //user ssoid from api
    const { ssoID } = userObj;
    let userData = { privatekey, publickey, orgPublickey, ssoID };
    let newUser = new User(userData);  

    newUser.save().then((data) => {
      
      //2. save data to ipfs and get an hash reference
      let ipfsData = {
        userPublickey: data.publickey,
        orgPublickey,
        userData: JSON.stringify(userObj)
      }

      let newIpfs = new Ipfs(ipfsData);
      newIpfs.save().then((ipfsUserdt)=>{
        const { _id } = ipfsUserdt; //get _id as ipfs hash

        //3. create and add block to blockchain
        Contract.addBlock(_id /*ipfs hash*/, data._id /*user id as txnRefid*/).then((d)=>{

          //4. broadcast to all other nodes in the network
          Contract.broadCast().then(()=>{
            const results = { ipfsUserdt, userData: JSON.parse(ipfsUserdt.userData) };            
            // return res.json({ status: 'success', message: 'Record mined successfully', data: {ipfsUserdt, publickey: ipfsUserdt.userPublickey, userid: data._id} });
            
            duration = new Date().getTime() - start_time;   
            message = "Record mined successfully";
            status = "success";            
            logAction(req, code, action_type, duration, status, message, {ssoID: data.ssoID, publickey: ipfsUserdt.userPublickey, userid: data._id})
              .then((data)=>{
                return res.json({ status, message, data: { ssoID: data.ssoID, publickey: ipfsUserdt.userPublickey, userid: data._id } });
              }).catch((err)=>{
                return res.json({ status, message, data: err });
              });

          }, (err)=>{
            console.log('error is ', err);
            // return res.json({ status: 'error', message: 'incomplete record process.', data: null });
            
            duration = new Date().getTime() - start_time;   
            message = "Incomplete record process";
            status = "error";            
            logAction(req, code, action_type, duration, status, message, null)
              .then((data)=>{
                return res.json({ status, message, data: null });
              }).catch((err)=>{
                return res.json({ status, message, data: err });
              });

          });
        }, (err)=>{
          console.log('error is ', err)
          // return res.json({ status: 'error', message: 'error creating block 1', data: null });

          duration = new Date().getTime() - start_time;   
          message = "Error creating block";
          status = "error";            
          logAction(req, code, action_type, duration, status, message, null)
            .then((data)=>{
              return res.json({ status, message, data: null });
            }).catch((err)=>{
              return res.json({ status, message, data: err });
            });
            
        });

      }).catch((error) => {
        console.log(JSON.stringify(error, null, 2));
        // return res.json({ status: 'error', message: 'error creating block 2', data });

        duration = new Date().getTime() - start_time;   
        message = "Error creating block";
        status = "error";            
        logAction(req, code, action_type, duration, status, message, null)
          .then((data)=>{
            return res.json({ status, message, data: null });
          }).catch((err)=>{
            return res.json({ status, message, data: err });
          });

      });
    }).catch((error) => {
      const data = null;
      console.log(JSON.stringify(error, null, 2));
      if (error) {
        if (error.name === 'MongoError' && error.code === 11000) {
          // return res.status(409).send({ status: 'error', message: 'User already exist!', data });

          duration = new Date().getTime() - start_time;   
          message = "User already exist!";
          status = "error";            
          logAction(req, code, action_type, duration, status, message, data)
            .then((data)=>{
              return res.json({ status, message, data: null });
            }).catch((err)=>{
              return res.json({ status, message, data: err });
            });

        }

        // return res.json({ status: 'error', message: 'error signing up user', data });
        duration = new Date().getTime() - start_time;   
        message = "Error signing up";
        status = "success";            
        logAction(req, code, action_type, duration, status, message, data)
          .then((data)=>{
            return res.json({ status, message, data: null });
          }).catch((err)=>{
            return res.json({ status, message, data: err });
          });
      }
    });
  },

  check_citizen: (req, res) => {
    const { orgPublickey, ssoID } = req.body;

    const start_time = new Date().getTime();
    let duration, message, status;
    const { code } = organization.find(org => org.publickey == orgPublickey);
    const action_type = "retrieve citizen";

    if(!ssoID){
      // return res.json({ status: 'error', message: 'Some fields are empty', data: null });

      duration = new Date().getTime() - start_time;   
      message = "Some fields are empty";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    }

    //retrieve user publickey using _id
    User.findOne({ ssoID }, function (err, userData) {
      if (err){
        // return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

        duration = new Date().getTime() - start_time;   
        message = "Data retrieval failed, please try again";
        status = "error";            
        logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
      }
        

      if(userData == undefined || userData == null){
        // return res.json({ status: 'success', err, message: 'Provided ID do not match any record', data: null });

        duration = new Date().getTime() - start_time;   
        message = "Provided ID do not match any record";
        status = "success";            
        logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
        
      }else{
        const { _id, publickey, ssoID } = userData; //user id
        /* data =  {
          ipfs: [], //hold list of user data in the array
          tnxids: [], //hold list of ipfs hash for each block,
          extras: {userid,publickey} //hold other data needed for processing
          blocks: [] //hold all block created for that user
        }*/
        let data = {};
        data['ipfsData'] = [];
        data['ipfsHash'] = [];      
        data['blocks'] = [];
        data['extras'] = {};

        //retrieve transactions from Nodes using userid && orgPublickey
        Nodes.find({ orgPublickey, txnRefid: _id }, function(err, blocks) {
          
          if (err){
            // return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

            duration = new Date().getTime() - start_time;   
            message = "Data retrieval failed, pls try again";
            status = "error";            
            logAction(req, code, action_type, duration, status, message,  null)
            .then((data)=>{
              return res.json({ status, message, data: null });
            }).catch((err)=>{
              return res.json({ status, message, data: err });
            });
          }          

          if(blocks.length){
            //list of all user ipfsHash == transactions on blocks
            const transArray = blocks.map( block => block.transactions );
            transArray.forEach((transaction,i) => {
              
              data.ipfsHash.push(transaction);
              //store
              //retrieve user record from ipfs using transaction of blocks
              Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
                
                if (err){
                  // return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

                  duration = new Date().getTime() - start_time;   
                  message = "Data retrieval failed, pls try again";
                  status = "error";            
                  logAction(req, code, action_type, duration, status, message,  null)
                  .then((data)=>{
                    return res.json({ status, message, data: null });
                  }).catch((err)=>{
                    return res.json({ status, message, data: err });
                  });
                }                

                if(i == transArray.length - 1){
                  let frmobj = JSON.parse(ipfsData.userData);
                  data.ipfsData.push(frmobj); //add last object
                  data.blocks = blocks.map(({ orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid }, index) => { 
                    return {
                      index, orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid
                    }
                  });
                  data['extras'] = {
                    userid: _id,
                    publickey,
                    ssoID
                  }
                                
                  // return res.json({ status: 'success', err, message: 'Record match', data });

                  duration = new Date().getTime() - start_time;   
                  message = "Record match";
                  status = "success";            
                  logAction(req, code, action_type, duration, status, message,  { ...data.extras })
                    .then((resDt)=>{
                      return res.json({ status, message, data });
                    }).catch((err)=>{
                      return res.json({ status, message, data: err });
                    });
                }

                if(ipfsData){
                  let frmobj = JSON.parse(ipfsData.userData);
                  //add user original saved data
                  data.ipfsData.push(frmobj);
                }

              });
            });

          }
          //no block found

        });
      //end Nodes
      }             

    });

  },
  
  save_new_fields: (req, res) => { //ipfs save new fields
    const { orgPublickey, userPublickey, txnRefid, user_info } = req.body;

    const start_time = new Date().getTime();
    let duration, message, status;
    const { code } = organization.find(org => org.publickey == orgPublickey);
    const action_type = "modify citizen";

    if(!orgPublickey || !user_info){
      // return res.json({ status: 'error', message: 'Some fields are empty', data: null });

      duration = new Date().getTime() - start_time;   
      message = "Some fields are empty";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    }

    if(typeof(orgPublickey) !== 'string'){
      // return res.json({ status: 'error', message: 'Invalid parameter was sent', data: null });
      duration = new Date().getTime() - start_time;   
      message = "Invalid parameter was sent";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    }
    
    const userObj = buildUserobject(JSON.parse(user_info));
    const { userid, publickey, ssoID } = userObj;

    let ipfsData = {
      userPublickey,
      orgPublickey,
      userData: JSON.stringify(userObj)
    }

    let newIpfs = new Ipfs(ipfsData);
    newIpfs.save().then((ipfsUserdt)=>{
      const { _id } = ipfsUserdt; //get ipfshash
      
      //add block to blockchain network
      Contract.addBlock(_id /*ipfs hash*/, txnRefid).then((d)=>{
        //broadcast to all nodes
        Contract.broadCast().then(()=>{
          // return res.json({ status: 'success', message: 'Record mined successfully', data: ipfsUserdt });
          duration = new Date().getTime() - start_time;   
          message = "Record mined successfully";
          status = "success";            
          logAction(req, code, action_type, duration, status, message,  { userid, publickey, ssoID })
            .then((data)=>{
              return res.json({ status, message, data: ipfsUserdt });
            }).catch((err)=>{
              return res.json({ status, message, data: err });
            });
        }, (err)=>{
          console.log('error is ', err);
          // return res.json({ status: 'error', message: 'incomplete record process.', data: null });
          duration = new Date().getTime() - start_time;   
          message = "Incomplete record process";
          status = "error";            
          logAction(req, code, action_type, duration, status, message,  null)
            .then((data)=>{
              return res.json({ status, message, data: null });
            }).catch((err)=>{
              return res.json({ status, message, data: err });
            });
        });
      }, (err)=>{
        console.log('error is ', err)
        // return res.json({ status: 'error', message: 'error creating block 1', data: null });
        duration = new Date().getTime() - start_time;   
        message = "Error creating block";
        status = "error";            
        logAction(req, code, action_type, duration, status, message,  null)
          .then((data)=>{
            return res.json({ status, message, data: null });
          }).catch((err)=>{
            return res.json({ status, message, data: err });
          });
      });
    }).catch((error) => {
      console.log(JSON.stringify(error, null, 2));
      // return res.json({ status: 'error', message: 'error creating block 2', data: null });
      duration = new Date().getTime() - start_time;   
      message = "Error creating block";
      status = "error";            
      logAction(req, code, action_type, duration, status, message,  null)
        .then((data)=>{
          return res.json({ status, message, data: null });
        }).catch((err)=>{
          return res.json({ status, message, data: err });
        });
    });
  },

  //tamper with record
  update_mod_fields: (req, res) => { //ipfs save modified fields
    
    const { userPublickey, txnRefid, postData } = req.body;
    const orgPublickey = (req.session.user.usertype == 'organization') ? req.session.user.pkey : null;
    //remove from data
    delete req.body.userPublickey;
    delete req.body.txnRefid;

    if(postData.length == 0) return res.json({ status: 'success', message: 'Nothing to update', data: null });

    postData.forEach((updateObj, i)=>{
      //save data to ipfs and get an hash reference
      const { txnid } = updateObj;

      //clean updateobj
      delete updateObj.txnid; 
      delete updateObj.is_edited;

      let ipfsData = {
        userPublickey,
        orgPublickey,
        userData: JSON.stringify(updateObj)
      }

      let newIpfs = new Ipfs(ipfsData);

      newIpfs.save().then((ipfsUserdt)=>{
        const { _id } = ipfsUserdt; //get new ipfshash i.e transactions
        
        //update organization block to blockchain network
        Contract.updateNodeBlock(txnid /*old ipfs hash*/, _id /*new ipfs hash*/, txnRefid, orgPublickey).then((d)=>{
          
          if(i === postData.length - 1) return res.json({ status: 'success', message: 'update successful', data: d });
        }, (err)=>{
          //update error
          console.log('error is ', err)
          return res.json({ status: 'error', message: 'error updating block node 1', data: null });
        });
      }).catch((error) => {
        console.log(JSON.stringify(error, null, 2));
        return res.json({ status: 'error', message: 'error updating block node 2', data });
      });

    });//end of postData loop

  },

  getMyUsers: (req, res) => {
    const { orgPublickey } = req.body;

    if(!orgPublickey){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    Ipfs.find({ orgPublickey }, function(err, ipfsData) {
      if (err)
        return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });
      return res.json({ status: 'error', err, message: 'Data successfully retrieve', data: ipfsData });
    });

  },

  getUser: (req, res) => {
    const { orgPublickey, userPublickey } = req.body;

    if(!userPublickey){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    if(!orgPublickey){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    //retrieve user publickey using _id
    User.findOne({ publickey: userPublickey }, function (err, userData) {
      if (err)
        return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

      if(userData == undefined)
        return res.json({ status: 'success', err, message: 'Provided ID do not match any record', data: null });

      const { _id, publickey } = userData; //user id
      
      let data = {};
      data['ipfsData'] = [];
      data['ipfsHash'] = [];      
      data['blocks'] = [];
      data['extras'] = {};

      //retrieve transactions from Nodes using userid && orgPublickey
      Nodes.find({ orgPublickey, txnRefid: _id }, function(err, blocks) {
        
        if (err)
          return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

        if(blocks.length){
          //list of all user ipfsHash == transactions on blocks
          const transArray = blocks.map( block => block.transactions );
          transArray.forEach((transaction,i) => {
            
            data.ipfsHash.push(transaction);
            //store
            //retrieve user record from ipfs using transaction of blocks
            Ipfs.findOne({ "_id": mongoose.Types.ObjectId(transaction) }, function (err, ipfsData) {
              
              if (err)
                return res.json({ status: 'error', err, message: 'Data retrieval failed, pls try again', data: null });

              if(i == transArray.length - 1){
                let frmobj = JSON.parse(ipfsData.userData);
                data.ipfsData.push(frmobj); //add last object
                data.blocks = blocks.map(({ orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid }, index) => { 
                  return {
                    index, orgPublickey, timestamp, transactions, nonce, previousHash, hash, txnRefid
                  }
                 });
                data['extras'] = {
                  userid: _id,
                  publickey,
                }
                              
                return res.json({ status: 'success', err, message: 'Record match', data });
              }

              if(ipfsData){
                let frmobj = JSON.parse(ipfsData.userData);
                //add user original saved data
                data.ipfsData.push(frmobj);
              }

            });
          });

        }
        //no block found

      });
      //end Nodes
    })

  },

  my_node: function(req, res){
    const { orgPublickey } = req.body;

    if(!orgPublickey){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }
    
    Contract.myNode(orgPublickey).then((data)=>{
      return res.json({ status: 'success', message: 'Nodes fetched', data });
    }, (err)=>{
      //update error
      console.log('error is ', err);
      return res.json({ status: 'error', message: 'error fetching blocks', data: null });
    }).
    catch((error) => {
      console.log(JSON.stringify(error, null, 2));
      return res.json({ status: 'error', message: 'error fetching blocks', data: null });
    });
  },

  all_node: function(req, res){

    const { orgPublickey } = req.body;

    if(!orgPublickey){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    Contract.allNode().then((data)=>{
      return res.json({ status: 'success', message: 'Nodes fetched', data });
    }, (err)=>{
      //update error
      console.log('error is ', err);
      return res.json({ status: 'error', message: 'error fetching blocks', data: null });
    }).
    catch((error) => {
      console.log(JSON.stringify(error, null, 2));
      return res.json({ status: 'error', message: 'error fetching blocks', data: null });
    });
  },

  validate_a_block: function (req, res) {
    const { orgPublickey, transactions } = req.body;
      
    if(!orgPublickey || !txnid){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    //retrieve block using transactions
    Blockmodel.findOne({ transactions }, function (err, data) {
      if (err)
        res.json({ status: 'error', err, message: 'validation failed, pls try again', data: null });
  
      //get all blocks and validate chain
      Blockmodel.find({}, function (err, blocks) {
        if (err)
          res.json({ status: 'error', err, message: 'Validation failed, pls try again', data: null });
  
        // blocks[2].previousHash = 'anything can be put here'; //modify to test chain
  
        const blockchain = new Blockchain(blocks);
        const isBlockvalid = blockchain.isChainValid();
  
        if (isBlockvalid) {
          res.json({ status: 'success', message: 'Block is valid', data });
        } else {
          let currBlockTampered = blockchain.confirmTamperedBlock(data);
  
          if (currBlockTampered){
            res.json({ status: 'success', message: 'Block is invalid', data });
          }else{
            res.json({ status: 'success', message: 'Blockchain has been tampered with but current block is valid', data });
          }
        }
  
      });
  
    });
  
  },

  get_templates: function(req,res){
    Fingerprint.find({ active: true }, function (err, data) {
      if (err)
        return res.json({ status: 'error', err, message: 'An error occur', data: null });

      if(data.length == 0)
        return res.json({ status: 'success', message: 'No template found', data });
      
      data = data.map((obj)=> {
        const { fingerTemplate, ssoid } = obj;
        return { temp: fingerTemplate, id: ssoid }
      })
      return res.json({ status: 'success', message: 'Fingers template retrieved', data });
    });
  },

  save_template: function(req,res){
    const { temp, ssoid } = req.body;

    const fingerData = {
      fingerTemplate: temp,
      active: false,
      ssoid
    }

    let newFP = new Fingerprint(fingerData);
    newFP.save().then((data)=>{
      const { _id, fingerTemplate, ssoid } = data;
      return res.json({ status: 'success', message: 'Fingerprint captured successfully', data: { id: _id, temp: fingerTemplate, ssoid } });
    })
    .catch((err)=>{
      console.log(err);
      return res.json({ status: 'error', message: err, data: null });
    })
  },

  process_txn: (req, res) => { //ipfs save new fields
    const { orgPublickey, userPublickey, txnRefid, txnObj } = req.body;

    if(!orgPublickey || !userPublickey || !txnObj || !txnRefid){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    let ipfsData = {
      userPublickey,
      orgPublickey,
      userData: JSON.stringify(txnObj)
    }

    let newIpfs = new Ipfs(ipfsData);
    newIpfs.save().then((ipfsUserdt)=>{
      const { _id } = ipfsUserdt; //get ipfshash
      //add block to blockchain network
      Contract.addBlock(_id /*ipfs hash*/, txnRefid).then((d)=>{
        //broadcast to all nodes
        Contract.broadCast().then(()=>{
          //create merkle root for transaction
          processMerkle(txnRefid).then((merkle,txns)=>{
            //save merkle info
            Contract.addMerkle(merkle, txnRefid).then((merkleInfo)=>{  
                  
              return res.json({ status: 'success', message: 'Transanction successful', data: { ipfsUserdt, merkleInfo, txns } });
            }).catch((err)=>{
              console.log('error is 2', err);
              return res.json({ status: 'error', message: 'Error creating txn merkle root, try again.', data: err });
            });
          })
          .catch((err)=>{
            console.log('error is 1 ', err);
            return res.json({ status: 'error', message: 'Error creating txn merkle root, try again.', data: err });
          });
        }, (err)=>{
          console.log('error is ', err);
          return res.json({ status: 'error', message: 'incomplete record process.', data: null });
        });
      }, (err)=>{
        console.log('error is ', err)
        return res.json({ status: 'error', message: 'error creating block 1', data: null });
      });
    }).catch((error) => {
      console.log(JSON.stringify(error, null, 2));
      return res.json({ status: 'error', message: 'error creating block 2', data: null });
    });
  },

  /**
   * TODO:
   * 1. Fetch userData from ipfs that contains account info
   * 2. Extract bank name and acct number to build bankList
   * 3. Fetch all txns
   * 4. Add all txn amount together
   */
  account_info: (req, res) => {
    const { txnRefid } = req.body;
    
    if(!txnRefid){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    //Fetch userData from ipfs that contains account info
    fetchAcctInfoWithID(txnRefid).then((acctList)=>{
      let bankList = [];
      let result = [];

      //Extract bank name and acct number to build bankList
      acctList.forEach((acct)=>{
        const bankName = Object.keys(acct).filter(prop => prop.includes('accno')).toString();
        const acctNumber = acct[Object.keys(acct).filter(prop => prop.includes('accno')).toString()];
        bankList.push({ bankName, acctNumber });
      });

      //Fetch all txn
      fetchAlltxn(txnRefid).then((txns)=>{
        let count = 0;
        //fetch balance for each bank account
        bankList.forEach(({bankName, acctNumber },index)=>{
          //get all money that comes into acct
          const amountIn = txns.filter((txn)=> {
            if(Object.keys(txn).filter(prop => prop.includes('accno')).toString() == bankName && txn.txn_type == 'deposit'){
              return txn.amount;
            }
            if(Object.keys(txn).filter(prop => prop.includes('accno')).toString() == bankName && txn.to == acctNumber && txn.txn_type == 'transfer'){
              return txn.amount;
            }
          });
          //get all money that goes out of acct
          const amountOut = txns.filter((txn)=> {
            if(Object.keys(txn).filter(prop => prop.includes('accno')).toString() == bankName && txn.txn_type == 'withdraw'){
              return txn.amount;
            }
            if(Object.keys(txn).filter(prop => prop.includes('accno')).toString() == bankName && txn.from == acctNumber && txn.txn_type == 'transfer'){
              return txn.amount;
            }
          });

          //calculate balance
          const balance = amountIn - amountOut;
          result.push({ bankName, acctNumber, balance });
          count++;

          if(count == bankList.length){
            return res.json({ status: 'success', message: 'Account info retrieved', data: result });
          }

        });

      });

      

    });

  },

  check_account: (req, res) => {
    const { account_no } = req.body;
    
    if(!account_no){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    //Fetch userData from ipfs that contains account info
    fetchAcctInfo(txnRefid).then((acctList)=>{

      //Extract bank name and acct number to build bankList
      const existObj = acctList.find((acct) => {
        const acctNumber = acct[Object.keys(acct).filter(prop => prop.includes('accno')).toString()];
        return acctNumber == account_no;
      });
      
      if(existObj){
        return res.json({ status: 'success', message: 'Account exist', data: existObj });
      }else{
        return res.json({ status: 'error', message: 'Account does not exist', data: null });
      }

    });

  },

  log_action: (req, res) => {
    const { code, action_type, duration, status, message, action_data } = req.body;

    if(!code || !action_type || !status || !message){
      return res.json({ status: 'error', message: 'Some fields are empty', data: null });
    }

    logAction(req, code, action_type, duration, status, message, action_data)
    .then((data)=>{
      return res.json({ status: 'success', message: 'Log inserted.', data });
    }).catch((err)=>{
      return res.json({ status: 'error', message: 'Unable to insert log.', data: err });
    });
  },

  report: (req, res) => {
    const { action_type } = req.body;
    const url = `log.json`;

    console.log("action type: ", action_type);

    fs.readFile(url, 'utf8', (err, data)=>{
      if (err){
        return res.json({ status: 'error', message: 'Error reading file', data: err });
      } else {               
          const logs = JSON.parse(data);
          const result = logs.filter((info)=> info.action_type.toLowerCase() == action_type);
          return res.json({ status: 'success', message: 'Record retrieved.', data: result });
      }
    });
  }

}
