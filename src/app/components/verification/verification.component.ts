import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterService } from 'src/app/services/register.service';

@Component({
    selector: 'verification',
    templateUrl: './verification.html',
    providers: [RegisterService],
    styleUrls: ['./verification.css']
})

export class VerificationComponent implements OnInit {

    verificationCode: string;
    isLoading: boolean = false;
    isValid: boolean;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private registerService: RegisterService) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.verificationCode = params["verificationCode"];

            this.isLoading = true;
            this.registerService.verifyUser(this.verificationCode).then(result => {
                this.isLoading = false;
                this.isValid = !!result;
            });
        });
    }

}