import React, { Component } from 'react';

import {
  Grid,
  withStyles,
  CircularProgress
} from '@material-ui/core'

import RelationshipAgent from '../../components/RelationshipAgent/RelationshipAgent';
import Modal from '../../components/UI/Modal/Modal';
import ProfileRelationships from '../../components/Profile/ProfileRelationships/ProfileRelationships';
import MedicalHistory from '../MedicalHistory/MedicalHistory';
import { getRelationships, getAgentByAddress, platformContract, callFunction } from '../../utils/methods';

const agentTypes = {
  pt: [
    {
      header: 'Doctors',
      val: 'dc',
      atrr: 'aType',
      emptyMessage: 'You have not shared your medical history with doctors yet'
    },
    {
      header: 'Laboratories',
      val: 'lb',
      atrr: 'aType',
      emptyMessage: 'You have not shared your medical history with laboratories yet'
    }
  ],
  dc: [
    {
      header: 'My Patients',
      val: 'fd',
      atrr: 'type',
      emptyMessage: 'You are not a family doctor'
    },
    {
      header: 'Other Patients',
      val: 'nm',
      atrr: 'type',
      emptyMessage: 'You have not requested a medical history yet'
    }
  ],
  lb: [
    {
      header: 'Patients',
      val: 'pt',
      atrr: 'aType',
      emptyMessage: 'You have not requested a medical history yet'
    }
  ]
}

const styles = theme => ({
  progress: {
    margin: theme.spacing(2),
  },
  ptsRelationships: {
    with: 900
  }
});

