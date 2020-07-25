const Web3 = require('web3');
const ethereumjs = require('../js/ethereumjs-tx-1.3.3.min.js');
const platformJSON = require('../ABIs/Platform.json');
const agentJSON = require('../ABIs/Agent.json');
const patientJSON = require('../ABIs/Patient.json');
const medicalHistoryJSON = require('../ABIs/MedicalHistory.json');
const forge = require('node-forge'); 
//const ethereumjs = require('ethereumjs-tx') 
const { 
  insertMH: insertMH,
  updateMHfromDB, 
  getAppointments,
  insertAgentIntoDB, 
  insertAppointmentFromDB, 
  getHemoglobinRecords, 
  insertHemoglobinRecordFromDB, 
  getMHFromDB,
  updateAppointmentSent,
  updateHemoglobinRecordSent, 
} = require('./crud');

const rpcServer = 'ws://127.0.0.1:7545';
let web3Provider = new Web3.providers.WebsocketProvider(rpcServer);
let web3 = new Web3(web3Provider);
//0x068109157F135bf2507492d31a9B2A8677843807
const platformAddress = "0x1e4f6027D6fF2A1d56aF2deb75f61154593df9F0";
let platformContract = new web3.eth.Contract(platformJSON.abi, platformAddress);


const rootAddress = "0x940Ba40C7c75074713D5c761E1bdDE72d2B11339";
const rootPrivateKey = "02fc7a6d49d520cd1a8881bd5ab8c51365073a607fedb57c27de9d597bfe0ff8";
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsDjQIaSkq6+iv8ylv/Wq
VefViU7ZpMW6QLtd1LyViwHPhK1O0tix4t4G10GGbiWGRclLlkpxMVyoJIj1frX9
QS1awZXkqQpndW88r6vR8xugV1AZYfEkXcwXKeVx0YF5xiRlk6ii/VnvT8sL4jdJ 
2XoVbTmvRHzPLkKAeQBXUZGM8DEaRc6aMXif9iksuGTH0bLleC6Cm1puVNuNmxDU
9tZjalRdv/wQfnO7EA3pWmS3PpOgXROEvfMTO1oM0zFgQyX4kM8QLeCfjjUdUrjb
aPxjYMU0uC0iu0zXYfLZjtjbJbGMlNFKrWRQtNtspLejAnuGDBC4IuO/QmwPMsCf
GQIDAQAB
-----END PUBLIC KEY-----`;
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsDjQIaSkq6+iv8ylv/WqVefViU7ZpMW6QLtd1LyViwHPhK1O
0tix4t4G10GGbiWGRclLlkpxMVyoJIj1frX9QS1awZXkqQpndW88r6vR8xugV1AZ
YfEkXcwXKeVx0YF5xiRlk6ii/VnvT8sL4jdJ2XoVbTmvRHzPLkKAeQBXUZGM8DEa
Rc6aMXif9iksuGTH0bLleC6Cm1puVNuNmxDU9tZjalRdv/wQfnO7EA3pWmS3PpOg
XROEvfMTO1oM0zFgQyX4kM8QLeCfjjUdUrjbaPxjYMU0uC0iu0zXYfLZjtjbJbGM
lNFKrWRQtNtspLejAnuGDBC4IuO/QmwPMsCfGQIDAQABAoIBABz8e1/NUTjcXwzl
gK4enrIavEklqy8rRwO2zixcCM0gsx3D1B9ifYAvvThTEuWzTm7UOZazEANqlk3M
KXV6Qfoil7cYDNCxYWszrOvIe3RdqvYxursdiznShEzj7ODlRz6MZhjvuD+sN20M
nRvMtF0Nc9DPmEDPttSJI9DDeZl07bSWL/3NRkTwjuQmWmOZt3/ziBMIZJLdkgYZ
PtRpSIe4dUkb9AZ3pY2UxHpR37DWG5li42V9qiwLrkAFYaQQQ+A9MkK6qRhbHCwP
D4ttC9uIG986TuQSSxmqZo7wi3veypmfRf+YeicEBvXEhLtE/OEb9rgT+6cREVUH
Y7gjJsECgYEA1xoehm7KxGFtH1sqbz8sB3axW3u6zXJA+g1HY9cwsv4WKRWAHMpF
njQV9qHCtAaRmGCxpTn/oSfpGMhZujZhJ6/dsQ8w8sTbzu/GpVrPXRZ9yiyO2tyB
PE9JjnQu6f6Bryl2aNg7VKfGdwpxdjRNk8WUud5AQv5zmIWlB8CSKJ0CgYEA0bo+
Kh2QIoM5q//YflpxMn6miYuXh0wx8NH/YrhhA0QOGKrcfbJG7UY6AHyU35TZwnPo
tO4MM+haGJGAhU2kDT9hTCmiZMWI7znCcyjpy6GHERkWkuQY+BdXKAe4GXHjsw1h
PWk4Woi/PXVTlJqMofLiPfoTPhH+Jymeo+gv0a0CgYBewJWzuDg/u377MgiGSriV
bRaBawaFm4+91n2dIFzGbCDM5jix9fQm1WDbbLQ84yvdiLKYSu0tS0xl61ODMJMp
jVHFviBcwJTnGj5R9qejpNWyamBfToTrUS3gv5Mu5jqwMz6CvsWb6/AD3ijO3glS
T9XM7nc2S6oWBMEGojCADQKBgQC+NotRCTUDiD7TN5zzpDWMVX/Xueo5hKq6vstA
jvc1zhB24OhPfFSFuK68aEFhso/5o8SH7GrW3UJxi+2jeTJz7Wrid9RYTywNxDYO
2imJTTvCDx4BJa1bvVeH79BSC5A3gcgSuY6p1eKU7Adc/PrVmwMEsP2oywrWHBJM
mDZelQKBgC+hnBWsv4I9f7ycL6nIeYyiW5Hu8VUd462dybAV5f+9m2bGnmGTJ9+2
nUeNsN/nqcpr4Spnu55/8ALGLSh8xIi735tkUzaPIPqJPvwfCkCCZbrtfFchxE4X
DbO+7olx7wvYVBKqhsbtpnkHIPd4M2qyckWoYqIpuizfYMO3by8S
-----END RSA PRIVATE KEY-----`;
const iv = "Ûâh®UZ¥Ð_?R)±æHªÎ	ªËKÎo°";

