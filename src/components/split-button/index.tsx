import React from 'react';

import { Button, ButtonGroup, Popper, Grow, ClickAwayListener, MenuList, MenuItem, Paper } from '@material-ui/core';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const styles = (_theme: Theme) => createStyles({
  expandButton: {
    padding: 0
  }
});

interface Props extends WithStyles<typeof styles> {
  value: string;
  options: {[value: string]: string};
  onChange: (value: string) => void;
  onClick: (value: string) => void;
}

const SplitButton : React.FC<Props> = ({value, options, onChange, onClick, classes}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  return (
    <React.Fragment>
      <ButtonGroup variant="contained" color="secondary" ref={anchorRef} aria-label="split button">
        <Button onClick={() => onClick(value)}>{options[value]}</Button>
        {Object.keys(options).length > 1 &&
        <Button
          color="secondary"
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={() => setOpen(true)}
          className={classes.expandButton}
        >
          <ArrowDropDownIcon />
        </Button>
        }
      </ButtonGroup>

      <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper id="menu-list-grow">
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList>
                  {Object.entries(options).map(([key, label]) => (
                    <MenuItem
                      key={key}
                      selected={key === value}
                      onClick={() => {setOpen(false); onChange(key)}}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default withStyles(styles)(SplitButton);
