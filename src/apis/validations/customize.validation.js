
// Custom password validation function
const password = (value, helpers) => {
    // Check for minimum length
    if (value.length < 8) {
        return helpers.message('Password must be at least 8 characters long');
    }

    // Check for presence of numbers
    if (!/\d/.test(value)) {
        return helpers.message('Password must contain at least one number');
    }

    // Check for presence of special characters
    if (!/[!@#$%^&*]/.test(value)) {
        return helpers.message('Password must contain at least one special character');
    }

    return value; // Return the value if it passes all checks
};

module.exports = {
    password,
};