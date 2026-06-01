// --- Individual field validators ---

const validateName = (name) => {
    if (!name || typeof name !== 'string') return 'Name is required.';
    const trimmed = name.trim();
    if (trimmed.length < 2) return 'Name must be at least 2 characters.';
    if (trimmed.length > 60) return 'Name must not exceed 60 characters.';
    return null;
};

const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return 'Email is required.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Invalid email format.';
    return null;
};

const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password.length > 16) return 'Password must not exceed 16 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return 'Password must contain at least one special character.';
    }
    return null;
};

const validateAddress = (address) => {
    if (address !== undefined && address !== null && typeof address === 'string') {
        if (address.trim().length > 400) return 'Address must not exceed 400 characters.';
    }
    return null;
};

// --- Middleware for signup (normal user registration) ---

const validateSignup = (req, res, next) => {
    const { name, email, password, address } = req.body;
    const errors = [];

    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    const passwordErr = validatePassword(password);
    if (passwordErr) errors.push(passwordErr);

    const addressErr = validateAddress(address);
    if (addressErr) errors.push(addressErr);

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

// --- Middleware for admin creating a user (any role) ---

const validateCreateUser = (req, res, next) => {
    const { name, email, password, address, role } = req.body;
    const errors = [];

    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    const passwordErr = validatePassword(password);
    if (passwordErr) errors.push(passwordErr);

    const addressErr = validateAddress(address);
    if (addressErr) errors.push(addressErr);

    const validRoles = ['admin', 'user', 'store_owner'];
    if (role && !validRoles.includes(role)) {
        errors.push('Role must be one of: admin, user, store_owner.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

// --- Middleware for creating a store ---

const validateCreateStore = (req, res, next) => {
    const { name, email, address } = req.body;
    const errors = [];

    const nameErr = validateName(name);
    if (nameErr) errors.push(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        errors.push('Store address is required.');
    } else {
        const addressErr = validateAddress(address);
        if (addressErr) errors.push(addressErr);
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
};

module.exports = {
    validateName,
    validateEmail,
    validatePassword,
    validateAddress,
    validateSignup,
    validateCreateUser,
    validateCreateStore
};
