export enum UserRegexp {
    name = "^([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,}([ ]+([א-ת]{1}[-'`]{0,1}[א-ת]{1,}[-'`]{0,1}[א-ת]{0,}){1,})*$",
    email = "^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$"
}

export enum PasswordRegexp {
    hash = "^[a-z0-9]{128}$" // For reset password by link hash.
}