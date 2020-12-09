import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/global/alert.service';
import { SnackbarService } from 'src/app/services/global/snackbar.service';
import { RegisterService } from 'src/app/services/register.service';

@Component({
    selector: 'verification',
    templateUrl: './verification.html',
    providers: [RegisterService],
    styleUrls: ['./verification.css']
})

export class VerificationComponent implements OnInit {

    verificationCode: string;
    userUid: string;
    username: string;
    isLoading: boolean = false;
    isResendClicked: boolean = false;
    isValid: boolean;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private snackbarService: SnackbarService,
        private registerService: RegisterService) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.verificationCode = params["verificationCode"];
            this.userUid = params["userUid"];
            this.isLoading = true;

            if (this.verificationCode) {
                this.registerService.verifyUser(this.verificationCode).then(data => {
                    this.isLoading = false;
                    const result = data.result;

                    if (this.isValid = !!result) {
                        this.username = result;
                    }
                });
            }
            else if (this.userUid) {
                this.registerService.getVerificationUserData(this.userUid).then(data => {
                    this.isLoading = false;
                    const result = data.result;

                    if (!!result) {
                        this.username = result;
                    }
                    else {
                        this.router.navigateByUrl("/");
                    }
                });
            }
        });
    }

    resendVerification() {
        this.isLoading = true;
        this.registerService.resendVerification(this.userUid).then(result => {
            this.isLoading = false;

            if (result) {
                this.isResendClicked = true;
            }
            else {
                this.snackbarService.error();
                this.router.navigateByUrl("/");
            }
        });
    }

}