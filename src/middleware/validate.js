const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            res.status(400).json({ errors });
            return;
        }

        next();
    };
};

module.exports = validate;