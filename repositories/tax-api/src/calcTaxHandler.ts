import { Router } from 'express';

import { CalcIncomeTaxForSeverancePayInput, calcSeverancePayTaxInputSchema } from './calcTax';
import { calcIncomeTaxForSeverancePay } from './calcTax';

const router = Router();

router.post('/calc-tax', (req, res) => {
  const validationResult = calcSeverancePayTaxInputSchema.safeParse(req.body);

  if (!validationResult.success) {
    res.status(400).json({ message: 'Invalid parameter.' });
    return;
  }

  const incomeTax = calcIncomeTaxForSeverancePay(req.body as CalcIncomeTaxForSeverancePayInput);
  res.json({ tax: incomeTax });
});

export default router;
