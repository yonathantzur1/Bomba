import { Injectable } from "@angular/core";
@Injectable()
export class CookieService {
    uidCookieName: string = "uid";

    setCookie(name: string, value: any, exHours: number) {
        let d = new Date();
        d.setTime(d.getTime() + (exHours * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    getCookie(name: string) {
        name += "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }

    private deleteCookieByName(name: string) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    deleteUidCookie() {
        this.deleteCookieByName(this.uidCookieName);
    }
}