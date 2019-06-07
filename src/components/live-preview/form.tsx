import React from 'react';
import { Form, Field } from 'react-final-form';
import { TextField, Button, FormControl, Grid } from '@material-ui/core';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';

import { Validator } from '../../utils/forms';

const styles = (theme: Theme) => createStyles({
  field: {
    marginBottom: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(3)
  }
});

interface FormField {
  name: string;
  label: string;
  initial?: string;
  validator?: Validator;
  width?: number;
}

interface Props extends WithStyles<typeof styles> {
  fields: FormField[];
  initialValues: {[fieldName: string]: string};
  onSubmit: (values: {[fieldName: string]: any}) => void;
  disabled?: boolean;
}

const FormComponent : React.FC<Props> = ({fields, initialValues, onSubmit, disabled, classes}) => {
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({handleSubmit, invalid}) => (
        <form onSubmit={handleSubmit}
        >
          <Grid container spacing={3}>
          {fields.map(({name, label, validator, width}) => (
            <Grid item key={name}  xs={width ? width as any : 12}>
              <FormControl  fullWidth>
                <Field
                  className={classes.field}
                  name={name}
                  validate={validator}
                  render={({input, meta: {error, touched}}) => {
                  return (
                    <TextField {...input}
                      label={label}
                      InputLabelProps={{
                        shrink: true
                      }}
                      error={touched && !!error}
                      helperText={touched ? error : undefined}></TextField>
                  )}}
                />
              </FormControl>
            </Grid>
          ))}
          </Grid>
          <Button
            type='submit' disabled={invalid || disabled}
            className={classes.button}
            variant='contained' color='secondary'
          >Submit</Button>
        </form>
      )}
    >
    </Form>
  );
}

export default withStyles(styles)(FormComponent);
