/* eslint-disable @typescript-eslint/naming-convention */
export enum SocketNamespaceEnum {
    NEW_ORDER = 'NEW_ORDER',
    CANCEL_ORDER = 'CANCEL_ORDER',
    UPDATE_ORDER_STATUS = 'UPDATE_ORDER_STATUS',
    SUBSCRIBE = 'SUBSCRIBE',
    UNSUBSCRIBE = 'UNSUBSCRIBE',
    DELETE_UNPAID_CASH_ORDER = 'DELETE_UNPAID_CASH_ORDER',
    NEW_UNPAID_CASH_ORDER = 'NEW_UNPAID_CASH_ORDER',
    SUCCESSFUL_CONNECTION = 'SUCCESSFUL_CONNECTION',
    UNABLE_TO_FULFILL_ORDER='UNABLE_TO_FULFILL_ORDER'
}