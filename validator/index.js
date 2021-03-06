exports.userSignupValidator = (req, res, next) => {
    req.check("name", "Name is required").notEmpty()
        .isLength({ min: 3 })
        .withMessage("Name must be more than 3 characters long");
    req
        .check("email", "Email must be between 8 to 32 characters")
        .matches(/.+\@.+\..+/)
        .withMessage("Email must contain @")
        .isLength({
            min: 8,
            max: 32,
        });
    req.check("password", "Password is required").notEmpty();
    req
        .check("password")
        .isLength({ min: 6 })
        .withMessage("Password must contain at least 6 characters")
        .matches(/\d/)
        .withMessage("Password must contain a number");
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((error) => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next(); //Anytime you have a middleware you need to have next
};