let synchronizeInterval = null;
let providerError = false;

module.exports = {
  getContractAddresses: getContractAddresses,
  registerAgent: registerAgent,
  watchEvents: watchEvents,
  setMHistoryAll: setMHistoryAll,
  addHaemoglobinRecord: addHaemoglobinRecord,
  addAppointment: addAppointment,
  synchronize: synchronize,
  getSynchronizeInterval: getSynchronizeInterval,
  findAgentAndUpdateDB: findAgentAndUpdateDB,
  watchEventsForPatient
}

watchWeb3Provider();
function watchWeb3Provider() {
  web3Provider.on('end', e => {
    console.log('Blockchain not available. Reconnecting...');
    const reconnect = setInterval(() => {
      providerError = false
        web3Provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545');
        web3Provider.on('error', () => providerError = true);
        setTimeout(() => {
          if (!providerError) {
            console.log('connected to Blockchain!');
            clearInterval(reconnect); 
            watchWeb3Provider();
          }
        }, 5000);
        web3 = new Web3(web3Provider);
        platformContract = new web3.eth.Contract(platformJSON.abi, platformAddress);
    }, 10000);
  });
}


function getSynchronizeInterval() {
  return synchronizeInterval;
}


function elemIsArray(keys, values, array) {
  let is = true;
  for (let elem of array) {
    is = true;
    for (let i = 0; i < keys.length; i++) {
      is = is && elem[keys[i]] === values[i];
    }

    if (is) {
      return true;
    }
  }
  return false;
}
//findAgentAndUpdateDB('0x72b21e83e4a5a8F2De054ca07c12d6D9040d6042');
async function findAgentAndUpdateDB(address) {
  const agentNumber = await getAttribute(platformContract, 'registeredAgents', address);
  if (agentNumber > 0) {
    //console.log(agentNumber);
    const agentContractAddress = await getAttribute(platformContract, 'agents', agentNumber);
    const agentPrivateKey = await getAttribute(platformContract, 'agentPrivateKeys', address);
    const agentContract = new web3.eth.Contract(agentJSON.abi, agentContractAddress);
    const agentName = await getAttribute(agentContract, 'name');
    const agentUid = await getAttribute(agentContract, 'uid');
    const agentDid = await getAttribute(agentContract, 'did');
    const agentPassword = await getAttribute(agentContract, 'password');
    const agentType = await getAttribute(agentContract, 'aType');
    const agentPublicKey = await getAttribute(agentContract, 'publicKey');
    let agentMHAddress = null;

    if (agentType === 'pt') {
      const patientContract = new web3.eth.Contract(patientJSON.abi, agentContractAddress);
      agentMHAddress = await getAttribute(patientContract, 'mHistory');
      const medicalHistoryBC = await getMHFromBC(agentMHAddress, address);
      //console.log(medicalHistoryBC);
      const mhData = { 
        contractAddress: agentMHAddress, 
        patientAddress: address, 
        fullName: medicalHistoryBC.name,  
        homeAddress: medicalHistoryBC.homeAddress, 
        phoneNumber: medicalHistoryBC.phoneNumber, 
        mhVersion: medicalHistoryBC.version 
      };
      await insertMH(mhData);

      if (medicalHistoryBC.appointments) {
        for (let i = 0; i < medicalHistoryBC.appointments.length; i++) {
          const data = { 
            ...medicalHistoryBC.appointments[i],
            contractAddress: agentMHAddress,
            sent: 'yes'
          };
          await insertAppointmentFromDB(data);
        }
      }
      if (medicalHistoryBC.haemoglobinRecords) {
        for (let i = 0; i < medicalHistoryBC.haemoglobinRecords.length; i++) {
          const data = { 
            ...medicalHistoryBC.haemoglobinRecords[i],
            contractAddress: agentMHAddress,
            sent: 'yes'
          };
          await insertHemoglobinRecordFromDB(data);
        }
      }
    }

    const agentData = { 
      agentAddress: agentContractAddress, 
      userAddress: address, 
      userPrivateKey: agentPrivateKey, 
      agentName, 
      uid: agentUid, 
      did: agentDid, 
      agentPassword, 
      agentType, 
      publicKey: agentPublicKey, 
      mhAddress: agentMHAddress
    }; 
    //console.log(agentData); 
    await insertAgentIntoDB(agentData);    
    console.log('Agent added sucessfully to Database'); 

    }
}

async function getPatients() {
  const patients = [];
  const agentCount = await getAttribute(platformContract, 'agentsCount');
  for (let i = 1; i <= agentCount; i++) {
    let agentContractAddress = await getAttribute(platformContract, 'agents', [i]);
    let agentContract = new web3.eth.Contract(agentJSON.abi, agentContractAddress);
    let agentType = await getAttribute(agentContract, 'aType');
    if (agentType === 'pt') {
      let patientContract = new web3.eth.Contract(patientJSON.abi, agentContractAddress);
      let agentAddress = await getAttribute(patientContract, 'myAddress');
      let agentMHAddress = await getAttribute(patientContract, 'mHistory');
      patients.push({ address: agentAddress, mhAddress: agentMHAddress });
    }
  }
  return patients;
}


