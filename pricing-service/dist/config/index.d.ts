export declare const config: {
    port: number;
    nodeEnv: string;
    database: {
        url: string | undefined;
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    redis: {
        url: string | undefined;
        host: string;
        port: number;
        password: string | undefined;
    };
    features: {
        enableTermLife: boolean;
        enableWholeLife: boolean;
        enableAnnuities: boolean;
    };
    app: {
        defaultProductType: string;
        quoteExpiryHours: number;
        rateTableVersionTermLife: string;
    };
    security: {
        jwtSecret: string;
        apiRateLimit: number;
    };
    monitoring: {
        enableMetrics: boolean;
        metricsPort: number;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map