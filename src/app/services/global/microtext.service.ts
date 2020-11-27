import { Injectable } from "@angular/core";

export class InputFieldValidation {
    isFieldValid: Function;
    errMsg: string;
    fieldId: string;
    inputId: string;
}

declare const $: any;

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

        let isFoundInvalidField = true;
        let checkedFieldsIds = {};

        validations.forEach(validation => {
            // In case the field was not invalid before.
            if (!checkedFieldsIds[validation.fieldId]) {
                // In case the field is not valid.
                if (!validation.isFieldValid(obj, regexpPatterns)) {
                    // In case it is the first invalid field.
                    if (isFoundInvalidField) {
                        $("#" + validation.inputId).focus();
                    }

                    isFoundInvalidField = false;

                    // Mark field as checked once.
                    checkedFieldsIds[validation.fieldId] = true;

                    // Show the microtext of the field.
                    this.showMicrotext(validation.fieldId, validation.errMsg);
                }
                else {
                    // Clear the microtext of the field.
                    this.hideMicrotext(validation.fieldId);
                }
            }
        });

        return isFoundInvalidField;
    }

    restartAll(validations: Array<InputFieldValidation>) {
        let checkedFieldsIds = {};

        validations.forEach(validation => {
            const fieldId = validation.fieldId;

            if (!checkedFieldsIds[fieldId]) {
                this.hideMicrotext(fieldId);
                checkedFieldsIds[fieldId] = true;
            }
        });
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