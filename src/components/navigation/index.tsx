import React from 'react';

import { MenuList, MenuItem, ListItemIcon, Typography } from '@material-ui/core';
import ListIcon from '@material-ui/icons/List';
import LiveIcon from '@material-ui/icons/BlurOn';
import HomeIcon from '@material-ui/icons/Home';

interface Props {
  section: string;
  authenticated: boolean;
  onClick: (section: string) => void;
}

const Navigation : React.FC<Props> = ({section, authenticated, onClick}) => {
  const menuItems = [
    {sectionName: '', label: 'Home', icon: HomeIcon, display: true},
    {sectionName: 'live-preview', label: 'Live Preview', icon: LiveIcon, display: authenticated},
    {sectionName: 'images', label: 'Datasets', icon: ListIcon, display: true},
  ];
  return (
    <MenuList>
      {menuItems.filter(({display}) => display).map(({sectionName, label, icon: Icon}) => (
        <MenuItem onClick={() => {onClick(sectionName)}} selected={sectionName == section}>
          <ListItemIcon>
            <Icon/>
          </ListItemIcon>
          <Typography color="inherit" variant="subtitle1">{label}</Typography>
        </MenuItem>
      ))}
    </MenuList>
  )
}

export default Navigation;
