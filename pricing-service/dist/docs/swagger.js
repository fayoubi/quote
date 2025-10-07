import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Product Insurance Pricing Service API',
            version: '1.0.0',
            description: `
        A comprehensive microservice for insurance product pricing calculations.

        **Features:**
        - Term Life Insurance pricing (MVP)
        - Multi-product architecture ready for Whole Life, Annuities
        - Risk assessment and underwriting flags
        - Redis caching for performance
        - Prometheus metrics integration
        - Feature flag management

        **Getting Started:**
        1. Use \`POST /api/v1/quotes/calculate\` to generate quotes
        2. Check \`GET /api/v1/products\` for available products
        3. Monitor service health with \`GET /api/v1/health\`
      `,
            contact: {
                name: 'Pricing Service Team',
                email: 'pricing@company.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.company.com',
                description: 'Production server'
            }
        ],
        tags: [
            {
                name: 'Quotes',
                description: 'Quote calculation and retrieval operations'
            },
            {
                name: 'Products',
                description: 'Product configuration and discovery'
            },
            {
                name: 'Health',
                description: 'Service health monitoring'
            },
            {
                name: 'Metrics',
                description: 'Prometheus metrics endpoint'
            }
        ],
        components: {
            schemas: {
                UniversalQuoteRequest: {
                    type: 'object',
                    required: ['productType', 'applicant', 'policy'],
                    properties: {
                        productType: {
                            type: 'string',
                            enum: ['term_life', 'whole_life', 'annuity'],
                            description: 'Type of insurance product',
                            example: 'term_life'
                        },
                        applicant: {
                            $ref: '#/components/schemas/Applicant'
                        },
                        policy: {
                            $ref: '#/components/schemas/Policy'
                        }
                    }
                },
                Applicant: {
                    type: 'object',
                    required: ['gender', 'birthDate', 'height', 'weight', 'city', 'usesNicotine'],
                    properties: {
                        gender: {
                            type: 'string',
                            enum: ['Male', 'Female'],
                            description: 'Applicant gender',
                            example: 'Male'
                        },
                        birthDate: {
                            type: 'string',
                            format: 'date',
                            pattern: '\\d{4}-\\d{2}-\\d{2}',
                            description: 'Birth date in YYYY-MM-DD format',
                            example: '1985-03-15'
                        },
                        height: {
                            type: 'number',
                            minimum: 120,
                            maximum: 250,
                            description: 'Height in centimeters',
                            example: 180
                        },
                        weight: {
                            type: 'number',
                            minimum: 35,
                            maximum: 200,
                            description: 'Weight in kilograms',
                            example: 75
                        },
                        city: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 100,
                            description: 'City of residence',
                            example: 'Casablanca'
                        },
                        usesNicotine: {
                            type: 'boolean',
                            description: 'Whether the applicant uses nicotine products',
                            example: false
                        }
                    }
                },
                Policy: {
                    type: 'object',
                    required: ['termLength', 'coverageAmount'],
                    properties: {
                        termLength: {
                            type: 'number',
                            enum: [10, 20],
                            description: 'Term length in years (Term Life only)',
                            example: 20
                        },
                        coverageAmount: {
                            type: 'number',
                            minimum: 250000,
                            maximum: 1500000,
                            multipleOf: 1000,
                            description: 'Coverage amount in dollars',
                            example: 500000
                        }
                    }
                },
                QuoteResponse: {
                    type: 'object',
                    properties: {
                        quote: {
                            type: 'object',
                            properties: {
                                quoteId: {
                                    type: 'string',
                                    description: 'Unique quote identifier',
                                    example: 'quote_term_1234567890_abc123'
                                },
                                productType: {
                                    type: 'string',
                                    description: 'Product type for this quote',
                                    example: 'term_life'
                                },
                                pricing: {
                                    $ref: '#/components/schemas/PricingResult'
                                },
                                riskAssessment: {
                                    $ref: '#/components/schemas/RiskAssessment'
                                },
                                eligibilityFlags: {
                                    $ref: '#/components/schemas/EligibilityFlags'
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Quote creation timestamp'
                                },
                                expiresAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Quote expiration timestamp'
                                }
                            }
                        }
                    }
                },
                PricingResult: {
                    type: 'object',
                    properties: {
                        monthlyPremium: {
                            type: 'number',
                            description: 'Monthly premium amount',
                            example: 46.41
                        },
                        annualPremium: {
                            type: 'number',
                            description: 'Annual premium amount',
                            example: 556.92
                        }
                    }
                },
                RiskAssessment: {
                    type: 'object',
                    properties: {
                        riskClass: {
                            type: 'string',
                            enum: [
                                'SuperPreferredPlus',
                                'SuperPreferred',
                                'PreferredPlus',
                                'Preferred',
                                'StandardPlus',
                                'Standard',
                                'Substandard',
                                'Uninsurable'
                            ],
                            description: 'Assigned risk class',
                            example: 'SuperPreferredPlus'
                        },
                        bmi: {
                            type: 'number',
                            description: 'Calculated BMI',
                            example: 23.1
                        },
                        age: {
                            type: 'number',
                            description: 'Calculated age',
                            example: 39
                        },
                        riskFactors: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of identified risk factors',
                            example: []
                        }
                    }
                },
                EligibilityFlags: {
                    type: 'object',
                    properties: {
                        wouldDeclinePostUnderwriting: {
                            type: 'boolean',
                            description: 'Whether the application would be declined after underwriting',
                            example: false
                        },
                        requiresAdditionalUnderwriting: {
                            type: 'boolean',
                            description: 'Whether additional underwriting is required',
                            example: false
                        },
                        declineReasons: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Reasons for potential decline (if applicable)',
                            example: []
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        product_type: {
                            type: 'string',
                            description: 'Product type identifier',
                            example: 'term_life'
                        },
                        display_name: {
                            type: 'string',
                            description: 'Human-readable product name',
                            example: 'Term Life Insurance'
                        },
                        configuration: {
                            type: 'object',
                            description: 'Product-specific configuration',
                            example: {
                                terms: [10, 20],
                                min_coverage: 250000,
                                max_coverage: 1500000
                            }
                        },
                        is_active: {
                            type: 'boolean',
                            description: 'Whether the product is currently active',
                            example: true
                        }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'degraded', 'unhealthy'],
                            example: 'healthy'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Service uptime in seconds'
                        },
                        version: {
                            type: 'string',
                            example: '1.0.0'
                        },
                        environment: {
                            type: 'string',
                            example: 'production'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type or message'
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error description'
                        },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: {
                                        type: 'string'
                                    },
                                    message: {
                                        type: 'string'
                                    }
                                }
                            },
                            description: 'Validation error details'
                        }
                    }
                }
            },
            responses: {
                BadRequest: {
                    description: 'Bad request - validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Validation failed',
                                details: [
                                    {
                                        field: 'applicant.birthDate',
                                        message: 'Birth date is required'
                                    }
                                ]
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                TooManyRequests: {
                    description: 'Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        paths: {
            '/': {
                get: {
                    summary: 'Service information',
                    description: 'Get basic service information and status',
                    responses: {
                        '200': {
                            description: 'Service information',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            service: { type: 'string' },
                                            version: { type: 'string' },
                                            environment: { type: 'string' },
                                            timestamp: { type: 'string' },
                                            features: { type: 'array', items: { type: 'string' } },
                                            documentation: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/quotes/calculate': {
                post: {
                    tags: ['Quotes'],
                    summary: 'Calculate insurance quote',
                    description: `
            Calculate an insurance quote based on applicant information and policy requirements.

            **Rate Limiting:** 100 requests per 15-minute window per IP

            **Response Time:** Typically < 500ms

            **Business Rules:**
            - Quotes expire after 720 hours (30 days)
            - Volume discounts: 5% at $500K+, 10% at $1M+
            - Female rates typically 10-15% lower
            - Nicotine penalty: 50-100% rate increase
          `,
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UniversalQuoteRequest'
                                },
                                examples: {
                                    healthyMale: {
                                        summary: 'Healthy male applicant',
                                        value: {
                                            productType: 'term_life',
                                            applicant: {
                                                gender: 'Male',
                                                birthDate: '1985-03-15',
                                                height: 180,
                                                weight: 75,
                                                city: 'Casablanca',
                                                usesNicotine: false
                                            },
                                            policy: {
                                                termLength: 20,
                                                coverageAmount: 500000
                                            }
                                        }
                                    },
                                    smokingFemale: {
                                        summary: 'Female smoker',
                                        value: {
                                            productType: 'term_life',
                                            applicant: {
                                                gender: 'Female',
                                                birthDate: '1990-07-22',
                                                height: 165,
                                                weight: 60,
                                                city: 'Rabat',
                                                usesNicotine: true
                                            },
                                            policy: {
                                                termLength: 10,
                                                coverageAmount: 1000000
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Quote calculated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/QuoteResponse'
                                    }
                                }
                            }
                        },
                        '400': {
                            $ref: '#/components/responses/BadRequest'
                        },
                        '429': {
                            $ref: '#/components/responses/TooManyRequests'
                        },
                        '500': {
                            $ref: '#/components/responses/InternalServerError'
                        }
                    }
                }
            },
            '/api/v1/quotes/{quoteId}': {
                get: {
                    tags: ['Quotes'],
                    summary: 'Retrieve quote by ID',
                    description: 'Get a previously calculated quote by its unique identifier',
                    parameters: [
                        {
                            name: 'quoteId',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            description: 'Unique quote identifier',
                            example: 'quote_term_1234567890_abc123'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Quote retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            quote: {
                                                $ref: '#/components/schemas/QuoteResponse/properties/quote'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '404': {
                            $ref: '#/components/responses/NotFound'
                        },
                        '410': {
                            description: 'Quote expired',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Error'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/products': {
                get: {
                    tags: ['Products'],
                    summary: 'List available products',
                    description: 'Get list of all available insurance products based on feature flags',
                    responses: {
                        '200': {
                            description: 'Products retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            products: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/Product'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/products/{productType}': {
                get: {
                    tags: ['Products'],
                    summary: 'Get product configuration',
                    description: 'Get detailed configuration for a specific product type',
                    parameters: [
                        {
                            name: 'productType',
                            in: 'path',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['term_life', 'whole_life', 'annuity']
                            },
                            description: 'Product type identifier'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Product configuration retrieved',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            product: {
                                                $ref: '#/components/schemas/Product'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid product type'
                        },
                        '403': {
                            description: 'Product not available (disabled by feature flag)'
                        },
                        '404': {
                            $ref: '#/components/responses/NotFound'
                        }
                    }
                }
            },
            '/api/v1/health': {
                get: {
                    tags: ['Health'],
                    summary: 'Basic health check',
                    description: 'Quick health check endpoint for load balancers',
                    responses: {
                        '200': {
                            description: 'Service is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/HealthCheck'
                                    }
                                }
                            }
                        },
                        '503': {
                            description: 'Service unavailable'
                        }
                    }
                }
            },
            '/api/v1/health/deep': {
                get: {
                    tags: ['Health'],
                    summary: 'Deep health check',
                    description: 'Comprehensive health check including database and Redis connectivity',
                    responses: {
                        '200': {
                            description: 'All systems healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/HealthCheck' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    checks: {
                                                        type: 'object',
                                                        properties: {
                                                            database: {
                                                                type: 'object',
                                                                properties: {
                                                                    status: { type: 'string' },
                                                                    responseTime: { type: 'number' }
                                                                }
                                                            },
                                                            redis: {
                                                                type: 'object',
                                                                properties: {
                                                                    status: { type: 'string' },
                                                                    responseTime: { type: 'number' }
                                                                }
                                                            },
                                                            featureFlags: {
                                                                type: 'object',
                                                                properties: {
                                                                    status: { type: 'string' },
                                                                    enabledProducts: {
                                                                        type: 'array',
                                                                        items: { type: 'string' }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '503': {
                            description: 'One or more systems degraded'
                        }
                    }
                }
            },
            '/api/v1/metrics': {
                get: {
                    tags: ['Metrics'],
                    summary: 'Prometheus metrics',
                    description: 'Get Prometheus-formatted metrics for monitoring',
                    responses: {
                        '200': {
                            description: 'Metrics data',
                            content: {
                                'text/plain': {
                                    schema: {
                                        type: 'string'
                                    },
                                    example: `# HELP pricing_service_quotes_generated_total Total number of quotes generated
# TYPE pricing_service_quotes_generated_total counter
pricing_service_quotes_generated_total{product_type="term_life",risk_class="SuperPreferredPlus",status="success"} 42`
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.ts']
};
export default swaggerJsdoc(options);
//# sourceMappingURL=swagger.js.map