
/** NOTE: EMAIL_STRING_PATTERN, no cubre todos los casos */
export const EMAIL_STRING_PATTERN = '^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$';
export const EMAIL_REGEXP_PATTERN: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const DECIMAL_REGEXP_PATTERN: RegExp = /^[0-9]*[\.]?[0-9]+$/;
export const DECIMAL_STRING_PATTERN = '[0-9]*[\.]?[0-9]+$';

export function DecimalOnlyValidation(event: any) {
    const pattern = /[0-9.]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
        return false;
    }
    return true;
}

export function NumberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
        return false;
    }
    return true;
}

export function StringOnlyValidation(event: any) {

    const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
        event.preventDefault();
    }
}



