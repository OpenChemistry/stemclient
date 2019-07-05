import React from 'react';
import { TextField, FormControl, Grid } from '@material-ui/core';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';

import { FormField } from '../../utils/forms';

const styles = (theme: Theme) => createStyles({
  field: {
    marginBottom: theme.spacing(3)
  }
});

interface Props extends WithStyles<typeof styles> {
  fields: FormField[];
  values: {[fieldName: string]: string};
  onChange: (name: string, value: any) => void;
}

const FormComponent : React.FC<Props> = ({fields, values, classes, onChange}) => {
  return (
    <Grid container spacing={3}>
    {fields.map(({name, label, validator, width, type}) => {
      const value = values[name] === undefined ? '' : values[name].toString();
      const error = validator ? validator(value) : undefined;
      return (
        <Grid item key={name}  xs={width ? width as any : 12}>
          <FormControl  fullWidth>
            <TextField
              className={classes.field}
              name={name}
              value={value}
              label={label}
              InputLabelProps={{
                shrink: true
              }}
              type={type}
              error={!!error}
              helperText={error}
              onChange={(e) => {onChange(e.target.name, e.target.value)}}
            />
          </FormControl>
        </Grid>
      )
    })}
    </Grid>
  );
}

export default withStyles(styles)(FormComponent);
