import React, { Fragment } from 'react';
import { TextField, FormControl, Grid, Button } from '@material-ui/core';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';

import { FormField } from '../../utils/forms';

const styles = (theme: Theme) => createStyles({
  field: {
    marginBottom: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(3)
  }
});

interface Props extends WithStyles<typeof styles> {
  fields: FormField[];
  values: {[fieldName: string]: string | undefined};
  onChange: (name: string, value: any) => void;
  onSubmit: (values: {[fieldName: string]: any}) => void;
  disabled?: boolean;
  submitLabel?: string;
}

const FormComponent : React.FC<Props> = ({fields, values, classes, onChange, onSubmit, disabled, submitLabel}) => {

  const invalid = fields.reduce((invalid, {name, validator}) => {
    if (invalid) {
      return invalid;
    }
    const value = values[name];
    if (validator) {
      return !!validator(value);
    }
    return invalid
  }, false);

  return (
    <Fragment>
      <Grid container spacing={3}>
      {fields.map(({name, label, validator, width, type}) => {
        const value = values[name] === undefined ? '' : values[name]!.toString();
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
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (!validator) {
                    onChange(name, value);
                  } else {
                    if (!validator(value)) {
                      onChange(name, value);
                    }
                  }
                }}
              />
            </FormControl>
          </Grid>
        )
      })}
      </Grid>
      <Button
        disabled={invalid || disabled}
        className={classes.button}
        variant='contained' color='secondary'
        onClick={() => onSubmit(values)}
      >{submitLabel ? submitLabel : 'Submit'}</Button>
    </Fragment>
  );
}

export default withStyles(styles)(FormComponent);