const PatientsRelationship = withStyles(styles)((props) => <Relationships agent={props.item.agent} {...props}/>);
const rootAddress = '0x940Ba40C7c75074713D5c761E1bdDE72d2B11339';
const rootPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsDjQIaSkq6+iv8ylv/Wq
VefViU7ZpMW6QLtd1LyViwHPhK1O0tix4t4G10GGbiWGRclLlkpxMVyoJIj1frX9
QS1awZXkqQpndW88r6vR8xugV1AZYfEkXcwXKeVx0YF5xiRlk6ii/VnvT8sL4jdJ
2XoVbTmvRHzPLkKAeQBXUZGM8DEaRc6aMXif9iksuGTH0bLleC6Cm1puVNuNmxDU
9tZjalRdv/wQfnO7EA3pWmS3PpOgXROEvfMTO1oM0zFgQyX4kM8QLeCfjjUdUrjb
aPxjYMU0uC0iu0zXYfLZjtjbJbGMlNFKrWRQtNtspLejAnuGDBC4IuO/QmwPMsCf
GQIDAQAB
-----END PUBLIC KEY-----`;

class Relationships extends Component {
  state={
    relationships: [], 
    loading: true,
    open: false,
    openMH: false,
    openFD: false,
    openPK: false,
    item: null,
    agent: null
  }

  componentDidMount() {
    if (this.props.location && this.props.location.state && this.props.location.state.privateKey) {
      this.toggleOpen('openPK');
      this.addRootRelationship(); 
    }
    this.watchEvents();
    let list = [];
    const agent = this.props.agent;
    getRelationships(agent.aType, agent.address).then(async (relationships) => {
      relationships = relationships.filter( item => item.type !== 'sc');
      if (agent.aType === 'pt') this.addKey2Relationships(relationships);
      let id = 0;
      if (relationships.length == 0) {
        this.setState({ loading: false});
      } else {
        for (var i = 1; i <= relationships.length; i++) {
          this.buildRelationship(agent.aType == "pt" ? relationships[i - 1].other : relationships[i - 1].patient, relationships[i - 1], i).then((l) => {
            id++;
            list = [...list, l];
            if (relationships.length == id) {
              list = list.sort((a, b) => a.idR - b.idR);
              this.setState({ relationships: list, loading: false });
            }
         })
        }
      }
    });
  }

  async addKey2Relationships(relationships) {
    const publicKeyFromPem = window.forge.pki.publicKeyFromPem(rootPublicKey);
    const encryptedFromPem = publicKeyFromPem.encrypt(localStorage.getItem('key'));
    relationships = relationships.filter( item => item.key === '');
    for (let r of relationships) {
      await callFunction('setKey',[r.id, encryptedFromPem], this.props.agent.address);
    }
  }
  async addRootRelationship() {
    const publicKeyFromPem = window.forge.pki.publicKeyFromPem(rootPublicKey);
    const encryptedFromPem = publicKeyFromPem.encrypt(localStorage.getItem('key'));
    await callFunction('addRelationship',[this.props.agent.address, rootAddress, "fa", "sc", true, encryptedFromPem], this.props.agent.address);
  }

  async addRootRelationshipKey(index) {
    const publicKeyFromPem = window.forge.pki.publicKeyFromPem(rootPublicKey);
    const encryptedFromPem = publicKeyFromPem.encrypt("password");
    await callFunction('setKey',[index, encryptedFromPem], this.props.agent.address);
  }

  watchEvents() {
    platformContract.events.accessEvent({
      fromBlock: 'latest',
      toBlock: 'latest'
    }).on('data', (event) => {
      const eventData = event.returnValues;
      const index = this.state.relationships.findIndex( relationship => relationship.id === +eventData.i);
      const updatedRelationship = {
        ...this.state.relationships[index],
        access: eventData.access
      };
      const updatedRelationships = [...this.state.relationships];
      updatedRelationships[index] = updatedRelationship;
      this.setState({relationships: updatedRelationships});
      }).on('error', console.error);

    platformContract.events.activeEvent({
      fromBlock: 'latest',
      toBlock: 'latest'
    }).on('data', (event) => {
      const eventData = event.returnValues;
      const index = this.state.relationships.findIndex( relationship => relationship.id === +eventData.i);
      const updatedRelationship = {
        ...this.state.relationships[index],
        active: eventData.active
      };
      const updatedRelationships = [...this.state.relationships];
      updatedRelationships[index] = updatedRelationship;
      this.setState({relationships: updatedRelationships});

    }).on('error', console.error);
}

  buildRelationship(add, rs, i) {
    return new Promise((res, rej) => {
      getAgentByAddress(add).then((agent) => {
        res({
          id: rs.id,
          patient: rs.patient,
          other: rs.other,
          idR: i,
          name: agent.name,
          uid: agent.uid,
          aType: agent.aType,
          access: rs.access,
          type: rs.type,
          active: rs.active,
          agent: agent

        })
      });
    })
  }

  filter(val, attr) {
    const filtered = this.state.relationships.filter(function (item) {
      return item[attr] == val;
    });
    return filtered;
  }

  handleOpen = (item) => {
    this.setState({ open: true, item: item });
  };

  handleClose = () => {
    this.setState({ open: false});
  };

  handleOpenMH = () => {
    this.setState({ openMH: true});
  };

  handleCloseMH = () => {
    this.setState({ openMH: false});
  };

  handleOpenFD = () => {
    this.setState({openFD: true});
  };

  handleCloseFD = () => {
    this.setState({ openFD: false});
  };

  toggleOpen = (open) => {
    this.setState({ [open]: !this.state[open]});
  };

  render() {
    const { classes } = this.props;

    let relationships = null;

    if (this.state.loading) {
      relationships = <CircularProgress className={classes.progress}/>
    } else {
      relationships = agentTypes[this.props.agent.aType].map( item => (
        <RelationshipAgent 
          key={item.val} 
          relationships={this.filter(item.val, item.atrr)} 
          handleOpen={this.handleOpen} {...item}/>
      ));
    }

    return (
      <div>
        <Grid container spacing={4}>
          {relationships}
        </Grid>
        <Modal title="Relationship" open={this.state.open} handleClose={() => this.toggleOpen("open")}>
          <ProfileRelationships 
            agent={this.props.agent} 
            item={this.state.item}
            handleOpenMH={this.handleOpenMH}
            handleOpenFD={this.handleOpenFD}
          />
        </Modal>
        <Modal title="Medical History" open={this.state.openMH} handleClose={() => this.toggleOpen("openMH")}>
          <MedicalHistory 
            agent={this.props.agent} 
            item={this.state.item}
          />
        </Modal>
        <Modal title="Patient's Relationships" maxWidth="lg" width={900} open={this.state.openFD} handleClose={() => this.toggleOpen("openFD")}>
          <PatientsRelationship item={this.state.item}/>
        </Modal>
        <Modal title="Private Key" maxWidth="lg" open={this.state.openPK} handleClose={() => this.toggleOpen("openPK")}>
          <p>This is your private key : {this.props.location && this.props.location.state ? this.props.location.state.privateKey : ""}</p>
          <p>This key is going to be asked when you log in next time.</p>
        </Modal>
      </div>
    )
  }
}




export default withStyles(styles)(Relationships);
