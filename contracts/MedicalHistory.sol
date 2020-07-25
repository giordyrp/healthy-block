pragma solidity ^0.5.0;

contract MedicalHistory {

    struct Haemoglobin {
        string value;
        string date;
    }

    string public name;
    string public homeAddress;
    string public phoneNumber;
    mapping (uint => Haemoglobin) public haemoglobinRecords;
    uint public haemoglobinRecordsCount;

    event allEvent (
        address ow, address ot
    );

     event haemoglobinEvent (
        address ow, address ot
    );



    constructor(string memory nm, string memory ha, string memory pn) public{
        name = nm;
        homeAddress =  ha;
        phoneNumber = pn;
    }

    function addHaemoglobinRecord(string memory val,string memory dt,address ow, address ot) public {
        haemoglobinRecordsCount++;
        haemoglobinRecords[haemoglobinRecordsCount] = Haemoglobin(val,dt);
        emit haemoglobinEvent(ow,ot);
    }



    function setAll(string memory nm,string memory ha, string memory pn, address ow, address ot) public {
        name = nm;
        homeAddress = ha;
        phoneNumber = pn;
        emit allEvent(ow,ot);
    }


}