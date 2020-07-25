import React from 'react';

import { Icon, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';


const Menu = (props) => {
  const menu = props.menu.map( menuItem => (
    <ListItem key={menuItem.route} button onClick={()=>props.menuClicked(menuItem.route)}>
      <ListItemIcon>
        <Icon>{menuItem.icon}</Icon>
      </ListItemIcon>
      <ListItemText primary={menuItem.name} />
    </ListItem>
  ))
  return menu;
}

export default Menu;