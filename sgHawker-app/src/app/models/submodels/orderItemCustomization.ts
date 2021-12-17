import { CustomizationOption } from "./customizationOption";

export class OrderItemCustomization {
  _id: string | undefined;
  customizationName: string | undefined;
  selectedOption: CustomizationOption | undefined;

  constructor(
    _id?: string,
    customizationName?: string,
    selectedOption?: CustomizationOption,
  ) {
    this._id = _id;
    this.customizationName = customizationName;
    this.selectedOption = selectedOption;
  }
}
