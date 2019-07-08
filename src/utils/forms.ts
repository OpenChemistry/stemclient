export type BaseValidator = (value: string | undefined) => boolean;
export type Validator = (value: string | undefined) => string | undefined;

export const makeValidator = (validator: BaseValidator, msg: string) : Validator => {
  return (value) => {
    return validator(value) ? undefined : msg;
  }
}

export const composeValidators = (...validators : Validator[]) : Validator => {
  return (value) => {
    return validators.reduce((error, validator) => {
      return error || validator(value);
    }, undefined as string | undefined);
  }
}

export const requiredBaseValidator : BaseValidator = (value) => {
  if (value === undefined) {
    return false;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return false;
  }

  return true;
};

export const requiredValidator = makeValidator(requiredBaseValidator, 'Required');

export const numberBaseValidator : BaseValidator = (value) => {
  return isFinite(value as any);
}

export const numberValidator = makeValidator(numberBaseValidator, 'Must be a number');

export const integerBaseValidator : BaseValidator = (value) => {
  if (!numberBaseValidator(value)) {
    return false;
  }
  return Math.abs(parseInt(value as any) - parseFloat(value as any)) < Number.EPSILON;
}

export const integerValidator = makeValidator(integerBaseValidator, 'Must be an integer');

export interface FormField {
  name: string;
  label: string;
  initial?: string;
  validator?: Validator;
  width?: number;
  type?: string;
}

type ServerFieldType = 'string' | 'number' | 'integer';

export interface ServerField {
  type: ServerFieldType;
  label?: string;
  description?: string;
  default?: any;
}

export const makeFormFields = (serverFields: {[name:string]: ServerField}) : FormField[] => {
  return Object.entries(serverFields).reduce((fields, [name, field]) => {
    const label = field.label || name;
    const initial = field.default;
    const width = 6;
    let type: string | undefined;
    const validators = [ requiredValidator ];
    switch(field.type) {
      case 'string': {
        type = field.type;
        break;
      }
      case 'number': {
        type = field.type;
        validators.push(numberValidator);
        break;
      }
      case 'integer': {
        type = 'number';
        validators.push(integerValidator);
        break;
      }
      default: {
        break;
      }
    }
    const validator = composeValidators(...validators);
    fields.push({
      name,
      type,
      label,
      initial,
      validator,
      width
    });
    return fields;
  }, [] as FormField[]);
}
