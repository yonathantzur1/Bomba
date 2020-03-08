import { Observable, Subject } from "rxjs";

import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../services/global/auth.service';
import { CookieService } from '../services/global/cookie.service';

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(private router: Router,
        private authService: AuthService,
        private cookieService: CookieService) { }

    canActivate() {
        return Observable.create((observer: Subject<boolean>) => {
            // In case the uid cookie is not exists.
            if (!this.cookieService.getCookie(this.cookieService.uidCookieName)) {
                observer.next(true);
            }
            else {
                this.authService.isUserOnSession().then(result => {
                    if (!result) {
                        this.authService.deleteClientAuth();
                        observer.next(true);
                    }
                    else {
                        this.router.navigateByUrl('/');
                        observer.next(false);
                    }
                });
            }
        });
    }
}