import { Injectable } from "@angular/core";

export enum ALERT_TYPE {
    INFO,
    DANGER,
    WARNING
}

@Injectable()
export class AlertService {
    public isShow: boolean;
    public isLoading: boolean;
    public showCancelButton: boolean;
    public title: string;
    public text: string;
    public type: ALERT_TYPE;
    public preConfirm: Function;
    public confirmFunc: Function;
    public closeFunc: Function;
    public finalFunc: Function;
    public confirmBtnText: string;
    public closeBtnText: string;
    public image: string;
    public disableEscapeExit: boolean;

    private newLine: string = "{{enter}}";

    private initialize() {
        this.isShow = false;
        this.isLoading = false;
        this.showCancelButton = true;
        this.text = "";
        this.confirmBtnText = "Confirm";
        this.closeBtnText = "Cancel";
    }

    alert(alt: any) {
        this.initialize();

        if (alt) {
            this.title = alt.title;
            (alt.text != null) && (this.text = alt.text.replace(new RegExp(this.newLine, 'g'), "\n"));
            (alt.showCancelButton != null) && (this.showCancelButton = alt.showCancelButton);
            (alt.confirmBtnText != null) && (this.confirmBtnText = alt.confirmBtnText);
            (alt.closeBtnText != null) && (this.closeBtnText = alt.closeBtnText);
            this.preConfirm = alt.preConfirm;
            this.confirmFunc = alt.confirmFunc;
            this.closeFunc = alt.closeFunc;
            this.finalFunc = alt.finalFunc;
            this.type = alt.type;
            this.image = alt.image;
            this.disableEscapeExit = alt.disableEscapeExit;
            this.isShow = true;
        }
    }

    confirm() {
        if (this.preConfirm) {
            this.isLoading = true;
            this.preConfirm().then((result: any) => {
                this.isLoading = true;
                this.confirmFunc && this.confirmFunc(result);
                this.activateAlertClose()
            }).catch(() => {
                this.isLoading = false;
                this.initialize();
            });
        }
        else {
            this.confirmFunc && this.confirmFunc();
            this.activateAlertClose();
        }
    }

    close() {
        this.closeFunc && this.closeFunc();
        this.activateAlertClose();
    }

    activateAlertClose() {
        this.finalFunc && this.finalFunc();
        this.initialize();
    }
}