import { Injectable } from "@angular/core";
@Injectable()
export class DateService {
    public days: Array<string> = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    public months: Array<string> = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    public shortMonths: Array<string> = ["ינו'", "פבר'", "מרץ", "אפר'", "מאי", "יוני", "יול'", "אוג'", "ספט'", "אוק'", "נוב'", "דצמ'"];

    getDateDetailsString(localDate: Date, currDate: Date, isShortMonths?: boolean) {
        currDate.setHours(23, 59, 59, 999);

        let timeDiff = Math.abs(currDate.getTime() - localDate.getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        let datesDaysDiff = Math.abs(currDate.getDay() - localDate.getDay());

        let dateDetailsString: string = '';

        if (diffDays <= 7) {
            if (diffDays <= 2) {
                if (currDate.getDate() == localDate.getDate()) {
                    dateDetailsString = "היום";
                }
                else if (Math.min((7 - datesDaysDiff), datesDaysDiff) <= 1) {
                    dateDetailsString = "אתמול";
                }
                else {
                    dateDetailsString = this.days[localDate.getDay()];
                }
            }
            else {
                dateDetailsString = this.days[localDate.getDay()];
            }
        }
        else {
            // In case of the same year or different years but for the first half of year.
            if (localDate.getFullYear() == currDate.getFullYear() || diffDays < (365 / 2)) {
                let monthString = isShortMonths ? this.shortMonths[localDate.getMonth()] : this.months[localDate.getMonth()];
                dateDetailsString = (localDate.getDate()) + " ב" + monthString;
            }
            else {
                dateDetailsString = (localDate.getDate()) + "/" + (localDate.getMonth() + 1) + "/" + localDate.getFullYear();
            }
        }

        return dateDetailsString;
    }
}