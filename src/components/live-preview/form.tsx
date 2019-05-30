import React from 'react';
import { Form, Field } from 'react-final-form';
import { TextField, Button, FormControl } from '@material-ui/core';
import {  WithStyles, Theme, withStyles, createStyles } from '@material-ui/core/styles';

import { Validator } from '../../utils/forms';

const styles = (theme: Theme) => createStyles({
  field: {
    marginBottom: theme.spacing(3)
  }
});

interface FormField {
  name: string;
  label: string;
  initial?: string;
  validator?: Validator;
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
          {fields.map(({name, label, validator}) => (
            <FormControl key={name} className={classes.field} fullWidth>
            <Field
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
          ))}
          <Button
            type='submit' disabled={invalid || disabled}
            variant='contained' color='secondary'
          >Submit</Button>
        </form>
      )}
    >
    </Form>
  );
}

export default withStyles(styles)(FormComponent);
