import React, { Component, Fragment } from 'react';
import {
  Card, CardHeader,
  IconButton
} from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core/styles';

import KeyBoardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

const styles = (theme: Theme) => createStyles(
  {
    card: {
      marginBottom: theme.spacing(2),
      textAlign: 'left'
    },
    headerRoot: {
      display: 'flex',
      alignItems: 'center',
      minHeight: theme.spacing(11)
    },
    header: {
      flexGrow: 1
    },
    avatar: {
      width: theme.spacing(11)
    }
  }
);

interface ComponentProps {
  title: React.ReactNode;
  subheader: React.ReactNode;
  footer: React.ReactNode;
  collapsible: boolean;
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  actions: React.ReactNode[];
  thumbnail: React.ReactNode;
  image: React.ReactNode;
}

const defaultProps : ComponentProps = {
  title: "",
  subheader: "",
  footer: null,
  collapsible: true,
  collapsed: false,
  onToggle: () => {},
  actions: [],
  thumbnail: null,
  image: null
}

interface Props extends ComponentProps, WithStyles<typeof styles> {};


class CardComponent extends Component<Props> {
  static defaultProps = defaultProps;

  render() {
    const {title, subheader, footer, collapsible, collapsed, onToggle, actions = [], thumbnail, image, classes} = this.props;

    return (
      <Card className={classes.card}>
        <div className={classes.headerRoot}>
          <div className={classes.avatar}>
          {collapsed
            ? thumbnail
            : null
          }
          </div>
          <div className={classes.header}>
            <CardHeader
              title={title}
              subheader={subheader}
              action={
                <Fragment>
                  {actions}
                  {collapsible &&
                  <IconButton
                    key="collapse"
                    size="small"
                    onClick={() => {onToggle(!collapsed)}}
                  >
                    {collapsed ? <KeyBoardArrowDown/> : <KeyboardArrowUp/>}
                  </IconButton>
                  }
                </Fragment>
              }
            />
          </div>
        </div>
        {!collapsed && image}
        {footer}
      </Card>
    );
  }
}

export default withStyles(styles)(CardComponent);
