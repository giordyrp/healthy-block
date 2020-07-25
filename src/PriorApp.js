import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import Platform from '../../build/contracts/Platform.json'
import Content from './Content'
import Signup from './Signup'
import 'semantic-ui-css/semantic.min.css'
import 'react-vis/dist/style.css'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import platformJSON from '../../build/contracts/Platform.json'

//import { Loader } from 'semantic-ui-react'
import CircularProgress from '@material-ui/core/CircularProgress';  


import * as ethereumjs from './ethereumjs-tx-1.3.3.min.js';


const theme = createMuiTheme({
  palette: {
     primary: {
        light: '#4dabf5',
        main: '#2196f3',
        dark: '#1769aa'
     },
     secondary: {
       main: '#f44336',
     },
  },
  typography: { 
     useNextVariants: true
  }
});


class App extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      registered: false,
      loading: true,
      registering: false,
      name : ""
    }

    
  }

  componentDidMount() {
    if (typeof web3 != 'undefined') {
      this.web3Provider = web3.currentProvider
      console.log('NO UNDF')
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7546')
      console.log('YES UNDF')
     
    }

    console.log(this.web3Provider)

    this.web3 = new Web3(this.web3Provider)

    console.log(this.web3)
    this.platform = TruffleContract(Platform)
    this.platform.setProvider(this.web3Provider)

    const contract = new this.web3.eth.Contract(platformJSON.abi,"0x986c12c5B21378F4a4dd398d323A2DBDd411dd0E");
    console.log("Contract",contract)


    /*this.web3.eth.getAccounts(function (error, result) {
      console.log(result)
    });*/
    //this.web3.eth.personal.newAccount('!@superpassword').then(console.log)

    
    
    /*this.web3.eth.getCoinbase((err, account) => {
      this.setState({ account })
      console.log(account, this.web3.currentProvider)

      /*this.web3.currentProvider.publicConfigStore.on('update', function() {
        if (this.web3.eth.accounts[0] !== account) {
          account = this.web3.eth.accounts[0];
          window.location.reload(false);
        }
      });*/
      //0x07EE0EDefaB18b779fFD64E33883Ea0113f2fb56 Ganache
      //0x986c12c5B21378F4a4dd398d323A2DBDd411dd0E ganache 2 cleaned
     /*this.platform.at('0x96Bf5f8d5184310d13fD6e5C9B4c5e3dF2c8416d').then((platformInstance) => {
        console.log("ENTRO CONTRACT")
        this.platformInstance = platformInstance 
        this.watchEvents()
        return this.platformInstance.getAgentIndex({from:this.state.account})})
        .then((index) => {
          console.log(index)
        var rgd = index == 0 ? false : true;
        console.log(rgd)
        this.setState({ registered:rgd, loading: false })   
        })
      })*/
    
      /*contract.methods.agents(2).call({from:"0x77eD9C3A616EF4ffAf5813B29A224a3270c5B644"},function(error, result) {
        console.log("ci", result, error)
      })*/

      contract.methods.getAgentIndex().call({from:"0x77eD9C3A616EF4ffAf5813B29A224a3270c5B644"},(error, result) =>
       {
        console.log("INDEX", result)
        var rgd = result == 0 ? false : true;
        console.log(rgd)
        this.setState({ registered:rgd, loading: false })   
      })

      
      
      var address = "0x986c12c5B21378F4a4dd398d323A2DBDd411dd0E";
                    
      var account = "0x77eD9C3A616EF4ffAf5813B29A224a3270c5B644";
      var privateKey = "1ff4fb515d7a115b74d6a44c10f711d21659039352bc305042c01a084d723dff";
      
      this.web3.eth.getBalance(account, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          console.log(this.web3.utils.fromWei(result, "ether") + " ETH")
        }
      })
      
      /*this.web3.eth.getTransactionCount(account)
        .then(nonce => {
          console.log("Nonce",nonce)
          var data = contract.methods.registerAgent("aro", "aro", "123456788", "pt").encodeABI();
          console.log("data", data)
          var tx = new ethereumjs.Tx({
            nonce: nonce,
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('10', 'gwei')),
            gasLimit: 4000000,
            to: address,
            value: 0,
            data: data,
          });
          tx.sign(ethereumjs.Buffer.Buffer.from(privateKey, 'hex'));
      
          var raw = '0x' + tx.serialize().toString('hex');
          console.log("RAW",raw);
          this.web3.eth.sendSignedTransaction(raw, function (err, transactionHash) {
            if (err) {
              console.log(err)
            } else {
            console.log("Txhash",transactionHash);}
          });
        });*/
      
      //0xf62ea521c9cf9b201a76547af53df98abade036eac7ba44d761b66ab7fc42141
        
      this.web3.eth.getTransaction("0xbd485abbe98a757aeeec0420b9228d5a9f3b2b160432be8b0a488b8e1fdbce86", function(error, result) {
        console.log(result)
      });
      

      /*let pt = this.web3.eth.contract(platformJSON.abi).at("0x07EE0EDefaB18b779fFD64E33883Ea0113f2fb56");
      console.log(pt)*/

      /*pt.registerAgent("aro", "aro", "123456788", "pt", { from:  "0x6a93CA19019b1bDF3B736C97699841a29b2b4360"})
        .then(console.log)
        .catch(console.log);*/
    

      //pt.methods.getAgentIndex(1).call({from: '0x6a93CA19019b1bDF3B736C97699841a29b2b4360'}).then(console.log);

      //console.log("BN",this.web3.eth.blockNumber)
      
    

      //this.sendEther();


  }

  sendEther() {
    debugger;
    //this.web3.eth.defaultAccount = this.web3.eth.accounts[0]
    const acc1 = "0x9b031fe8ec03e3D1Df4D7be23Ec8A710D4d964b9";
    const acc2 = "0xc54314B0b2a0BC3EC59E37E77Bb65FaB2a549889";
    const pk = "660dfbd4fea685121101b17161e25617501160502b86cbff51386cf4a374b7f8";

    this.web3.eth.getTransactionCount(acc1).then(nonce => {
      const tx = {
        'nonce': nonce,
        'to': acc2,
        'value': this.web3.utils.toWei('5','ether'),
        'gas': 2000000,
        'gasPrice': this.web3.utils.toWei('50','gwei')
      }
  
    this.web3.eth.accounts.signTransaction(tx,pk).then(console.log).catch(console.log);
    //console.log(signedTx)
    /*const txHash = this.web3.eth.sendTransaction(tx.raw);
    console.log(txHash);*/
      console.log(tx,this.web3.eth.accounts);
    });

    

    

  }




  watchEvents() {
    this.platformInstance.registerEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      if(event.args.agentAddress==this.state.account){
        this.setState({ registered: true })
      }
      
    })
  }

  render() {
    return (
      <div >
        <div >       
          { this.state.loading ?
            <CircularProgress/>
            : 
            !this.state.registered? 
            <Signup account={this.state.account} web3={this.web3} platformInstance={this.platformInstance} ></Signup>
            :
            <div style={{minHeight: '100vh'}}><Content registered={this.state.registered} account={this.state.account} web3={this.web3} platformInstance={this.platformInstance}/></div>               
          }
        </div>
      </div> 
    )
  }
}

ReactDOM.render(
  <MuiThemeProvider theme = { theme }><App/></MuiThemeProvider>, 
   document.querySelector('#root')
)
