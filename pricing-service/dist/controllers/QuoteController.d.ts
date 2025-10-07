import { Request, Response } from 'express';
export declare class QuoteController {
    private quoteService;
    constructor();
    calculateQuote(req: Request, res: Response): Promise<void>;
    getQuote(req: Request, res: Response): Promise<void>;
    private isProductEnabled;
}
//# sourceMappingURL=QuoteController.d.ts.map