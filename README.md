

A. ORGANIZATION
    a. login
    b. register/verify
    c. verification
    d. summary
    e. record

    i. Database structure for organization
        a. organization - name, address, phone, hid, id, privatekey, publickey
        b. users - name, privatekey, publickey, ohid, id, hid, role

        c. citizen 
            (NIMC) - surname, firstname, middlename, dob, gender, nin, address, fileurl
            (NIS) - fullname, dob, gender, passport_no, address, fileurl
            (FRSC) - surname, othername, dob, gender, driver_license, address, fileurl
            (BANK) - lastname, firstname, othername, dob, gender, bvn, address, fileurl 
            
B. BLOCKCHAIN - block, ipfs, nodes,
    a. 
    user - privatekey, publickey 
    ipfs - _id, userPublickey, orgPublickey, userData 
    block - _id, timestamp, transactions(ipfs id), nonce, previousHash, hash, txnRefid (citizen id) 
    nodes - _id, orgPublickey, timestamp, transactions(ipfs id), nonce, previousHash, hash, txnRefid (citizen id) 

    { name, lastname}
    { age }
    { name, age }

RETREIVING
userPublickey -> node (orgPublickey, txnRefid(user_id)) -> all ipfsh related to user -> ipsh retrieve main user info -> userData

COMPARING


CONFLICT RESOLUTION

