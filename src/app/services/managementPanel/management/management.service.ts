import { BasicService } from '../../basic.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ManagementService extends BasicService {

    constructor(public http: HttpClient) {
        super(http, "/api/management");
    }

    getUserByName(searchInput: string) {
        let data = { searchInput };

        return super.post('/getUserByName', data);
    }

    getUserFriends(friendsIds: Array<string>) {
        let data = { friendsIds };

        return super.post('/getUserFriends', data);
    }

    editUser(updateFields: any) {
        let data = { updateFields };

        return super.put('/editUser', data);
    }

    blockUser(blockObj: any) {
        let data = { blockObj };

        return super.put('/blockUser', data);
    }

    unblockUser(userId: string) {
        let data = { userId };

        return super.put('/unblockUser', data);
    }

    removeFriends(userId: string, friendId: string) {
        return super.delete('/removeFriends?userId=' + userId + "&friendId=" + friendId);
    }

    deleteUser(userId: string, userFirstName: string, userLastName: string, userEmail: string) {
        return super.delete('/deleteUser?userId=' + userId +
            "&userFirstName=" + userFirstName +
            "&userLastName=" + userLastName +
            "&userEmail=" + userEmail);
    }
}