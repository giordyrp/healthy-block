pragma solidity ^0.5.0;

import './Agent.sol';
import './Patient.sol';

contract Platform {



    struct Relationship {
        address patient;
        address other;
        string access;
        string rType;
        bool active;
    }

    mapping (uint => Agent)  public agents;
    mapping (address => uint) public registeredAgents;
    mapping (uint => Relationship) public relationships;

    uint public agentsCount;
    uint public relationshipsCount;

    constructor () public {
    }

    event registerEvent (
        address agentAddress
    );

    event accessEvent (
        uint i,
        string access
    );

    event relationshipEvent (
        address ow,
        address ot
    );

    event activeEvent (
        uint i,
        bool active
    );

    event otherEvent (
        address ow,
        address ot1,
        address ot2
    );

    event bothEvent (
        address ow1,
        address ot1,
        address ow2,
        address ot2
    );

    event oneEvent (
        address ow,
        address ot
    );


    function compareStrings (string memory a, string memory b) public view 
       returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );

    }

    function registerAgent (string memory name,string memory uid, string memory did, string memory tipo) public {
        agentsCount++;
        if(compareStrings(tipo,"pt")){
        agents[agentsCount] = new Patient({ma:msg.sender,nm:name, ui:uid,di:did, tp:tipo});
        }else{
        agents[agentsCount] = new Agent({ma:msg.sender,nm:name, ui:uid,di:did, tp:tipo});}
        registeredAgents[msg.sender] = agentsCount;      
        emit registerEvent(msg.sender);
    }

    function getAgentIndex () public view returns (uint){
        return registeredAgents[msg.sender];
    }

    function addRelationship (address ow, address ot,string memory acc,string memory tp,bool act) public {
        relationshipsCount++;
        relationships[relationshipsCount] = Relationship (ow,ot,acc,tp,act);
        emit relationshipEvent(ow,ot);
    }

    function deleteRelationship (uint i) public {
       delete relationships[i];
    }

    function setAccess (uint i,string memory ac) public {
        relationships[i].access = ac;
        emit accessEvent(i,ac);
    }

    function setActive (uint i,bool ac) public {
        relationships[i].active = ac;
        emit activeEvent(i,ac);
    }

    function setOther (uint i,address ad) public {
        relationships[i].other = ad; 
        emit otherEvent(relationships[i].patient,ad,relationships[i].other);
    }

    function setBoth(uint i,uint i2) public{
        relationships[i].access = "fal";
        relationships[i].rType = "nm";
        relationships[i].active = true;
        relationships[i2].access = "fa";
        relationships[i2].rType = "fd";
        relationships[i2].active = true;
        emit bothEvent(relationships[i].patient,relationships[i].other,relationships[i2].patient,relationships[i2].other);
    }

    function setOne(uint i) public{
        relationships[i].access = "fa";
        relationships[i].rType = "fd";
        relationships[i].active = true;
        emit oneEvent(relationships[i].patient,relationships[i].other);

    }

}