async function synchronize() {
  web3Provider = new Web3.providers.WebsocketProvider(rpcServer);
  web3 = new Web3(web3Provider);
  platformContract = new web3.eth.Contract(platformJSON.abi, platformAddress);
  console.log("synchronizing...")
  /*const mhAddress = '0xEE6CD71BB03704E47a2bd66B36E5572aA5CbDb0C';
  const patientAddress = '0xE80Ac6bc6Cc0b64e86E58c234642291cAc884906';*/
  /*const mhAddress = '0x2C95D5ad700918E39C90a9ad2fE0d89F9ADbcE83';
  const patientAddress = '0x0329C5F9786cC9Cb99FEC720979061d72C50267B';*/
  let patients = await getPatients();
  //console.log(patients); 
  //patients = [patients[patients.length - 1]];
  //console.log(patients);
  for (let patient of patients) {
    let mhAddress = patient.mhAddress;
    let patientAddress = patient.address;
    let appointmentsDB = await getAppointments({ contractAddress: mhAddress });
    appointmentsDB = appointmentsDB.rows;
    //console.log('appointmentsDB', appointmentsDB);
    const appointmentsBC = await getAppointmentsFromBC(mhAddress, patientAddress);
    //console.log('appointmentsBC', appointmentsBC);
    if (appointmentsBC === 'error') {
      return;
    }
    let sendToBC = [];
    for (let ap of appointmentsDB) {
      if (!(elemIsArray(['date', 'description'], [ap.apDate, ap.apDescription], appointmentsBC))) {
        await addAppointment(mhAddress, ap.apDescription, ap.apDate, ap.doctor, rootAddress, patientAddress);
        await updateAppointmentSent(mhAddress, ap.apDate);
        sendToBC.push(ap);
      }
    }
    let sendToDB = [];
    for (let ap of appointmentsBC) {
      if (!(elemIsArray(['apDate', 'apDescription'], [ap.date, ap.description], appointmentsDB))) {
        await insertAppointmentFromDB({
          contractAddress: mhAddress,
          description: ap.description,
          date: ap.date,
          doctor: ap.doctor,
          sent: 'yes'
        });
        sendToDB.push(ap);
      }
    }

    /*console.log('appointmentsDB', appointmentsDB);
    console.log('appointmentsBC', appointmentsBC)
    console.log('sendToBC', sendToBC);
    console.log('sendToDB', sendToDB);*/
    sendToBC = [];
    sendToDB = [];

    let hemoglobinRecordsDB = await getHemoglobinRecords({ contractAddress: mhAddress });
    hemoglobinRecordsDB = hemoglobinRecordsDB.rows;
    const hemoglobinRecordsBC = await getHemoglobinRecordsFromBC(mhAddress, patientAddress);
    if (hemoglobinRecordsBC === 'error') {
      return;
    }
    for (let ap of hemoglobinRecordsDB) {
      if (!(elemIsArray(['date', 'value'], [ap.rDate, ap.rValue], hemoglobinRecordsBC))) {
        await addHaemoglobinRecord(mhAddress, ap.rValue, ap.rDate, rootAddress, rootAddress, patientAddress);
        await updateHemoglobinRecordSent(mhAddress, ap.rDate);
        sendToBC.push(ap);
      } 
    }
    for (let ap of hemoglobinRecordsBC) {
      if (!(elemIsArray(['rDate', 'rValue'], [ap.date, ap.value], hemoglobinRecordsDB))) {
        await insertHemoglobinRecordFromDB({
          contractAddress: mhAddress,
          value: ap.value,
          date: ap.date,
          sent: 'yes'
        });
        sendToDB.push(ap);
      }
    }

    /*console.log('hemoglobinRecordsDB', hemoglobinRecordsDB);
    console.log('hemoglobinRecordsBC', hemoglobinRecordsBC)
    console.log('sendToBC', sendToBC);
    console.log('sendToDB', sendToDB);*/


    let medicalHistoryDB = await getMHFromDB({ contractAddress: mhAddress });
    medicalHistoryDB = medicalHistoryDB.rows;
    const medicalHistoryBC = await getMHInfo(mhAddress, patientAddress);
    console.log(medicalHistoryDB);
    const versionDB = parseFloat(medicalHistoryDB[0].mhVersion.substring(1));
    const versionBC = parseFloat(medicalHistoryBC.version.substring(1));
    if (versionDB > versionBC) {
      const { mhVersion, fullName, homeAddress, phoneNumber } = medicalHistoryDB[0];
      setMHistoryAll(mhVersion, mhAddress, fullName, homeAddress, phoneNumber, rootAddress, patientAddress);
    }
    if (versionBC > versionDB) {
      const { name, homeAddress, phoneNumber, version } = medicalHistoryBC;
      updateMHfromDB({
        contractAddress: mhAddress,
        fullName: name,
        homeAddress: homeAddress,
        phoneNumber: phoneNumber,
        mhVersion: version
      });
    }

    /*console.log(medicalHistoryDB);
    console.log(medicalHistoryBC);*/
  }
  console.log('synchronized');
  clearInterval(synchronizeInterval);
  synchronizeInterval = null;
  watchEvents();

}

//getMHInfo('0xEE6CD71BB03704E47a2bd66B36E5572aA5CbDb0C', '0xE80Ac6bc6Cc0b64e86E58c234642291cAc884906');
function getMHInfo(mhAddress, patientAddress) {
  return new Promise(async (res, rej) => {
    const mh = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
    const medicalHistory = await getAttribute(mh, 'medicalHistory');
    const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
    const key = privateKeyObject.decrypt(encryptedKey);
    if (medicalHistory === '') {
      res({
        name: '',
        homeAddress: '',
        phoneNumber: '',
        version: 'v0.0'
      });
    } else {
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      res({
        name: patientData.name,
        homeAddress: patientData.homeAddress,
        phoneNumber: patientData.phoneNumber,
        version: patientData.version
      });
    }
  });
}

function encryptMessage(message, key) {
  let key32 = key;
  while (key32.length < 32) {
    key32 += '*';
  }

  const cipher = forge.cipher.createCipher('AES-CBC', key32);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();
  const encrypted = cipher.output; //Mensaje encriptado
  // outputs encrypted hex
  return encrypted.data;
}

function decryptMessage(encryptedMessage, key) {
  let key32 = key;
  while (key32.length < 32) {
    key32 += '*';
  }

  const decipher = forge.cipher.createDecipher('AES-CBC', key32);
  decipher.start({ iv: iv });
  decipher.update(forge.util.createBuffer(encryptedMessage));
  const result = decipher.finish(); // check 'result' for true/false
  return decipher.output.data;
}

async function getRelationshipKey(patientAddress, otherAddress) {
  const relationshipCount = await getAttribute(platformContract, 'relationshipsCount');

  for (let i = 1; i <= relationshipCount; i++) {
    const relationship = await getAttribute(platformContract, 'relationships', [i]);

    if (relationship.patient === patientAddress && otherAddress === relationship.other) {
      return relationship.key;
    }
  }
  return null;
}


function getAttribute(ct, attribute, params) {
  return new Promise((res, rej) => {
    const contractAttribute = params ? ct.methods[attribute](params) : ct.methods[attribute]();
    contractAttribute.call((err, ha) => {
      if (err) {
        console.log('ERROR:' + err);
        if (!synchronizeInterval) synchronizeInterval = setInterval(synchronize, 60000);
        console.log(`PONGO synchronizeInterval ${synchronizeInterval}`);
        res('error');
        
      }
      res(ha);
    });
  });
}


