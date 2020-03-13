import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthService } from '../services/global/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate() {
        return this.authService.isUserAdmin().then(result => {
            if (result) {
                return true;
            }
            else {
                this.router.navigateByUrl('/page-not-found');
                return false;
            }
        });
    }
}