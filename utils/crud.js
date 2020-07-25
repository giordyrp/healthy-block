module.exports = {
    getAgent: getAgent,
    insertAgent: insertAgent,
    insertAgentIntoDB: insertAgentIntoDB,
    getMH: getMH,
    getMHFromDB:getMHFromDB,
    insertMH: insertMH,
    updateMHfromDB: updateMHfromDB,
    updateMH: updateMH,
    insertAppointment: insertAppointment,
    insertAppointmentFromDB: insertAppointmentFromDB,
    insertHemoglobinRecord: insertHemoglobinRecord,
    insertHemoglobinRecordFromDB: insertHemoglobinRecordFromDB,
    getAppointments: getAppointments,
    getHemoglobinRecords: getHemoglobinRecords,
    updateAppointmentSent: updateAppointmentSent,
    updateHemoglobinRecordSent: updateHemoglobinRecordSent
};

const { registerAgent, getContractAddresses, setMHistoryAll, addHaemoglobinRecord , addAppointment, getSynchronizeInterval, findAgentAndUpdateDB, watchEventsForPatient} = require('./methods');

function updateAppointmentSent(mhAddress, apDate) {
    return new Promise((res, rej) => {
        let query = `UPDATE appointment SET "sent"='yes' WHERE "mhAddress"='${mhAddress}' AND "apDate"='${apDate}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else { 
                res(result);               
            }
        }); 
    });
} 


function updateHemoglobinRecordSent(mhAddress, rDate) {
    return new Promise((res, rej) => {
        let query = `UPDATE hemoglobin_record SET "sent"='yes' WHERE "mhAddress"='${mhAddress}' AND "rDate"='${rDate}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else { 
                res(result);               
            }
        }); 
    });
}

function getHemoglobinRecords(data) { 
    return new Promise((res, rej) => {
        const { contractAddress } = data;
        let query = `SELECT * FROM hemoglobin_record WHERE "mhAddress" = '${contractAddress}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);               
            }
        });
    });
} 

async function insertHemoglobinRecord(req, res) {
    const { contractAddress, patientAddress, userAddress, value, date } = req.body;

    const transaction = await addHaemoglobinRecord(contractAddress, value, date, userAddress, patientAddress);

    const sent = transaction === 'error' ? 'no' : 'yes';

    const data = { 
        ...req.body,
        sent: sent
    };
    insertHemoglobinRecordFromDB(data)
        .then(result => {
            res.json(result);
            res.end(); 
        })
        .catch(err => { 
            res.json(err);
            res.end();
        });
}

function insertHemoglobinRecordFromDB(data) {
    return new Promise((res, rej) => {
        const { contractAddress, value, date, sent } = data;
        let query = `INSERT INTO hemoglobin_record ("mhAddress", "rValue", "rDate", "sent") VALUES ('${contractAddress}','${value}','${date}','${sent}')`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else { 
                res(result);               
            }
        }); 
    });
}
setTimeout(()=> getAppointments({contractAddress: '0x693eC8D5973d94aA644F992beD54053F5e6f50cC'}), 3000);
function getAppointments(data) {
    return new Promise((res, rej) => {
        const { contractAddress } = data;
        let query = `SELECT * FROM appointment WHERE "mhAddress" = '${contractAddress}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);               
            }
        });
    });
}

async function insertAppointment(req, res) {
    const { contractAddress, patientAddress, userAddress, description, date, doctor } = req.body;
    const transaction = await addAppointment(contractAddress, description, date, doctor, userAddress, patientAddress);

    const synchronizeInterval = getSynchronizeInterval();
    console.log(`synchronizeInterval: ${synchronizeInterval}`);
    const data = {
        ...req.body,
        sent: synchronizeInterval ? 'no' : 'yes'
    };
    insertAppointmentFromDB(data) 
        .then(result => {
            res.json(result);
            res.end(); 
        })
        .catch(err => {
            res.json(err);
            res.end();
        });
}

function insertAppointmentFromDB(data) {
    return new Promise((res, rej) => {
        const { contractAddress, description, date, doctor, sent } = data;
        let query = `INSERT INTO appointment ("mhAddress", "apDescription", "apDate", "doctor", "sent") VALUES ('${contractAddress}','${description}','${date}','${doctor}','${sent}')`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else { 
                res(result);               
            }
        }); 
    });
}


