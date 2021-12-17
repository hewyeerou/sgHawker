import { CustomizationOption } from './customizationOption';

export class Customization {
  _id: string | undefined;
  customizationName: string | undefined;
  mandatory: boolean | undefined;
  customizationOptions: CustomizationOption[] | undefined;

  constructor(
    _id?: string,
    customizationName?: string,
    mandatory?: boolean,
    customizationOptions?: CustomizationOption[],
  ) {
    this._id = _id;
    this.customizationName = customizationName;
    this.mandatory = mandatory;
    this.customizationOptions = customizationOptions;
  }
};
