pragma solidity ^0.5.0;
import './MedicalHistory.sol';
import './Agent.sol';

contract Patient is Agent{

    MedicalHistory public mHistory;

    constructor(address ma, string memory nm,string memory ui, string memory di,string memory tp) Agent(ma,nm,ui,di,tp) public{
        mHistory = new MedicalHistory({nm:'',ha:'',pn:''});
        myAddress = ma;
        name = nm;
        uid = ui;
        did = di;
        aType = tp;
    }

}