import Web3 from 'web3';
import * as firebase from 'firebase';
//import * as ethereumjs from '../js/ethereumjs-tx-1.3.3.min.js';
import platformJSON from '../ABIs/Platform.json';
import agentJSON from '../ABIs/Agent.json';
import patientJSON from '../ABIs/Patient.json';
import medicalHistoryJSON from '../ABIs/MedicalHistory.json';
import axios from 'axios';

import { config } from '../firebase/config';



let web3Provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:7545');
let web3 = new Web3(web3Provider);
const platformAddress = "0x1e4f6027D6fF2A1d56aF2deb75f61154593df9F0";
export let platformContract = new web3.eth.Contract(platformJSON.abi, platformAddress);
let providerError = false;

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
            console.log('connected!');
            clearInterval(reconnect); 
            watchWeb3Provider();
          }
        }, 5000);
        web3 = new Web3(web3Provider);
        platformContract = new web3.eth.Contract(platformJSON.abi, platformAddress);
    }, 10000);
  });
}

export function setBoth(id, id2, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.setBoth(id, id2).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function setOther(id, value, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.setOther(id, value).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function setOne(id, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.setOne(id).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function getFamilyDoctorRelationship(pt) {
  return new Promise((res, rej) => {
    platformContract.methods.relationshipsCount().call(function (err,rCount){
      if (rCount == 0) {
        res(null);
      }
      var id = 0;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(i).then((relationship) => {
          id++;
          if (pt == relationship.patient && relationship.type == "fd") {
            res(relationship)
          }
          if (id == rCount) {
            res(null)
          }
        })
      }
    })
  });
}

export function getPatientsDoctors() {
  return new Promise((res, rej) => {

    platformContract.methods.agentsCount().call(async (err,aCount) => {

      var pList = [];
      var dList = [];
      var id = 1;
      var pCont = 1;
      var dCont = 1;
      for (var i = 1; i <= aCount; i++) {
        var agent = await platformContract.methods.agents(i).call();
        let ag = new web3.eth.Contract(agentJSON.abi, agent);
        var address = await getAddress(ag);
        var name = await getName(ag);
        var uid = await getUid(ag);
        var did = await getDid(ag);
        var aType = await getAType(ag);
        var rs = await getFamilyDoctorRelationship(address);
        var agentArray = {
          id: aType == "pt" ? pCont : dCont,
          address: address,
          name: name,
          uid: uid,
          did: did,
          aType: aType,
          fdAddress: rs == null ? null : rs.other
        };
        if (aType == "pt") {
          pList = [...pList, agentArray];
          pCont++;
        } else if (aType == "dc") {
          dList = [...dList, agentArray];
          dCont++;
        }
        if (id == aCount) {
          var fn = { patients: pList, doctors: dList }
          res(fn);
        }
        id++;
      }
    });
  });
}

export function getRelationshipByAddresses(pt, ot, type) {
  return new Promise((res, rej) => {
    platformContract.methods.relationshipsCount().call(function (err,rCount){
      if (rCount == 0) {
        res(null);
      }
      var id = 0;
      var typeBool = true;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(i).then((relationship) => {
          id++;
          typeBool = type ? (type === 'nm' ? relationship.type == "nm" : true) : true;
          if (pt == relationship.patient && ot == relationship.other && typeBool) {
            res(relationship)
          }
          if (id == rCount) {
            res(null)
          }

        })

      }
    })
  });
}

export function addAppointment(mhAddress, dcp, dt, dc, userAddress, ow) {
  return new Promise((res, rej) => {
    axios.post('http://localhost:5000/insert_appointment', {
      contractAddress: mhAddress, 
      patientAddress: ow,
      userAddress: userAddress, 
      description: dcp, 
      date: dt,
      doctor: dc
    }).then(response => res(response.data));
  });
}

export function addHaemoglobinRecord(mhAddress, val, dt, userAddress, ow) {
  return new Promise((res, rej) => {
    axios.post('http://localhost:5000/insert_hemoglobin_record', {
      contractAddress: mhAddress, 
      patientAddress: ow,
      userAddress: userAddress, 
      value: val, 
      date: dt
    }).then(response => res(response.data));
  });
}

function getMHVersion(mhAddress) {
  return new Promise((res, rej) => {
    axios.post('http://localhost:5000/get_mh', {
      contractAddress: mhAddress
    }).then(response => res(response.data.rows[0].mhVersion));
  });
}

export function SetMHistoryAll(mhAddress, nm, ha, pn, userAddress, ow) {
  return new Promise(async (res, rej) => {
    let mhVersion = await getMHVersion(mhAddress);
    mhVersion =  'v' + (parseFloat(mhVersion.substring(1)) + 0.1).toFixed(1);
    axios.post('http://localhost:5000/update_mh', {
      contractAddress: mhAddress, 
      patientAddress: ow, 
      userAddress: userAddress, 
      fullName: nm, 
      homeAddress: ha, 
      phoneNumber: pn, 
      mhVersion: mhVersion
    }).then(response => res(response.data));
  });
}

function getHRbyId(mh, i) {
  return new Promise((res, rej) => {
    mh.methods.haemoglobinRecords(i).call((err, hr) => {
      res({ i: i, x: hr[1], y: parseFloat(hr[0]) });
    });
  });
}

function getHaemoglobinRecords(mh) {
  return new Promise((res, rej) => {
    var haemoglobinRecords = [];
    var ri = 1;
    mh.methods.haemoglobinRecordCount().call((err, hrc) => {
      if (hrc == 0) {
        res(haemoglobinRecords);
      }
      for (var i = 1; i <= hrc; i++) {
        getHRbyId(mh, i).then((ar) => {
          haemoglobinRecords = [...haemoglobinRecords, ar]
          if (haemoglobinRecords.length == hrc) {
            haemoglobinRecords = haemoglobinRecords.sort((a, b) => a.i - b.i)
            res(haemoglobinRecords)
          }
        });
      }
    });
  });
}

export function getDataByPrivacy(privacy, data) {
  return new Promise((res, rej) => {
    if (!data || data.length == 0) { res([]) }
    data.sort((a,b) => new Date(a.rDate) - new Date(b.rDate));
    data = data.map(elem => {return {x: new Date(elem.rDate).toLocaleDateString(), y:  parseFloat(elem.rValue)}});
    switch (privacy) {
      case "fal": {
        var aData = [];
        var i = 0;
        data.forEach(element => {
          var rn = Math.random();
          if (rn > 0.5) {
            aData.push({ x: element.x, y: element.y + 3 * rn })
          } else {
            aData.push({ x: element.x, y: element.y - 3 * rn })
          }
          i++;
          if (i == data.length) {
            res(aData)
          }
        });
        break;
      }
      case "rg": {
        var i = 0;
        var aData = [];
        data.forEach(element => {
          if (element.y > 18) {
            aData.push({ x: element.x, y: "High" })
          } else if (element.y > 12) {
            aData.push({ x: element.x, y: "Normal" })
          } else {
            aData.push({ x: element.x, y: "Low" })
          }
          i++;
          if (i == data.length) {
            res(aData)
          }
        });
        break;
      }
      case "pl": {
        var aData = [];
        for (var i = data.length - 4; i < data.length; i++) {
          aData.push({ x: data[i].x, y: data[i].y })
          if (aData.length == 4) {
            res(aData)
          }
        }

        break;
      }
      case "tr": {

        var i = 0;
        var aData = [];
        var avg = 0;
        var sd = 0;
        data.forEach(element => {
          avg += element.y;
          i++;
          if (i == data.length) {
            avg = avg / data.length;
            var sum = 0;
            var i2 = 0;
            data.forEach(element2 => {
              i2++;
              sum += Math.pow(element2.y - avg, 2);
              if (i2 == data.length) {
                sd = Math.sqrt(sum / (data.length - 1));
                res([{ x: "AVG-σ", y: avg - sd }, { x: "AVG", y: avg }, { x: "AVG+σ", y: avg + sd }])
              }
            })
          }
        });
        break;
      }
      default: {
        res(data)
        break;
      }
    }
  });
}

export function getMHInfo(mhAddress, privacy) {
  return new Promise((res, rej) => {
    axios.post('http://localhost:5000/get_mh', {
      contractAddress: mhAddress
    }).then(async response => {
      const data = response.data.rows[0];
      const dataByPrivacy = await getDataByPrivacy(privacy, data.hemoglobinRecords); 
      data.hemoglobinRecords = dataByPrivacy ;
      res(data);
    });
  });
}
export function setActive(id, value, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.setActive(id, value).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function setAccess(id, value, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.setAccess(id, value).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function getPrivateKey(address) {
  return new Promise((res, rej) => {
    platformContract.methods.agentPrivateKeys(address).call(function(error, pk) {
      res(pk)
    })
  });
}

export function callFunction(name, params, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods[name](...params).encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}


export function addRelationship(patientAddress, otherAddress, access, type, active, userAddress) {
  return new Promise((res, rej) => {
    web3.eth.getTransactionCount(userAddress)
      .then(nonce => {
        getPrivateKey(userAddress)
          .then(pk => {
            var data = platformContract.methods.addRelationship(patientAddress, otherAddress, access, type, active, '').encodeABI();
            var tx = new window.ethereumjs.Tx({
              from: userAddress,
              nonce: nonce,
              gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
              gasLimit: 4000000,
              to: platformAddress,
              value: 0,
              data: data,
            });

            tx.sign(window.ethereumjs.Buffer.Buffer.from(pk, 'hex'));
        
            var raw = '0x' + tx.serialize().toString('hex');
            web3.eth.sendSignedTransaction(raw, function (error, result) {
              if (error) {
                rej(error);
              } else {
                res(result);
              }
            });
          }) 
        
      });
  });
}

export function getPatients() {
  return new Promise((res, rej) => {
    platformContract.methods.agentsCount().call(function(error,aCount){
      var list = [];
      if (aCount == 0) { res(list) }
      for (var i = 1; i <= aCount; i++) {
        getAgentById(i).then((agent) => {
          list = [...list, agent]
          if (list.length == aCount) {
            list = list.sort((a, b) => a.i - b.i)
            var filtered = list.filter(function (item) {
              return item.aType == "pt";
            });
            res(filtered)
          }
        })
      }
    })
  });
}

function getAddress(ag) {
  return new Promise((res, rej) => {
    ag.methods.myAddress().call((err, add) => {
      res(add);

    });
  });
}

function getName(ag) {
  return new Promise((res, rej) => {
    ag.methods.name().call((err, nm) => {
      res(nm);
    });
  });
}

function getUid(ag) {
  return new Promise((res, rej) => {
    ag.methods.uid().call((err, ui) => {
      res(ui);
    });
  });
}

function getDid(ag) {
  return new Promise((res, rej) => {
    ag.methods.did().call((err, di) => {
      res(di);
    });
  });
}

function getAType(ag) {
  return new Promise((res, rej) => {
    ag.methods.aType().call((err, tp) => {
      res(tp);
    });
  });
}

function getMHistory(ag) {
  return new Promise((res, rej) => {
    ag.methods.mHistory().call((err, mh) => {
      res(mh);
    });
  });
}

function getHomeAddress(mh) {
  return new Promise((res, rej) => {
    mh.methods.homeAddress().call((err, ha) => {
      res(ha);
    });
  });
}
function getPhoneNumber(mh) {
  return new Promise((res, rej) => {
    mh.methods.phoneNumber().call((err, pn) => {
      res(pn);
    });
  });
}

function getAgentById(i) {
  return new Promise((res, rej) => {
    platformContract.methods.agents(i).call(function(error, agent){
      let ag = new web3.eth.Contract(agentJSON.abi, agent);
      getAddress(ag).then((address) => {
        getName(ag).then((name) => {
          getUid(ag).then((uid) => {
            getDid(ag).then((did) => {
              getAType(ag).then((aType) => {
                if(aType=="pt"){
                  ag = new web3.eth.Contract(patientJSON.abi, agent);
                  getMHistory(ag).then((mh) => {
                    var agentArray = {
                      address: address,
                      name: name,
                      uid: uid,
                      did: did,
                      aType: aType,
                      mHistory: mh
                    };
                      res(agentArray)

                  });
                }else{
                  var agentArray = {
                    address: address,
                    name: name,
                    uid: uid,
                    did: did,
                    aType: aType
                  };

                    res(agentArray)
                }  
              });
            });
          });
        });
      });
    });
  })
}

function getAttribute(ct, attribute, params) {
  return new Promise((res, rej) => {
    const contractAttribute = params ? ct.methods[attribute](params) : ct.methods[attribute]();
    contractAttribute.call((err, ha) => {
      if (err) {
        console.log('ERROR FROM BC:' + err);
        res('error')
      }
      res(ha);
    });
  });
}


export function getAgentByAddress(userAddress) {
  return new Promise((res, rej) => {

    axios.post('http://localhost:5000/get_agent', {
      userAddress: userAddress
    }).then(response => {
      var agentArray = {
        address: response.data.rows[0].userAddress,
        name: response.data.rows[0].agentName,
        uid: response.data.rows[0].uid,
        did: response.data.rows[0].did,
        aType: response.data.rows[0].agentType,
        mHistory: response.data.rows[0].mhAddress,
        publicKey: response.data.rows[0].publicKey
      };
      res(agentArray);
  });
});

}

export const getRelationships = (tp, accountAdd) => {
  return new Promise((res,rej) => {
    platformContract.methods.relationshipsCount().call(async function(err, rCount){
      var list = [];
      if (rCount == 0) res([])
      var id = 0;
      for (var i = 1; i <= rCount; i++) {
        getRelationshipById(i).then((rs) => {
          id++;
          var add = tp === "pt" ? rs.patient : rs.other;
          if (add == accountAdd) {
            list = [...list, rs]
          }
          if (id == rCount) {
            list = list.sort((a, b) => a.id - b.id)
            res(list)
          }
        })
      }
    })
  });
}

export const getRelationshipById = (i) => {
  return new Promise((res, rej) => {
    platformContract.methods.relationships(i).call(function(error,relationship){
      res({
        id: i,
        patient: relationship[0],
        other: relationship[1],
        access: relationship[2],
        type: relationship[3],
        active: relationship[4],
        key: relationship[5]
      })
    });
  })
}


export const getAgentIndex = (address) => {
  return new Promise((res,rej) => {
    platformContract.methods.getAgentIndex().call({from: address},function(error, result){
        if (error) {
          rej(error);
        } else {
          res(result);
        }
      }
    )
  }); 
}

export const getAgentByPhrase = (phrase, address) => {
  return new Promise((res,rej) => {
    platformContract.methods.getAgentByPhrase(phrase).call({from: address},function(error, result) {
      if (error) {
        rej(error);
      } else {
        res(result);
      }
    })
  });
}

export const getTransactionCount = (address) => {
  return new Promise((res,rej) => {
    web3.eth.getTransactionCount(address, function(error, result) {
      if (error) {
        rej(error);
      } else {
        res(result);
      }
    })
  });
}

export const getEther = (account) => {
  return new Promise((res,rej) => {
    web3.eth.getBalance(account, (err, result) => {
      if (err) {
        rej(err)
      } else {
        res(web3.utils.fromWei(result, "ether") + " ETH")
      }
    })
  });
}

export const registerAgent = (name, uid, did, password, type, phrase, publicKey) => {
  return new Promise((res,rej) => {
    axios.post('http://localhost:5000/insert_agent', {
      agentName: name, 
      uid: uid, 
      did: did, 
      agentPassword: password, 
      agentType: type, 
      passPhrase: phrase,
      publicKey: publicKey
    }).then(response => {
      res(response.data.address)
    });

  });
}