function getAppointmentByID(mh, i) {
  return new Promise((res, rej) => {
    mh.methods.appointments(i).call((err, ap) => {
      res(ap);
    });
  });
}

//getMHFromBC('0xEE6CD71BB03704E47a2bd66B36E5572aA5CbDb0C', '0xE80Ac6bc6Cc0b64e86E58c234642291cAc884906').then(console.log); 
//getMHFromBC('0xd7Ce5a5498F9068c94471CDCd39D39BdB5Fad318', '0xaba1693532011bC361b50746505a26E57512Be4E').then(console.log); 
function getMHFromBC(mhAddress, ow) {
  return new Promise(async (res, rej) => {
    const mh = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
    const medicalHistory = await getAttribute(mh, 'medicalHistory');
    const encryptedKey = await getRelationshipKey(ow, rootAddress);
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
    const key = privateKeyObject.decrypt(encryptedKey);
    if (medicalHistory === '') {
      res({});
    } else {
      const hl7Message = decryptMessage(medicalHistory, key);
      //console.log(hl7Message);
      const patientData = hl7Deserialize(hl7Message);
      res(patientData);
    }
  });
}

function getHemoglobinRecordsFromBC(mhAddress, patientAddress) {
  return new Promise(async (res, rej) => {
    const mh = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
    const medicalHistory = await getAttribute(mh, 'medicalHistory');
    const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
    const key = privateKeyObject.decrypt(encryptedKey);
    if (medicalHistory === '') {
      res([]);
    } else {
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      res(patientData.haemoglobinRecords);
    }
  });
}

function getHRbyId(mh, i) {
  return new Promise((res, rej) => {
    mh.methods.haemoglobinRecords(i).call((err, hr) => {
      res({ i: i, date: hr[1], value: hr[0] });
    });
  });
}

function getAppointmentsFromBC(mhAddress, patientAddress) {
  return new Promise(async (res, rej) => {
    const mh = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
    const medicalHistory = await getAttribute(mh, 'medicalHistory');
    const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
    console.log('encryptedKey', encryptedKey);
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
    const key = privateKeyObject.decrypt(encryptedKey);
    if (medicalHistory === '') {
      res([]); 
    } else {
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      res(patientData.appointments);
    }
  });
}

function callFunction(contract, contractAddress, name, params, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            pk = userAddress === rootAddress ? rootPrivateKey : pk;
            var data = contract.methods[name](...params).encodeABI();
            var tx = new ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: contractAddress,
              value: 0,
              data: data,
            });

            tx.sign(ethereumjs.Buffer.Buffer.from(pk, 'hex'));

            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result); 
              }
            });
          })
      }).catch(err => {
        console.log("ERROR: " + err);
        if (!synchronizeInterval) synchronizeInterval = setInterval(synchronize, 60000);
      });
  });
}

function addAppointment(mhAddress, dcp, dt, dc, userAddress, patientAddress) {
  return new Promise(async (res, rej) => {
    try {
      const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
      const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
      const key = privateKeyObject.decrypt(encryptedKey);
      const patientData = await getMHFromBC(mhAddress, patientAddress);
      const appointments = patientData.appointments ? patientData.appointments : [];
      appointments.push({
        description: dcp,
        date: dt,
        doctor: dc
      });
      patientData.appointments = appointments;
      const hl7Message = hl7Serialize(patientData);
      console.log(hl7Message);
      const encryptedMessage = encryptMessage(hl7Message, key);
      console.log(encryptedMessage);
      const mhContract = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
      const result = await callFunction(mhContract, mhAddress, 'updateMedicalHistory', [encryptedMessage, 'appointmentEvent', rootAddress], userAddress);
      res(result);
    } catch (error) {
      res('error');
    }

  });
}


function addHaemoglobinRecord(mhAddress, val, dt, userAddress, patientAddress) {
  return new Promise(async (res, rej) => {
    try {
      const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
      const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
      const key = privateKeyObject.decrypt(encryptedKey);
      const patientData = await getMHFromBC(mhAddress, patientAddress);
      console.log(mhAddress, patientAddress)
      const hemoglobinRecords = patientData.haemoglobinRecords ? patientData.haemoglobinRecords : [];
      hemoglobinRecords.push({
        value: val,
        date: dt
      });
      patientData.haemoglobinRecords = hemoglobinRecords;
      const hl7Message = hl7Serialize(patientData);
      const encryptedMessage = encryptMessage(hl7Message, key);
      const mhContract = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
      const result = await callFunction(mhContract, mhAddress, 'updateMedicalHistory', [encryptedMessage, 'hemoglobinEvent', rootAddress], userAddress);
      res(result);
    } catch (error) {
      res('error');
    }

  });
}

function getPrivateKey(address) {
  return new Promise((res, rej) => {
    platformContract.methods.agentPrivateKeys(address).call(function (error, pk) {
      res(pk)
    })
  });
}

//setMHistoryAll('v0.1', '0x1d1e48B9F6E6D2b219114C4A8cE0F4feeeE658aa', 'brr1', 'brrr2', 'brrrr4', '0x8A70326Bba699C0Be5Cf95c93D5e29fEa97075BA', '');
function setMHistoryAll(vs, mhAddress, nm, ha, pn, userAddress, ow) {
  return new Promise(async (res, rej) => {
    const encryptedKey = await getRelationshipKey(ow, rootAddress);
    console.log(encryptedKey);
    const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
    const key = privateKeyObject.decrypt(encryptedKey);
    console.log(key);
    let patientData = await getMHFromBC(mhAddress, ow);
    if (patientData === '') {
      patientData = {
        id: "id1",
        version: "v0.1",
        haemoglobinRecords: [],
        appointments: []
      }
    }
    patientData.name = nm;
    patientData.version = vs;
    patientData.homeAddress = ha;
    patientData.phoneNumber = pn;
    const hl7Message = hl7Serialize(patientData);
    console.log(hl7Message);
    const encryptedMessage = encryptMessage(hl7Message, key);
    console.log(encryptedMessage);
    sentMessage = encryptedMessage;
    const mhContract = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
    const result = await callFunction(mhContract, mhAddress, 'updateMedicalHistory', [encryptedMessage, 'infoEvent', rootAddress], userAddress);
    res(result);
  });
}


