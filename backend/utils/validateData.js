import validator from 'validator';

export const validate = (email, password, name, role, address) => {
    if (name.length < 20 || name.length > 60)
        return ({ 'message': 'Name should be between 20 and 60 characters long.' });
    else if (address.length > 400)
        return ({ 'message': 'Address should be less than 400 characters.' });
    else if (password.length < 8 || password.length > 16)
        return ({ 'message': 'Password should be between 8 and 16 characters.' });
    else if (!validator.isEmail(email))
        return ({ 'message': 'Invalid Email Format.' });
    else if (!['System Administrator', 'Normal User', 'Store Owner'].includes(role))
        return ({ 'message': 'Invalid role.' })
    else
        return ({ 'message': 'All test passed successfully.', 'status': 'OK' })
}