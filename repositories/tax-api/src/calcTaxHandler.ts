import { Router } from 'express';

import type { CalcIncomeTaxForSeverancePayInput } from './calcTax';
import { calcIncomeTaxForSeverancePay } from './calcTax';

const router = Router();

router.post('/calc-tax', (req, res) => {
  const incomeTax = calcIncomeTaxForSeverancePay(req.body as CalcIncomeTaxForSeverancePayInput);

  res.json({ tax: incomeTax });
});

export default router;
