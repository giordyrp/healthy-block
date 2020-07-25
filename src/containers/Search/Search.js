import React, { Component } from 'react';

import {
  Paper, 
  InputBase,
  Icon as IconButton,
  Grid,
  CircularProgress,
  withStyles
}  from '@material-ui/core';
import { Search as SearchIcon } from '@material-ui/icons';
import Modal from '../../components/UI/Modal/Modal';
import Result from '../../components/Result/Result';
import ProfileSearch from '../../components/Profile/ProfileSearch/ProfileSearch';
import { getPatients } from '../../utils/methods';

class Search extends Component {
  state = {
    patients: null,
    results: [],
    open: false,
    item: null,
    text: '',
    loading: true,
    loadingResults: false,
    sendingRequest: false
  }

  componentDidMount() {
    getPatients().then((patients) => {
      this.setState({ patients: patients, loading: false });
    });
  }

  handleOpen = (item) => {
    this.setState({ open: true, item: item });
  };

  //, item: null
  handleClose = () => {
    this.setState({ open: false});
  };

  resetSearch = () => this.setState({ loadingResults: false, results: [], text: ''})

  handleSearchChange = (value) => {
    this.setState({ loadingResults: true, text: value})
    if (value.length < 1) return this.resetSearch()
    const filtered = this.state.patients.filter(function (item) {
      return item.name.toLowerCase().includes(value.toLowerCase());
    });
    this.setState({
      loadinResults: false,
      results: filtered
    })
  }


  render() {
    const { classes } = this.props;

    let results = this.state.results.map( item => (
      <Grid item xs={12} sm={6} lg={3}>
        <Result key={item.uid} item={item} handleOpen={this.handleOpen}/>
      </Grid>
    ));

    results = <Grid container direction="row" justify="left" alignItems="left">
                {results}
              </Grid>;


    if (this.state.results.length === 0) {
      if (this.state.text === '') {
        results = <p>Write the patient's name on the top bar</p>;
      } else {
        results = <p>No results</p>;
      }
    }

    let search = null;

    if (this.state.loading) {
      search = <CircularProgress className={classes.progress}/>
    } else {
      search = <div>
                <Paper className={classes.root}>
                  <InputBase
                    className={classes.input}
                    placeholder="Search a patient"
                    onChange={(evt) => this.handleSearchChange(evt.target.value)}
                  />
                  <IconButton aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Paper>
                {results}
                <Modal title="Patient" open={this.state.open} handleClose={this.handleClose}>
                  <ProfileSearch item={this.state.item} agent={this.props.agent}/>
                </Modal>
              </div>

    }

    return search;
  }
}

const styles = theme => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
    marginBottom: 10
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  divider: {
    height: 28,
    margin: 4,
  },
  card: {
    width: 200,
    marginTop: '10px'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  bigAvatar: {
    margin: 10,
    width: 120,
    height: 120,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  progress: {
    margin: theme.spacing(2),
  },
  button:{
    margin:0,
    padding:0,
    textTransform : 'none'
  }
});

export default withStyles(styles)(Search);
