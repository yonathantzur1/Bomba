import { Injectable } from '@angular/core';

import { SocketService } from './socket.service';
import { PermissionsService } from './permissions.service';
import { ImageService } from './image.service';

declare let $: any;
declare let jQuery: any;

@Injectable()
export class GlobalService {
    private data = {};
    userId: string;

    constructor(private socketService: SocketService,
        private permissionsService: PermissionsService,
        private imageService: ImageService) {

        // close modal when click back on browser.
        $(window).on('popstate', function () {
            let modalElement = $(".modal");

            if (modalElement.length > 0) {
                modalElement.modal("hide");
            }
        });

        // Add jQuery function to find if element has scroll bar.
        (($) => {
            $.fn.hasScrollBar = function () {
                return this.get(0).scrollHeight > this.get(0).clientHeight;
            }
        })(jQuery);
    }

    initialize() {
        if (!this.socketService.isSocketExists()) {
            this.socketService.initialize();
            this.permissionsService.initialize();
        }
    }

    resetGlobalVariables() {
        this.socketService.deleteSocket();
        this.permissionsService.deletePermissions();
        this.imageService.deleteUserProfileImage();
        this.userId = null;
    }

    setData(key, value) {
        this.data[key] = value;
    }

    getData(key) {
        if (this.data[key]) {
            // Deep copy data value.
            let result = JSON.parse(JSON.stringify(this.data[key]));
            delete this.data[key];

            return result;
        }
        else {
            return null;
        }
    }
}