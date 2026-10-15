import validator from "validator";

export const validatePassword = (password) =>
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

export const validate = (email, password, name, role, address) => {
    if (typeof name !== "string" || name.trim().length < 20 || name.trim().length > 60) {
        return { message: "Name should be between 20 and 60 characters long." };
    }
    if (typeof address !== "string" || !address.trim() || address.trim().length > 400) {
        return { message: "Address is required and must be 400 characters or fewer." };
    }
    if (!validatePassword(password)) {
        return {
            message: "Password must be 8-16 characters and include an uppercase letter and a special character."
        };
    }
    if (typeof email !== "string" || !validator.isEmail(email)) {
        return { message: "Invalid email format." };
    }
    if (!["System Administrator", "Normal User", "Store Owner"].includes(role)) {
        return { message: "Invalid role." };
    }

    return { message: "Validation passed.", status: "OK" };
};
