// 'use strict';
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');
// const organization = require('./organization');

// //1. generate a keypair
// const key = ec.genKeyPair();
// const privatekey = key.getPrivate('hex');
// const publickey = key.getPublic('hex');

// console.log({ privatekey, publickey });


// // const concatNameFields = (obj)=> {
// // 	const nameFields = Object.keys(obj).filter((field)=> field.includes('name'));
// // 	if(!nameFields.length) return '';
// // 	let str = [];
// // 	for(let prop in obj){
// // 		if(nameFields.indexOf(prop) !== -1){
// // 			str.push(obj[prop]);
// // 		}
// // 	}
// // 	if(!str.length) return '';
// // 	//concatenate the STR
// // 	str = str.join(',');
// // 	if(!str.trim().includes(' ')){
// // 		return str;
// // 	}
// // 	//split STR and return concatenated STR
// // 	return str.split(' ').join(',');
// // }

// // const buildUserobject = (obj)=> {
// // 	let userObj = {};
// // 	const otherFields = Object.keys(obj).filter((field)=> !field.includes('name'));
// // 	for(let prop in obj){
// // 		if(otherFields.indexOf(prop) !== -1) userObj[prop] = obj[prop];
// // 		if(concatNameFields(obj) !== '') userObj['name'] = concatNameFields(obj);
// // 	}
// // 	return userObj;
// // }

// // const nimcUser = {"firstname": "Ahmed", "lastname": "Olanrewaju", "othername": "Olayinka", "dob": "17/06/1993", "gender": "Male", "nin": "1563455837427"};
// // const nisUser = { fullname: "Ahmed Olanrewaju Olayinka", "dob": "17/06/1993", "gender": "Male", passport_no: '6323764', dateissue: '20/08/2019'};
// // console.log(buildUserobject(nisUser));
const txns = ['44','556'];
let count = 0;

console.log(`=================================`);
function generateMerkle(arr){
    count++;
	let result = [];
    
    for(index = 0; index <= arr.length - 1; index+=2){
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

    console.log(`root ${count} | lenght= ${result.length}`, result);
	return result.length == 1 || result.length == 0 ? result: generateMerkle(result);
}

generateMerkle(txns);
console.log(`=================================`);