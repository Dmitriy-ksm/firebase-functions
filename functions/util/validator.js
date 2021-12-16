const isEmail = (email) => {
    const regEx =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    return false;
};

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
};

const checkPropsIsEmptyWithError = (obj, errorHandler, propName) => {
    if (isEmpty(obj[propName])) {
        errorHandler[propName] = 'Must not be empty';
        return true;
    } else return false;
};

exports.validateSignupData = (data) => {
    let errors = {};

    if (!checkPropsIsEmptyWithError(data, errors, 'email')) {
        if (!isEmail(data.email)) data.email = 'Must be a valid email address';
    }

    checkPropsIsEmptyWithError(data, errors, 'password');
    if (data.confirmPassword !== data.password)
        errors.confirmPassword = 'Passwords must match';
    checkPropsIsEmptyWithError(data, errors, 'handle');

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateLoginData = (data) => {
    let errors = {};

    checkPropsIsEmptyWithError(data, errors, 'email');
    checkPropsIsEmptyWithError(data, errors, 'password');
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if (!isEmpty(data.website.trim())) {
        if (data.website.trim().substring(0, 4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
    }
    if (!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
};
