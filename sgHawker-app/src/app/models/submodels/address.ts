export class Address {
    _id: string | undefined;
    addressDetails: string | undefined;
    postalCode: string | undefined;
    isDefault: boolean | undefined;

    constructor(
        _id?: string,
        addressDetails?: string,
        postalCode?: string,
        isDefault?: boolean,
      ) {
        this._id = _id;
        this.addressDetails = addressDetails;
        this.postalCode = postalCode;
        this.isDefault = isDefault;
      }

};
