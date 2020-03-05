const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 8900;

app.use(cors());

//connect to database
const mongoose = require('mongoose');
const credentials = require('./credentials');

const opts = {
  useNewUrlParser: true
};

console.log("which environment ?", app.get('env'));

const url = ( app.get('env') === 'development') ? credentials.mongo.development.connectionString :credentials.mongo.production.connectionString;
mongoose.set('useCreateIndex', true);

mongoose.connect(url, opts, (err, conn) => {
  if (err) {
    console.log("Couldn't connect to database", err);
  } else {
    console.log(`Connected To Database==================`,
    { name: conn.name, 
      host: conn.host, 
      port: conn.port, 
      user: conn.user, 
      pass: conn.pass, 
      url: conn.client.s.url,
      database: {
        name: conn.db.databaseName,
        models: conn.models
      } 
    });
    console.log(`/=======================================`);
    //run initial pushing of organizations to the database
  }
}
);

// define database schemas
const User = require('./models/users.model');
const Ipfs = require('./models/ipfs.model');
const Block = require('./models/block.model');
const Nodes = require('./models/nodes.model');
const Merkle = require('./models/merkle.model');
const Fingerprint = require('./models/finger.model');

// configure bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "iy98hcbh489n38984y4h498",
    resave: true,
    saveUninitialized: false
  })
);


app.use(express.static('public/'));

//register api route
require('./routes')(app);

//spin up server 
app.listen(PORT, ()=> {
  console.log("server started on PORT http://localhost:" + PORT);
});