async function watchEventsForPatient(mhAddress, patientAddress) {
  console.log(mhAddress, patientAddress);
  let mhContract = new web3.eth.Contract(medicalHistoryJSON.abi, mhAddress);
  mhContract.events.infoEvent({
    fromBlock: 'latest', 
    toBlock: 'latest'
  }).on('data', async (event) => {
    console.log('EVENT: infoEvent');
    const { medicalHistory, synchronizer } = event.returnValues;
    console.log('synchronizer', synchronizer);
    if (synchronizer !== rootAddress) {
      const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
      const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
      const key = privateKeyObject.decrypt(encryptedKey);
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      const data = {
        contractAddress: mhAddress,
        fullName: patientData.name,
        homeAddress: patientData.homeAddress,
        phoneNumber: patientData.phoneNumber,
        mhVersion: patientData.version
      }
      updateMHfromDB(data);
    }
  }).on('error', console.error);
  mhContract.events.hemoglobinEvent({
    fromBlock: 'latest',
    toBlock: 'latest'
  }).on('data', async (event) => {
    console.log('EVENT: hemoglobinEvent');
    const { medicalHistory, synchronizer } = event.returnValues;
    console.log('synchronizer', synchronizer);
    if (synchronizer !== rootAddress) {
      const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
      const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
      const key = privateKeyObject.decrypt(encryptedKey);
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      const lastRecord = patientData.haemoglobinRecords[patientData.haemoglobinRecords.length - 1];
      const data = {
        contractAddress: mhAddress,
        value: lastRecord.value,
        date: lastRecord.date,
        sent: 'yes'
      };
      insertHemoglobinRecordFromDB(data);
    }
  }).on('error', console.error);
  mhContract.events.appointmentEvent({
    fromBlock: 'latest',
    toBlock: 'latest'
  }).on('data', async (event) => {
    console.log('EVENT: appointmentEvent');
    const { medicalHistory, synchronizer } = event.returnValues;
    console.log('synchronizer', synchronizer);
    if (synchronizer !== rootAddress) {
      const encryptedKey = await getRelationshipKey(patientAddress, rootAddress);
      const privateKeyObject = forge.pki.privateKeyFromPem(privateKey);
      const key = privateKeyObject.decrypt(encryptedKey);
      const hl7Message = decryptMessage(medicalHistory, key);
      const patientData = hl7Deserialize(hl7Message);
      const lastRecord = patientData.appointments[patientData.appointments.length - 1];
      const data = {
        contractAddress: mhAddress,
        description: lastRecord.description,
        date: lastRecord.date,
        doctor: lastRecord.doctor,
        sent: 'yes'
      };
      insertAppointmentFromDB(data);
    }
  }).on('error', console.error);
}
async function watchEvents() {
  const patients = await getPatients();
  for (let patient of patients) {
    watchEventsForPatient(patient.mhAddress, patient.address);
  }
}

function getMHistory(ag) {
  return new Promise((res, rej) => {
    ag.methods.mHistory().call((err, mh) => {
      res(mh);
    });
  });
}

function getContractAddresses(userAddress, agentType) {
  return new Promise(async (res, rej) => {
    try {
      const index = await platformContract.methods.registeredAgents(userAddress).call();
      const agent = await platformContract.methods.agents(index).call();
      if (agentType === "pt") {
        const ag = new web3.eth.Contract(patientJSON.abi, agent);
        const mh = await getMHistory(ag);
        res({ agentAddress: agent, mhAddress: mh });   
      } else {
        res({ agentAddress: agent });
      }
    } catch (error) {
      console.log(error);
    } 
  });
}


const createAccount = (passphrase) => {
  return new Promise(async (res, rej) => {
    try {
      const account = web3.eth.accounts.create();
      const nonce = await web3.eth.getTransactionCount(rootAddress);
      console.log("rootAddress nonce: ", nonce);
      var tx = new ethereumjs.Tx({
        from: rootAddress,
        nonce: nonce,
        gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
        gasLimit: 4000000,
        to: account.address,
        value: web3.utils.toWei("0.00000000001", "ether"),
      });
      tx.sign(ethereumjs.Buffer.Buffer.from(rootPrivateKey, 'hex'));
      var raw = '0x' + tx.serialize().toString('hex');
      const hash = await web3.eth.sendSignedTransaction(raw);
      res(account);
    } catch (error) {
    }
  });
}

function registerAgent(name, uid, did, password, type, phrase, publicKey) {
  return new Promise(async (res, rej) => {
    try {
      const account = await createAccount(phrase);
      const nonce = await web3.eth.getTransactionCount(account.address);   
      const accountAddress = account.address;
      const accountPrivateKey = account.privateKey.split("0x")[1];
      //console.log("Nonce",nonce)
      var data = platformContract.methods.registerAgent(name, uid, did, password, type, phrase, accountPrivateKey, publicKey).encodeABI();
      //console.log("data", data)
      var tx = new ethereumjs.Tx({
        from: accountAddress,
        nonce: nonce,
        gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
        gasLimit: 4000000,
        to: platformAddress,
        value: 0,
        data: data,
      });

      tx.sign(ethereumjs.Buffer.Buffer.from(accountPrivateKey, 'hex'));

      var raw = '0x' + tx.serialize().toString('hex');
      //console.log("RAW",raw);
      const hash = await web3.eth.sendSignedTransaction(raw);
      res(account);

    } catch (error) {
      console.log(error);
    }
    
  });
}

