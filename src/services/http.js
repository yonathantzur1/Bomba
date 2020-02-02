import axios from 'axios';

export class BasicService {
    prefix;

    constructor(pfx) {
        this.prefix = pfx || "";
    }

    getUrl(url) {
        return this.prefix + url;
    }

    get(url) {
        return axios.get(this.getUrl(url));
    }

    post(url, data) {
        return axios.post(this.getUrl(url), data);
    }

    put(url, data) {
        return axios.put(this.getUrl(url), data);
    }

    delete(url) {
        return axios.delete(this.getUrl(url));
    }
}