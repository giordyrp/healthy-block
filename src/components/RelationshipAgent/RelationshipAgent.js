import React from 'react';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';

import { 
  Button, 
  Card, 
  CardHeader, 
  Avatar, 
  Grid, 
  Typography,
  Icon, 
  withStyles 
} from '@material-ui/core'

const accesses = {
  fa: "Full Access",
  fal: "Ful Altered List",
  pl: "Partial List",
  rg: "Range",
  tr: "Trend",
  na: "No Access"
}

const RelationshipAgent = (props) => {
  const { classes } = props;
  let relationships = <p>{props.emptyMessage}</p>;

  if (props.relationships.length > 0) {
    relationships = props.relationships.map( item => (
      <Grid item key={item.id}>
        <Button className={classes.button}> 
          <Card className={classes.card} onClick={() => props.handleOpen(item)}>
            <CardHeader
              avatar={
                <Avatar alt="Remy Sharp" src={require("../../assets/images/user.png")} />
              }
              titleTypographyProps={{variant:'h6'}}
              title={item.type == "fd" ? item.name + " (FD)" : item.name}
            subheader={<Auxiliary>{accesses[item.access] + ' - '} <Icon>{item.active ? "lock_open": "lock"}</Icon></Auxiliary> }/>
          </Card>
        </Button>
      </Grid>
      ));
  }
  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Typography variant="h5" gutterBottom>{props.header}</Typography>
      <Grid container spacing={2}>
        {relationships} 
      </Grid> 
    </Grid>   
  )
}

const styles = theme => ({
  card: {
    width: 250
  },
  button:{
    margin:0,
    padding:0,
    textTransform : 'none'
  }
});

export default withStyles(styles)(RelationshipAgent);
