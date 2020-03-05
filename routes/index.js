'use strict';

const fs = require('fs');
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data

module.exports = function (app) {
    const Ctrl = require('../controllers/main.controller');

    // user
    app.route('/api/create_citizen')
        .post(Ctrl.create_citizen);

    app.route('/api/check_citizen')
        .post(Ctrl.check_citizen);    

    app.route('/api/save_new_fields')
        .post(Ctrl.save_new_fields);

    app.route('/api/getMyUsers')
        .post(Ctrl.getMyUsers);

    app.route('/api/getUser')
        .post(Ctrl.getUser);

    app.route('/api/get_my_nodes')
        .post(Ctrl.my_node);

    app.route('/api/get_all_nodes')
        .post(Ctrl.all_node);

    app.route('/api/post_txn')
        .post(Ctrl.process_txn);

    app.route('/api/account_info')
        .post(Ctrl.account_info);

    app.route('/api/check_account')
        .post(Ctrl.check_account);

    app.route('/api/get_templates')
        .post(Ctrl.get_templates)
        .get(Ctrl.get_templates);

    app.route('/api/save_template')
        .post(Ctrl.save_template);

    app.route('/api/log_action')
        .post(Ctrl.log_action);

    app.route('/api/report')
        .post(Ctrl.report);

    /* upload logic start here */
    app.post('/api/upload_passport', upload.array(), function(req, res) {
        const base64Data = req.body.fileUrlstring.replace(/^data:image\/jpeg;base64,/, "");
        const fileurl = Date.now() + '.png';
        fs.writeFile(`public/uploads/${fileurl}`, base64Data, 'base64', function(err) {
            if (err) {
                return res.json({ status: 'error', message: 'Upload failed', data: err });
            }
            return res.json({ status: 'success', message: 'Upload successful', data: {fileurl} });
        });
    });
        
     app.route('*')
        .get((req,res)=>{
            res.send({
                status: 'error',
                message: 'Invalid endpoint',
                data: null
            })
        })
        .post((req,res)=>{
            res.send({
                status: 'error',
                message: 'Invalid endpoint',
                data: null
            })
        })            
};
