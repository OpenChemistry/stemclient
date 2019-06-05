import React from 'react';

import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import ListIcon from '@material-ui/icons/List';
import LiveIcon from '@material-ui/icons/BlurOn';
import HomeIcon from '@material-ui/icons/Home';

interface Props {
  section: string;
  onClick: (section: string) => void;
}

const sectionToIdx : {[key: string]: number} = {
  '': 0,
  'live-preview': 1,
  'images': 2  
}

const idxToSection : {[key: number]: string} = {
  0: '',
  1: 'live-preview',
  2: 'images'
}

const Navigation : React.FC<Props> = ({section, onClick}) => {
  return (
    <BottomNavigation
      value={sectionToIdx[section]}
      onChange={(e, newValue) => {onClick(idxToSection[newValue])}}
      showLabels
    >
      <BottomNavigationAction label='Home' icon={<HomeIcon/>}/>
      <BottomNavigationAction label='Live Preview' icon={<LiveIcon/>}/>
      <BottomNavigationAction label='Datasets' icon={<ListIcon/>}/>
    </BottomNavigation>
  )
}

export default Navigation;
