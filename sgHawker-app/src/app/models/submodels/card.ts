export class Card {
    _id: string | undefined;
    cardName: string | undefined;
    cardNumber: string | undefined;
    truncatedCardNumber: string | undefined;
    cardType: string | undefined;
    expiryDate: Date | undefined;
    cvv: string | undefined;
    billingAddressDetails: string | undefined;
    billingPostalCode: string | undefined;
    isDefault: boolean | undefined;

    constructor(
        _id?: string,
        cardName?: string,
        cardNumber?: string,
        truncatedCardNumber?: string,
        cardType?: string,
        expiryDate?: Date,
        cvv?: string,
        billingAddressDetails?: string,
        billingPostalCode?: string,
        isDefault?: boolean,
      ) {
        this._id = _id;
        this.cardName = cardName;
        this.cardNumber = cardNumber;
        this.truncatedCardNumber = truncatedCardNumber;
        this.cardType = cardType;
        this.expiryDate = expiryDate;
        this.cvv = cvv;
        this.billingAddressDetails = billingAddressDetails;
        this.billingPostalCode = billingPostalCode;
        this.isDefault = isDefault;
      }

};

