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

  if (value.trim().length === 0) {
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