function updateMHfromDB(data) {
    return new Promise((res, rej) => {
        const { contractAddress, fullName, homeAddress, phoneNumber, mhVersion } = data;
        let query = `UPDATE medical_history SET "fullName"='${fullName}', "homeAddress"='${homeAddress}', "phoneNumber"='${phoneNumber}', "mhVersion"='${mhVersion}' WHERE "mhAddress" = '${contractAddress}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);               
            }
        });
    });
    
}

function updateMH(req, res){
    updateMHfromDB(req.body)
        .then(async result => {
            const { contractAddress, patientAddress, userAddress, fullName, homeAddress, phoneNumber, mhVersion } = req.body;
            const transaction = await setMHistoryAll(mhVersion, contractAddress, fullName, homeAddress, phoneNumber, userAddress, patientAddress);

            res.json(result);
            res.end(); 
        })
        .catch(err => {
            res.json(err);
            res.end(); 
        });
}

function insertMH(data) {
    const { contractAddress, patientAddress, fullName, homeAddress, phoneNumber, mhVersion } = data;

    let query = `INSERT INTO medical_history ("mhAddress", "ptAddress", "fullName", "homeAddress", "phoneNumber", "mhVersion") VALUES ('${contractAddress}','${patientAddress}','${fullName}','${homeAddress}','${phoneNumber}','${mhVersion}')`;
    db.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);             
        }
    });
}

function getMH(req, res){
    getMHFromDB(req.body) 
        .then(result => {
            res.json(result);
            res.end(); 
        })
        .catch(err => {
            res.json(err);
            res.end();
        });
}

function getMHFromDB(data) {
    return new Promise((res, rej) => {
        const { contractAddress } = data;
        let query = `SELECT * FROM medical_history WHERE "mhAddress" = '${contractAddress}'`;
        db.query(query, async (err, result) => {
            if (err) {
                rej(err);
            } else {

                if (result.rows.length > 0) {
                    const mhInfo = result.rows[0];
                    const appointments = await getAppointments(data);
                    const hemoglobinRecords = await getHemoglobinRecords(data);     
                    mhInfo.appointments = appointments.rows;
                    mhInfo.hemoglobinRecords = hemoglobinRecords.rows;
                    result.rows = [mhInfo];
                }
                res(result);                
            }
        });
    });

}

async function insertAgent(req, res){
    const { agentName, uid, did, agentPassword, agentType, passPhrase, publicKey } = req.body;

    const account = await registerAgent(agentName, uid, did, agentPassword, agentType, passPhrase, publicKey);

    let addresses = await getContractAddresses(account.address, agentType);
    if (agentType === "pt"){
        const data = {
            contractAddress:  addresses.mhAddress, 
            patientAddress: account.address, 
            fullName: '', 
            homeAddress: '', 
            phoneNumber: '', 
            mhVersion: 'v0' 
        };
        insertMH(data);
        watchEventsForPatient(addresses.mhAddress, account.address);
    }

    const {agentAddress, mhAddress} = addresses;
    const data = {
        agentAddress, 
        userAddress: account.address, 
        userPrivateKey: account.privateKey.split("0x")[1], 
        agentName, 
        uid, 
        did, 
        agentPassword, 
        agentType, 
        publicKey, 
        mhAddress
    }
    
    try {
        console.log('entro al try');
        await insertAgentIntoDB(data);
        console.log(account);
        res.json(account);
        res.end();
    } catch (err) {
        console.log('entro al catch');
        console.log(err);
        res.json(err);
        res.end();
    }
    
} 

function insertAgentIntoDB(data) {
    return new Promise((res, rej) => {
        const { agentAddress, userAddress, userPrivateKey, agentName, uid, did, agentPassword, agentType, publicKey, mhAddress } = data;
        let query = `INSERT INTO agent ("agentAddress", "userAddress", "userPrivateKey", "agentName", "uid", "did", "agentPassword", "agentType", "publicKey", "mhAddress") VALUES ('${agentAddress}','${userAddress}','${userPrivateKey}','${agentName}','${uid}','${did}','${agentPassword}','${agentType}','${publicKey}',${(mhAddress ? `'${mhAddress}'` : null)})`;

        db.query(query, (err, result) => {
            console.log('Query', err, result);
            if (err) {
                rej(err);
            } else {
                res(result);                
            }
        });
        console.log("nada");
    });
}

async function getAgent (req, res){

    let result = await getAgentFromDB(req.body);
    if (result.rows.length === 0) {
        await findAgentAndUpdateDB(req.body.userAddress);
    }
    result = await getAgentFromDB(req.body);
    res.json(result);               
    res.end();
}

function getAgentFromDB(data) {
    return new Promise((res, rej) => {
        const { userAddress } = data;
        let query = `SELECT * FROM agent WHERE "userAddress" = '${userAddress}'`;
        db.query(query, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);              
            }
        });
    });
}

