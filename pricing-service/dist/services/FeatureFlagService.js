import { ProductType } from '../models/types.js';
import config from '../config/index.js';
export class FeatureFlagService {
    constructor() {
        this.flags = new Map();
        this.initializeFlags();
    }
    initializeFlags() {
        this.flags.set('term_life', {
            name: 'term_life',
            enabled: config.features.enableTermLife,
            description: 'Term Life Insurance product',
        });
        this.flags.set('whole_life', {
            name: 'whole_life',
            enabled: config.features.enableWholeLife,
            description: 'Whole Life Insurance product',
            dependencies: ['term_life']
        });
        this.flags.set('annuities', {
            name: 'annuities',
            enabled: config.features.enableAnnuities,
            description: 'Annuity products',
        });
        this.flags.set('advanced_underwriting', {
            name: 'advanced_underwriting',
            enabled: process.env.ENABLE_ADVANCED_UNDERWRITING === 'true',
            description: 'Advanced underwriting rules and risk assessment',
        });
        this.flags.set('rate_table_caching', {
            name: 'rate_table_caching',
            enabled: process.env.ENABLE_RATE_TABLE_CACHING !== 'false',
            description: 'Cache rate tables in Redis for performance',
        });
        this.flags.set('quote_caching', {
            name: 'quote_caching',
            enabled: process.env.ENABLE_QUOTE_CACHING !== 'false',
            description: 'Cache quotes in Redis for faster retrieval',
        });
        this.flags.set('detailed_logging', {
            name: 'detailed_logging',
            enabled: process.env.ENABLE_DETAILED_LOGGING === 'true',
            description: 'Enable detailed request/response logging',
        });
        this.flags.set('metrics_collection', {
            name: 'metrics_collection',
            enabled: config.monitoring.enableMetrics,
            description: 'Collect and expose Prometheus metrics',
        });
    }
    isEnabled(flagName) {
        const flag = this.flags.get(flagName);
        if (!flag) {
            console.warn(`Feature flag '${flagName}' not found`);
            return false;
        }
        if (flag.dependencies) {
            for (const dependency of flag.dependencies) {
                if (!this.isEnabled(dependency)) {
                    console.warn(`Feature flag '${flagName}' disabled due to missing dependency: ${dependency}`);
                    return false;
                }
            }
        }
        return flag.enabled;
    }
    isProductEnabled(productType) {
        return this.isEnabled(productType);
    }
    getEnabledProducts() {
        const enabledProducts = [];
        for (const productType of Object.values(ProductType)) {
            if (this.isEnabled(productType)) {
                enabledProducts.push(productType);
            }
        }
        return enabledProducts;
    }
    getAllFlags() {
        return Array.from(this.flags.values());
    }
    getFlag(flagName) {
        return this.flags.get(flagName);
    }
    updateFlag(flagName, enabled) {
        const flag = this.flags.get(flagName);
        if (!flag) {
            return false;
        }
        flag.enabled = enabled;
        console.log(`Feature flag '${flagName}' ${enabled ? 'enabled' : 'disabled'}`);
        return true;
    }
    validateConfiguration() {
        const errors = [];
        const enabledProducts = this.getEnabledProducts();
        if (enabledProducts.length === 0) {
            errors.push('At least one product must be enabled');
        }
        for (const flag of this.flags.values()) {
            if (flag.enabled && flag.dependencies) {
                for (const dependency of flag.dependencies) {
                    if (!this.isEnabled(dependency)) {
                        errors.push(`Feature '${flag.name}' is enabled but dependency '${dependency}' is disabled`);
                    }
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
export const featureFlagService = new FeatureFlagService();
//# sourceMappingURL=FeatureFlagService.js.map