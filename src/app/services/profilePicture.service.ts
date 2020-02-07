import { BasicService } from './basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ProfilePictureService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/profilePicture");
    }

    getUserProfileImage() {
        return super.get('/getUserProfileImage');
    }

    saveImage(imgBase64: string) {
        let image = {
            "imgBase64": imgBase64
        };

        return super.post('/saveImage', image);
    }

    deleteImage() {
        return super.delete('/deleteImage');
    }

}