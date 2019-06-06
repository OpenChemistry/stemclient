import React from 'react';

import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import ListIcon from '@material-ui/icons/List';
import LiveIcon from '@material-ui/icons/BlurOn';
import HomeIcon from '@material-ui/icons/Home';

interface Props {
  section: string;
  authenticated: boolean;
  onClick: (section: string) => void;
}

const Navigation : React.FC<Props> = ({section, authenticated, onClick}) => {
  return (
    <BottomNavigation
      value={section}
      onChange={(e, newValue) => {onClick(newValue)}}
      showLabels
    >
      <BottomNavigationAction value={''} label='Home' icon={<HomeIcon/>}/>
      {authenticated &&
      <BottomNavigationAction value={'live-preview'} label='Live Preview' icon={<LiveIcon/>}/>
      }
      <BottomNavigationAction value={'images'} label='Datasets' icon={<ListIcon/>}/>
    </BottomNavigation>
  )
}

export default Navigation;
