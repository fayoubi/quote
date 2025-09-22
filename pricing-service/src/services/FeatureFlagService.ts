import { ProductType } from '../models/types.js';
import config from '../config/index.js';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  dependencies?: string[];
}

export class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();

  constructor() {
    this.initializeFlags();
  }

  private initializeFlags(): void {
    // Product feature flags
    this.flags.set('term_life', {
      name: 'term_life',
      enabled: config.features.enableTermLife,
      description: 'Term Life Insurance product',
    });

    this.flags.set('whole_life', {
      name: 'whole_life',
      enabled: config.features.enableWholeLife,
      description: 'Whole Life Insurance product',
      dependencies: ['term_life'] // Whole life requires term life infrastructure
    });

    this.flags.set('annuities', {
      name: 'annuities',
      enabled: config.features.enableAnnuities,
      description: 'Annuity products',
    });

    // Feature flags for specific capabilities
    this.flags.set('advanced_underwriting', {
      name: 'advanced_underwriting',
      enabled: process.env.ENABLE_ADVANCED_UNDERWRITING === 'true',
      description: 'Advanced underwriting rules and risk assessment',
    });

    this.flags.set('rate_table_caching', {
      name: 'rate_table_caching',
      enabled: process.env.ENABLE_RATE_TABLE_CACHING !== 'false', // Default true
      description: 'Cache rate tables in Redis for performance',
    });

    this.flags.set('quote_caching', {
      name: 'quote_caching',
      enabled: process.env.ENABLE_QUOTE_CACHING !== 'false', // Default true
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

  isEnabled(flagName: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found`);
      return false;
    }

    // Check dependencies
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

  isProductEnabled(productType: ProductType): boolean {
    return this.isEnabled(productType);
  }

  getEnabledProducts(): ProductType[] {
    const enabledProducts: ProductType[] = [];

    for (const productType of Object.values(ProductType)) {
      if (this.isEnabled(productType)) {
        enabledProducts.push(productType);
      }
    }

    return enabledProducts;
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getFlag(flagName: string): FeatureFlag | undefined {
    return this.flags.get(flagName);
  }

  updateFlag(flagName: string, enabled: boolean): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      return false;
    }

    flag.enabled = enabled;
    console.log(`Feature flag '${flagName}' ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  }

  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Ensure at least one product is enabled
    const enabledProducts = this.getEnabledProducts();
    if (enabledProducts.length === 0) {
      errors.push('At least one product must be enabled');
    }

    // Validate dependencies
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

// Singleton instance
export const featureFlagService = new FeatureFlagService();