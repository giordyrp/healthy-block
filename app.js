const express = require('express');
const bodyParser = require('body-parser');
//const mysql = require('mysql');
const { Client } = require('pg');
const app = express();
const cors = require('cors');


const { getMH, updateMH, getAgent, insertAgent, insertAppointment, insertHemoglobinRecord } = require('./utils/crud');
const { watchEvents, synchronize } = require('./utils/methods');
const port = 5000;

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
/*const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'medbc'
});*/

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'medbc',
    password: 'password',
    port: 5432,
});

async function connectDB() {
    await db.connect();
    console.log('Connected!');
}
connectDB();


 
watchEvents();
 
// connect to database
/*db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});*/

global.db = db;

// configure middleware

// 
//synchronize(); 
app.use(cors());
app.use(bodyParser.json()); // parse form data client

// routes for the app

app.post('/get_mh', getMH);
app.post('/update_mh', updateMH);
app.post('/get_agent', getAgent);
app.post('/insert_agent', insertAgent);
app.post('/insert_appointment', insertAppointment);
app.post('/insert_hemoglobin_record', insertHemoglobinRecord);



// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});