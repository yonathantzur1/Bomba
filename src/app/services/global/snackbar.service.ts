import { Injectable } from "@angular/core";

@Injectable()
export class SnackbarService {
    public delay: number;
    public isShow: boolean;
    public text: string;
    public onClick: Function;

    private currentTimeout: any;

    constructor() {
        this.initialize();
    }

    private initialize() {
        this.delay = 2500; // milliseconds
        this.isShow = false;
        this.currentTimeout = null;
        this.text = '';
    }

    snackbar(text: string, delay?: number, onClick?: Function) {
        // Clear timeout if exists.
        clearTimeout(this.currentTimeout);

        // Set message text and show the snackbar.
        this.text = text;
        this.isShow = true;
        this.onClick = () => {
            onClick && onClick();
            this.hideSnackbar();
        };

        this.currentTimeout = setTimeout(() => {
            this.initialize()
        }, delay || this.delay);
    }

    hideSnackbar() {
        this.isShow = false;
    }
}