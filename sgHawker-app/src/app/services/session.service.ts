import { Injectable } from '@angular/core';
import { Outlet } from '../models/outlet';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root'
})
export class SessionService {

	constructor() {}

	getIsLogin(): boolean {
		if (sessionStorage.isLogin === 'true') {
			return true;
		}
		else {
			return false;
		}
	}

	setIsLogin(isLogin: boolean): void {
		sessionStorage.isLogin = isLogin;
	}

	getCurrentUser(): User {
		if (sessionStorage.currentUser) {
			return JSON.parse(sessionStorage.currentUser);
		}
	}

	setCurrentUser(currentUser: User | null): void {
		sessionStorage.currentUser = JSON.stringify(currentUser);
	}

	setCurrentOutlet(outlet: Outlet) {
		sessionStorage.currentOutlet = JSON.stringify(outlet);
	}

	getCurrentOutlet(): Outlet {
		return JSON.parse(sessionStorage.currentOutlet);
	}

	addGuestOrderId(orderId: string) {
		if (sessionStorage.guestOrders) {
			const currentOrders = JSON.parse(sessionStorage.getItem('guestOrders'));
			currentOrders.push(orderId);
			sessionStorage.setItem('guestOrders', JSON.stringify(currentOrders));
		} else {
			const orderArray = [];
			orderArray.push(orderId);
			sessionStorage.setItem('guestOrders', JSON.stringify(orderArray));
		}
	}

	getGuestOrderIds(): string[] {
		return JSON.parse(sessionStorage.getItem('guestOrders'));
	}

	getIsGuest(): boolean {
		if (sessionStorage.isGuest === 'true') {
			return true;
		}
		else {
			return false;
		}
	}

	setIsGuest(isGuest: boolean): void {
		sessionStorage.isGuest = isGuest;
	}
}