function hl7Deserialize(message) {
  try {
    var hl7Object = {};
    hl7Object.segmentSeparator = '\n'; //EL ESTANDAR CORRECTO ES Un *CARRIAGE RETURN* => "\r"
    hl7Object.message = message;
    hl7Object.segments = message.split(hl7Object.segmentSeparator);

    //MSH
    hl7Object.MSH = {};
    hl7Object.MSH.value = hl7Object.segments[0];
    if (hl7Object.MSH.value.substring(0, 3) !== "MSH") {
      throw "Segment MSH Not Valid!";
    }
    hl7Object.fieldSeparator = hl7Object.MSH.value.charAt(3);
    hl7Object.MSH.fields = [];
    var mshFields = hl7Object.MSH.value.split(hl7Object.fieldSeparator);
    var encodingCharacters = mshFields[1];
    hl7Object.componentSeparator = encodingCharacters.charAt(0) === undefined ? '^' : encodingCharacters.charAt(0);
    hl7Object.repetitionSeparator = encodingCharacters.charAt(1) === undefined ? '~' : encodingCharacters.charAt(1);
    hl7Object.escapeCharacter = encodingCharacters.charAt(2) === undefined ? '\\' : encodingCharacters.charAt(2);
    hl7Object.subcomponentSeparator = encodingCharacters.charAt(3) === undefined ? '&' : encodingCharacters.charAt(3);

    for (var i = 0; i < mshFields.length; i++) {
      hl7Object.MSH.fields[i] = {};
      hl7Object.MSH.fields[i].value = mshFields[i];
    }

    hl7Object.segmentCount = 1;
    //PID
    while (hl7Object.segments[hl7Object.segmentCount] !== undefined && hl7Object.segments[hl7Object.segmentCount].substring(0, 3) !== 'PID') {
      hl7Object.segmentCount++;
    }
    if (hl7Object.segments[hl7Object.segmentCount] === undefined) {
      throw "Mensaje Inválido. No se encontró el segmento PID!";
    }

    setPID(hl7Object.segments[hl7Object.segmentCount], hl7Object);

    //PV1
    hl7Object.PV1s = [];
    while (hl7Object.segments[hl7Object.segmentCount] !== undefined &&
      hl7Object.segments[hl7Object.segmentCount].substring(0, 3) !== 'OBR') {
      if (hl7Object.segments[hl7Object.segmentCount].substring(0, 3) === 'PV1') {
        addPV1(hl7Object.segments[hl7Object.segmentCount], hl7Object);
      }
      hl7Object.segmentCount++;
    }

    //OBR
    hl7Object.OBRs = [];
    while (hl7Object.segments[hl7Object.segmentCount] !== undefined) {
      if (hl7Object.segments[hl7Object.segmentCount].substring(0, 3) === 'OBR') {
        addOBR(hl7Object.segments[hl7Object.segmentCount], hl7Object);
      }
      hl7Object.segmentCount++;
    }

    var patientData = {};
    patientData.id = hl7Object.MSH.fields[2].value; //application id
    patientData.version = hl7Object.MSH.fields[9].value; //application version
    patientData.name = hl7Object.PID.fields[5].value; //name
    patientData.homeAddress = hl7Object.PID.fields[11].value; //adress
    patientData.phoneNumber = hl7Object.PID.fields[13].value; //phoneNumber
    patientData.appointments = [];
    patientData.haemoglobinRecords = [];
    for (var i = 0; hl7Object.OBRs.length > 0 && i < hl7Object.OBRs[0].OBXs.length; i++) {
      var tempObx = hl7Object.OBRs[0].OBXs[i];
      patientData.haemoglobinRecords.push({
        value: tempObx.fields[5].value,
        date: tempObx.fields[14].value
      });
    }
    for (var i = 0; i < hl7Object.PV1s.length; i++) {
      var tempPv1 = hl7Object.PV1s[i];
      patientData.appointments.push({
        description: tempPv1.NTE.fields[3].value,
        date: tempPv1.fields[44].value,
        doctor: tempPv1.fields[7].value,
      });
    }
    return patientData;
  } catch (error) {
    console.log(error);
  }
}

function setPID(segment, hl7Object) {
  hl7Object.PID = {};
  hl7Object.PID.value = segment;
  hl7Object.PID.fields = [];
  var pidFields = hl7Object.PID.value.split(hl7Object.fieldSeparator);
  for (var i = 0; i < pidFields.length; i++) {
    hl7Object.PID.fields[i] = {};
    hl7Object.PID.fields[i].value = pidFields[i];
  }
}

function addPV1(segment, hl7Object) {
  var PV1 = {};
  hl7Object.PV1s.push(PV1);
  PV1.value = segment;
  PV1.fields = [];
  var pv1Fields = PV1.value.split(hl7Object.fieldSeparator);
  for (var i = 0; i < pv1Fields.length; i++) {
    PV1.fields[i] = {};
    PV1.fields[i].value = pv1Fields[i];
  }
  if (hl7Object.segments[hl7Object.segmentCount + 1].substring(0, 3) === 'NTE') {
    PV1.NTE = {};
    PV1.NTE.value = hl7Object.segments[hl7Object.segmentCount + 1];
    PV1.NTE.fields = [];
    hl7Object.segmentCount++;
    pv1NteFields = PV1.NTE.value.split(hl7Object.fieldSeparator);
    for (var i = 0; i < pv1NteFields.length; i++) {
      PV1.NTE.fields[i] = {};
      PV1.NTE.fields[i].value = pv1NteFields[i];
    }
  }
}

function addOBR(segment, hl7Object) {
  var OBR = {};
  hl7Object.OBRs.push(OBR);
  OBR.value = segment;
  OBR.fields = [];
  var obrFields = OBR.value.split(hl7Object.fieldSeparator);
  for (var i = 0; i < obrFields.length; i++) {
    OBR.fields[i] = {};
    OBR.fields[i].value = obrFields[i];
  }

  //OBX
  while (hl7Object.segments[hl7Object.segmentCount] !== undefined && hl7Object.segments[hl7Object.segmentCount].substring(0, 3) !== 'OBX') {
    hl7Object.segmentCount++;
  }
  if (hl7Object.segments[hl7Object.segmentCount] === undefined) {
    throw "Mensaje Inválido. No se encontró segmento OBX después de un segmento OBR!";
  }
  OBR.OBXs = [];
  addOBX(hl7Object.segments[hl7Object.segmentCount++], OBR, hl7Object);

  //Other OBXs
  while (hl7Object.segments[hl7Object.segmentCount] !== undefined) {
    if (hl7Object.segments[hl7Object.segmentCount].substring(0, 3) === 'OBX') {
      addOBX(hl7Object.segments[hl7Object.segmentCount], OBR, hl7Object);
    }
    hl7Object.segmentCount++;
  }
}

function addOBX(segment, obr, hl7Object) {
  var OBX = {};
  obr.OBXs.push(OBX);
  OBX.value = segment;
  OBX.fields = [];
  var obxFields = OBX.value.split(hl7Object.fieldSeparator);
  for (var i = 0; i < obxFields.length; i++) {
    OBX.fields[i] = {};
    OBX.fields[i].value = obxFields[i];
  }
}

function hl7Date(date) {
  var res = '';
  res = res + date.getFullYear();
  var mes = date.getMonth() + 1;
  res = res + (mes > 9 ? '' + mes : '0' + mes);
  var dia = date.getDay();
  res = res + (dia > 9 ? '' + dia : '0' + dia);

  return res;
}

