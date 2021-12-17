export class HawkerCenter {
    id: string | undefined;
    hawkerCenterName: string | undefined;
    numberOfOutlets: number | undefined;
    cuisineTypes: string[] | undefined;
    hawkerCentreAddress: string | undefined;

    constructor(
        id?: string,
        hawkerCenterName?: string,
        numberOfOutlets?: number,
        cuisineTypes?: string[],
        hawkerCentreAddress?: string
    ) {
        this.id = id;
        this.hawkerCenterName = hawkerCenterName;
        this.numberOfOutlets = numberOfOutlets;
        this.cuisineTypes = cuisineTypes;
        this.hawkerCentreAddress = hawkerCentreAddress;
    }
}