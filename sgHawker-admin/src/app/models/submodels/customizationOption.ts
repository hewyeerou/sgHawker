export class CustomizationOption {
  _id: string | undefined;
  optionName: string | undefined;
  optionCharge: number | undefined;

  constructor(
    _id?: string,
    optionName?: string,
    optionCharge?: number,
  ) {
    this._id = _id;
    this.optionName = optionName;
    this.optionCharge = optionCharge;
  }
};
