import { SimilarGroup } from './similarGroup';
import { Order } from '../../order';
import { QueueConditionEnum } from '../../enums/queue-condition-enum';
import { QueuePreferenceEnum } from '../../enums/queue-preference-enum';

export interface QueueInterface {
    // view the first group from the queue
    viewNextGroup: () => Order | SimilarGroup;

    //remove the first group from the queue, which has status received
    getNextGroup: () => Order | SimilarGroup;

    // remove the most recent group in the previous completed groups, and add it back into the main q
    getPreviousCompletedGroup: () => Order | SimilarGroup;
    getQueueCondition: () => QueueConditionEnum;
    getQueueType: () => QueuePreferenceEnum;
    getQueueSize: () => number;

    // return max 5 previously completed groups
    peekPreviousCompletedGroups: () => Order[] | SimilarGroup[];
    addOrderToQueue: (order: Order) => void;
    addOrderGroupToQueue: (group: SimilarGroup) => void;

    // add a group with status completed in to the previous groups
    addGroupToPreviousCompletedGroups: (order: Order | SimilarGroup) => void;

}