function hl7Serialize(patientData) {
  //MSH
  var msh = `MSH`;
  var encodingCharacters = '^~\\&';
  var msh = msh + '|' + encodingCharacters;
  var sendingApplicationId = patientData.id;
  msh = msh + '|' + sendingApplicationId;
  var sendingFacilityId = '';
  msh = msh + '|' + sendingFacilityId;
  var receivingApplicationId = '';
  msh = msh + '|' + receivingApplicationId;
  var receivingFacilityId = '';
  msh = msh + '|' + receivingFacilityId;
  var fechaDelMensaje = hl7Date(new Date());
  msh = msh + '|' + fechaDelMensaje;
  var security = '';
  msh = msh + '|' + security;
  var messageType = "ORU^R01";
  msh = msh + '|' + messageType;
  var messageControlId = patientData.version;
  msh = msh + '|' + messageControlId;
  var processingId = patientData.version;
  msh = msh + '|' + processingId;
  var versionId = "2.2";
  msh = msh + '|' + versionId;

  //PID
  var pid = "PID";
  var seqPatientId = '';
  pid = pid + '|' + seqPatientId;
  var patientExternalId = '';
  pid = pid + '|' + patientExternalId;
  var patientinternalId = '';
  pid = pid + '|' + patientinternalId;
  var alternatePatientId = '';
  pid = pid + '|' + alternatePatientId;
  var patientName = patientData.name;
  pid = pid + '|' + patientName;
  var motherMaidenName = '';
  pid = pid + '|' + motherMaidenName;
  var birthDate = ''; //yyyymmdd
  pid = pid + '|' + birthDate;
  var sexId = ''; //F,M,O,U
  pid = pid + '|' + sexId;
  var patientAlias = '';
  pid = pid + '|' + patientAlias;
  var raceId = '';
  pid = pid + '|' + raceId;
  var patientAddress = patientData.homeAddress;
  pid = pid + '|' + patientAddress;
  var countryCode = 'CO';
  pid = pid + '|' + countryCode;
  var phoneNumberHome = patientData.phoneNumber; //[NN][(NNN)]nnn-nnnn
  pid = pid + '|' + phoneNumberHome;
  var phoneNumberBusiness = ''; //[NN][(NNN)]nnn-nnnn
  pid = pid + '|' + phoneNumberBusiness;
  var patientLaguage = 'ES'; // ST-String
  pid = pid + '|' + patientLaguage;
  var maritalStatusId = ''; //A-separated,D-divorced,M-married,S-single,W-widowed
  pid = pid + '|' + maritalStatusId;
  var religion = '';
  pid = pid + '|' + religion;
  var patientAccountNumber = '';
  pid = pid + '|' + patientAccountNumber;
  var socialSecurityNumber = '';
  pid = pid + '|' + socialSecurityNumber;
  var driverLicNumber = '';
  pid = pid + '|' + driverLicNumber;
  var motherId = '';
  pid = pid + '|' + motherId;
  var ethnicGroup = '';
  pid = pid + '|' + ethnicGroup;
  var birthPlace = '';
  pid = pid + '|' + birthPlace;
  var multipleBirthIndicator = '';
  pid = pid + '|' + multipleBirthIndicator;
  var birthOrder = '';
  pid = pid + '|' + birthOrder;
  var citizenShip = 'CO'; // ID - contry code
  pid = pid + '|' + citizenShip;

  //PV1s
  var pv1s = '';
  for (var i = 0; patientData.appointments !== undefined &&
    i < patientData.appointments.length; i++) {
    //PV1
    var pv1 = 'PV1';
    var SetIDPatientVisit = '';
    pv1 = pv1 + '|' + SetIDPatientVisit;
    var PatientClass = '';
    pv1 = pv1 + '|' + PatientClass;
    var AssignedPatientLocation = '';
    pv1 = pv1 + '|' + AssignedPatientLocation;
    var AdmissionType = '';
    pv1 = pv1 + '|' + AdmissionType;
    var PreadmitNumber = '';
    pv1 = pv1 + '|' + PreadmitNumber;
    var PriorPatientLocation = '';
    pv1 = pv1 + '|' + PriorPatientLocation;
    var AttendingDoctor = patientData.appointments[i].doctor;
    pv1 = pv1 + '|' + AttendingDoctor;
    var ReferringDoctor = '';
    pv1 = pv1 + '|' + ReferringDoctor;
    var ConsultingDoctor = '';
    pv1 = pv1 + '|' + ConsultingDoctor;
    var HospitalService = '';
    pv1 = pv1 + '|' + HospitalService;
    var TemporaryLocation = '';
    pv1 = pv1 + '|' + TemporaryLocation;
    var PreadmitTestIndicator = '';
    pv1 = pv1 + '|' + PreadmitTestIndicator;
    var ReadmissionIndicator = '';
    pv1 = pv1 + '|' + ReadmissionIndicator;
    var AdmitSource = '';
    pv1 = pv1 + '|' + AdmitSource;
    var AmbulatoryStatus = '';
    pv1 = pv1 + '|' + AmbulatoryStatus;
    var VIPIndicator = '';
    pv1 = pv1 + '|' + VIPIndicator;
    var AdmittingDoctor = '';
    pv1 = pv1 + '|' + AdmittingDoctor;
    var PatientType = '';
    pv1 = pv1 + '|' + PatientType;
    var VisitNumber = '';
    pv1 = pv1 + '|' + VisitNumber;
    var FinancialClass = '';
    pv1 = pv1 + '|' + FinancialClass;
    var ChargePriceIndicator = '';
    pv1 = pv1 + '|' + ChargePriceIndicator;
    var CourtesyCode = '';
    pv1 = pv1 + '|' + CourtesyCode;
    var CreditRating = '';
    pv1 = pv1 + '|' + CreditRating;
    var ContractCode = '';
    pv1 = pv1 + '|' + ContractCode;
    var ContractEffectiveDate = '';
    pv1 = pv1 + '|' + ContractEffectiveDate;
    var ContractAmount = '';
    pv1 = pv1 + '|' + ContractAmount;
    var ContractPeriod = '';
    pv1 = pv1 + '|' + ContractPeriod;
    var InterestCode = '';
    pv1 = pv1 + '|' + InterestCode;
    var TransferToBadDebtCode = '';
    pv1 = pv1 + '|' + TransferToBadDebtCode;
    var TransferToBadDebtDate = '';
    pv1 = pv1 + '|' + TransferToBadDebtDate;
    var BadDebtAgencyCode = '';
    pv1 = pv1 + '|' + BadDebtAgencyCode;
    var BadDebtTransferAmount = '';
    pv1 = pv1 + '|' + BadDebtTransferAmount;
    var BadDebtRecoveryAmount = '';
    pv1 = pv1 + '|' + BadDebtRecoveryAmount;
    var DeleteAccountIndicator = '';
    pv1 = pv1 + '|' + DeleteAccountIndicator;
    var DeleteAccountDate = '';
    pv1 = pv1 + '|' + DeleteAccountDate;
    var DischargeDisposition = '';
    pv1 = pv1 + '|' + DischargeDisposition;
    var DischargedToLocation = '';
    pv1 = pv1 + '|' + DischargedToLocation;
    var DietType = '';
    pv1 = pv1 + '|' + DietType;
    var ServicingFacility = '';
    pv1 = pv1 + '|' + ServicingFacility;
    var BedStatus = '';
    pv1 = pv1 + '|' + BedStatus;
    var AccountStatus = '';
    pv1 = pv1 + '|' + AccountStatus;
    var PendingLocation = '';
    pv1 = pv1 + '|' + PendingLocation;
    var PriorTemporaryLocation = '';
    pv1 = pv1 + '|' + PriorTemporaryLocation;
    var AdmitDateTime = patientData.appointments[i].date;
    pv1 = pv1 + '|' + AdmitDateTime;
    var DischargeDateTime = '';
    pv1 = pv1 + '|' + DischargeDateTime;
    var CurrentPatientBalance = '';
    pv1 = pv1 + '|' + CurrentPatientBalance;
    var TotalCharges = '';
    pv1 = pv1 + '|' + TotalCharges;
    var TotalAdjustments = '';
    pv1 = pv1 + '|' + TotalAdjustments;
    var TotalPayments = '';
    pv1 = pv1 + '|' + TotalPayments;
    var AlternateVisitID = '';
    pv1 = pv1 + '|' + AlternateVisitID;

    //NTE
    var nte = 'NTE';
    var SetIDNotesAndComments = '';
    nte = nte + '|' + SetIDNotesAndComments;
    var SourceOfComment = '';
    nte = nte + '|' + SourceOfComment;
    var Comment = patientData.appointments[i].description;
    nte = nte + '|' + Comment;

    pv1s = pv1s + '\n' + pv1 + '\n' + nte;
  }

  //OBR
  var obr = '';
  if (patientData.haemoglobinRecords && patientData.haemoglobinRecords.length > 0) {
    obr = 'OBR';
    var setId = ''; //Sequence Number
    obr = obr + '|' + setId;
    var placerOrderNumber = '';
    obr = obr + '|' + placerOrderNumber;
    var fillerOrderNumber = ''; //UniqueFillerID^FillerApplicationID
    obr = obr + '|' + fillerOrderNumber;
    var universalServiceId = '30351-1^Hemoglobin [mass/volume] in mixed venous blood^LOINC'; //OBLIgatorio
    obr = obr + '|' + universalServiceId;
    var priorityId = '';
    obr = obr + '|' + priorityId;
    var requestedDateTime = '';
    obr = obr + '|' + requestedDateTime;
    var observationDateTime = ''; //yyyymmdd
    obr = obr + '|' + observationDateTime;
    var observationEndDateTime = ''; //yyyymmdd
    obr = obr + '|' + observationEndDateTime;
    var collectionVolume = ''; //CQ - quantity^units
    obr = obr + '|' + collectionVolume;
    var collectorIdentifier = '';
    obr = obr + '|' + collectorIdentifier;
    var specimenActionCode = '';
    obr = obr + '|' + specimenActionCode;
    var dangerCode = '';
    obr = obr + '|' + dangerCode;
    var relevantClinicalInformation = '';
    obr = obr + '|' + relevantClinicalInformation;
    var specimenReceivedDateTime = '';
    obr = obr + '|' + specimenReceivedDateTime;
    var specimenSource = 'PLAS&Plasma^Muestra de sangre^Muestra de sangre del brazo derecho^RA&Right Arm^MED&Medial';
    obr = obr + '|' + specimenSource;
  }


  //OBXs
  var obxs = '';
  for (var i = 0; patientData.haemoglobinRecords && i < patientData.haemoglobinRecords.length; i++) {
    //OBX
    var obx = 'OBX';
    var setIdObservationalSimple = ''; //Seq Id
    obx = obx + '|' + setIdObservationalSimple;
    var valueType = 'CQ'; //CQ - quantity and units
    obx = obx + '|' + valueType;
    var observationIdentifier = ''; //CE - <identifier>^<text>^<name of coding system>
    obx = obx + '|' + observationIdentifier;
    var observationSubId = ''; //ST - distinguish between different OBXs
    obx = obx + '|' + observationSubId;
    var observationValue = patientData.haemoglobinRecords[i].value; //OBX-2->ValueType //CQ 
    obx = obx + '|' + observationValue;
    var units = '';
    obx = obx + '|' + units;
    var referencesRange = ''; // ST // Ej: 13.8 - 17.2 (g/dL) Men
    obx = obx + '|' + referencesRange;
    var abnormalFlags = 'N'; // ID //Ej: N-Normal
    obx = obx + '|' + abnormalFlags;
    var probability = '';
    obx = obx + '|' + probability;
    var natureOfAbnormalTest = 'N'; // Ej: N - None _ generic normal range
    obx = obx + '|' + natureOfAbnormalTest;
    var observResultStatus = 'F'; // Ej: F-Final Results
    obx = obx + '|' + observResultStatus;
    var dateLastObsNormalValues = '';
    obx = obx + '|' + dateLastObsNormalValues;
    var userDefinedAccessChecks = '';
    obx = obx + '|' + userDefinedAccessChecks;
    var dateTimeOfTheObservation = patientData.haemoglobinRecords[i].date; // yyyymmdd
    obx = obx + '|' + dateTimeOfTheObservation;
    var producerId = '';
    obx = obx + '|' + producerId;
    var responsibleObserver = '';
    obx = obx + '|' + responsibleObserver;

    obxs = obxs + '\n' + obx;
  }

  //pv1s' and obxs'  first character is an "\n"
  var mensaje = msh + '\n' + pid + pv1s + '\n' + obr + obxs;
  return mensaje;
}  


