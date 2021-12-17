export class BankAccount {
    _id: string | undefined;
    fullName: string | undefined;
    accountNumber: string | undefined;
    nameOfBank: string | undefined;
    isDefault: boolean | undefined;

    constructor(
        _id?: string,
        fullName?: string,
        accountNumber?: string,
        nameOfBank?: string,
        isDefault?: boolean,
      ) {
        this._id = _id;
        this.fullName = fullName;
        this.accountNumber = accountNumber;
        this.nameOfBank = nameOfBank;
        this.isDefault = isDefault;
      }
}
