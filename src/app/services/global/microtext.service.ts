import { Injectable } from "@angular/core";

export class InputFieldValidation {
    isFieldValid: Function;
    errMsg: string;
    fieldId: string;
    inputId: string;
}

declare let $: any;

@Injectable()
export class MicrotextService {

    validation(validations: Array<InputFieldValidation>, obj: any, regexp?: any): boolean {
        let regexpPatterns = {};
        // Convert strings to regex patterns in case regex was sent.
        if (regexp) {
            Object.keys(regexp).forEach((key: string) => {
                regexpPatterns[key] = new RegExp(regexp[key], "i");
            });
        }

        let isValid = true;
        let checkedFieldsIds: Array<any> = [];

        // Running on all validation functions.
        for (let i = 0; i < validations.length; i++) {
            // In case the field was not invalid before.
            if (!checkedFieldsIds.includes(validations[i].fieldId)) {
                // In case the field is not valid.
                if (!validations[i].isFieldValid(obj, regexpPatterns)) {
                    // Focus field in case it is the first invalid field.
                    if (isValid) {
                        $("#" + validations[i].inputId).focus();
                    }

                    isValid = false;

                    // Push the field id to the array,
                    // so in the next validation of this field it will not be checked.
                    checkedFieldsIds.push(validations[i].fieldId);

                    // Show the microtext of the field. 
                    $("#" + validations[i].fieldId).html(validations[i].errMsg);
                }
                else {
                    // Clear the microtext of the field.
                    $("#" + validations[i].fieldId).html('');
                }
            }
        }

        checkedFieldsIds = [];

        return isValid;
    }

    // Hide microtext in a specific field.
    showMicrotext(fieldId: string, text: string) {
        $("#" + fieldId).html(text);
    }

    // Hide microtext in a specific field.
    hideMicrotext(fieldId: string) {
        this.showMicrotext(fieldId, '');
    }

}