import { Injectable } from "@angular/core";
const defaultProfileImagePath: string = "/assets/images/default_profile_img.jpg";

@Injectable()
export class ImageService {
    userProfileImage: string;
    defaultProfileImage: string;

    constructor() {
        this.defaultProfileImage = defaultProfileImagePath;

        this.imageToBase64(defaultProfileImagePath, (imgBase64: string) => {
            this.defaultProfileImage = imgBase64;
        });
    }

    private imageToBase64(url: string, callback: Function) {
        let xhr = new XMLHttpRequest();
        xhr.onload = () => {
            var reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    deleteUserProfileImage() {
        this.userProfileImage = null;
    }
}