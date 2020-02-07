import { HttpClient, HttpHeaders } from '@angular/common/http';

export class BasicService {
    public prefix: string;

    constructor(public http: HttpClient, private pfx?: string) {
        this.prefix = this.pfx || "";
    }

    private getUrl(url: string): string {
        return this.prefix + url;
    }

    get(url: string): Promise<any> {
        return this.handlePromiseResult(this.http.get(this.getUrl(url)).toPromise());
    }

    post(url: string, data?: any): Promise<any> {
        if (data != null && typeof data == "object") {
            data = JSON.stringify(data);
        }

        return this.handlePromiseResult
            (this.http.post(this.getUrl(url), data, this.getRequestOptions()).toPromise());
    }

    put(url: string, data?: any): Promise<any> {
        if (data != null && typeof data == "object") {
            data = JSON.stringify(data);
        }

        return this.handlePromiseResult
            (this.http.put(this.getUrl(url), data, this.getRequestOptions()).toPromise());
    }

    delete(url: string): Promise<any> {
        return this.handlePromiseResult(this.http.delete(this.getUrl(url)).toPromise());
    }

    private async handlePromiseResult(promise: Promise<any>): Promise<any> {
        try {
            return await promise;
        }
        catch (err) {
            return null;
        }
    }

    private getRequestOptions() {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return { headers };
    }
}