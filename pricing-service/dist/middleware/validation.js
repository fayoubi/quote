import Joi from 'joi';
import { ProductType, Gender } from '../models/types.js';
const quoteRequestSchema = Joi.object({
    productType: Joi.string()
        .valid(...Object.values(ProductType))
        .required()
        .messages({
        'any.only': 'Product type must be one of: term_life, whole_life, annuity',
        'any.required': 'Product type is required'
    }),
    applicant: Joi.object({
        gender: Joi.string()
            .valid(...Object.values(Gender))
            .required()
            .messages({
            'any.only': 'Gender must be either Male or Female',
            'any.required': 'Gender is required'
        }),
        birthDate: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .custom((value, helpers) => {
            const date = new Date(value);
            const now = new Date();
            const age = Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age < 18) {
                return helpers.error('custom.tooYoung');
            }
            if (age > 75) {
                return helpers.error('custom.tooOld');
            }
            return value;
        })
            .messages({
            'string.pattern.base': 'Birth date must be in YYYY-MM-DD format',
            'any.required': 'Birth date is required',
            'custom.tooYoung': 'Applicant must be at least 18 years old',
            'custom.tooOld': 'Applicant must be no older than 75 years'
        }),
        height: Joi.number()
            .min(120)
            .max(250)
            .required()
            .messages({
            'number.min': 'Height must be at least 120 cm',
            'number.max': 'Height must be no more than 250 cm',
            'any.required': 'Height is required'
        }),
        weight: Joi.number()
            .min(35)
            .max(200)
            .required()
            .messages({
            'number.min': 'Weight must be at least 35 kg',
            'number.max': 'Weight must be no more than 200 kg',
            'any.required': 'Weight is required'
        }),
        city: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
            'string.min': 'City must be at least 2 characters',
            'string.max': 'City must be no more than 100 characters',
            'any.required': 'City is required'
        }),
        usesNicotine: Joi.boolean()
            .required()
            .messages({
            'any.required': 'Nicotine use status is required'
        })
    }).required(),
    policy: Joi.object({
        termLength: Joi.number()
            .valid(10, 20)
            .required()
            .messages({
            'any.only': 'Term length must be either 10 or 20 years',
            'any.required': 'Term length is required'
        }),
        coverageAmount: Joi.number()
            .min(250000)
            .max(1500000)
            .multiple(1000)
            .required()
            .messages({
            'number.min': 'Coverage amount must be at least $250,000',
            'number.max': 'Coverage amount must be no more than $1,500,000',
            'number.multiple': 'Coverage amount must be in thousands',
            'any.required': 'Coverage amount is required'
        })
    }).required()
});
export const validateQuoteRequest = (req, res, next) => {
    const { error } = quoteRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const validationErrors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        res.status(400).json({
            error: 'Validation failed',
            details: validationErrors
        });
        return;
    }
    next();
};
//# sourceMappingURL=validation.js.map