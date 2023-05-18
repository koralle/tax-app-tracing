import { z } from 'zod';

const calcSeverancePayTaxInputSchema = z
  .object({
    // 勤続年数
    yearsOfService: z.number().int().gte(1).lte(100),
    // 障害者となったことに直接起因して退職したか
    isDisability: z.boolean(),
    // 役員等かどうか
    isOfficer: z.boolean(),
    // 退職金
    severancePay: z.number().int().gte(0).lte(1_000_000_000_000),
  })
  .strict();

export type CalcRetirementIncomeDeductionInput = {
  // 勤続年数
  yearsOfService: number;
  // 障害者になったことに直接起因して退職したか
  isDisability: boolean;
};
export const calcRetirementIncomeDeduction = ({ yearsOfService, isDisability }: CalcRetirementIncomeDeductionInput) => {
  let deduction: number;
  if (yearsOfService === 1) {
    deduction = 800_000;
  } else if (yearsOfService <= 19) {
    deduction = 400_000 * yearsOfService;
  } else {
    deduction = 8_000_000 + 700_000 * (yearsOfService - 20);
  }

  if (isDisability) {
    deduction += 1_000_000;
  }
  return deduction;
};

export type CalcTaxableRetirementIncomeInput = {
  yearsOfService: number;
  severancePay: number;
  deduction: number;
  isOfficer: boolean;
};

export const calcTaxableRetirementIncome = ({
  yearsOfService,
  severancePay,
  deduction,
  isOfficer,
}: CalcTaxableRetirementIncomeInput) => {
  const roundDown = (val: number, nearest = 1000) => Math.floor(val / nearest) * nearest;

  if (yearsOfService >= 6) {
    return roundDown(Math.max(severancePay - deduction, 0) / 2);
  }

  if (isOfficer) {
    return roundDown(Math.max(severancePay - deduction, 0));
  }

  if (severancePay - deduction > 300_0000) {
    return 150_0000 + roundDown(severancePay - deduction - 300_0000);
  }

  return roundDown(Math.max(severancePay - deduction, 0) / 2);
};

export type CalcIncomeTaxBaseInput = {
  taxableRetirementIncome: number;
};

export const calcIncomeTaxBase = ({ taxableRetirementIncome: taxableRetirementIncome }: CalcIncomeTaxBaseInput) => {
  const roundDown = (val: number, nearest = 1000) => Math.floor(val / nearest) * nearest;

  const roundedTaxableRetirementIncome = roundDown(taxableRetirementIncome);

  if (1000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 1_949_000) {
    return roundedTaxableRetirementIncome * 0.05;
  } else if (1_950_000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 3_299_000) {
    return roundedTaxableRetirementIncome * 0.1 - 97_500;
  } else if (3_300_000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 6_949_000) {
    return roundedTaxableRetirementIncome * 0.2 - 427_500;
  } else if (6_950_000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 8_999_000) {
    return roundedTaxableRetirementIncome * 0.23 - 636_000;
  } else if (9_000_000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 17_999_000) {
    return roundedTaxableRetirementIncome * 0.33 - 1_536_000;
  } else if (18_000_000 <= roundedTaxableRetirementIncome && roundedTaxableRetirementIncome <= 39_999_000) {
    return roundedTaxableRetirementIncome * 0.4 - 2_796_000;
  } else if (roundedTaxableRetirementIncome >= 40_000_000) {
    return roundedTaxableRetirementIncome * 0.45 - 4_796_000;
  }

  return 0;
};

export type CalcTaxWithheldInput = {
  incomeTaxBase: number;
};

export const calcTaxWithheld = ({ incomeTaxBase }: CalcTaxWithheldInput) => {
  return Math.floor((incomeTaxBase * 1021) / 1000);
};

export type CalcIncomeTaxForSeverancePayInput = {
  yearsOfService: number;
  isDisability: boolean;
  isOfficer: boolean;
  severancePay: number;
};

export const calcIncomeTaxForSeverancePay = (input: CalcIncomeTaxForSeverancePayInput) => {
  let validatedInput;

  try {
    validatedInput = calcSeverancePayTaxInputSchema.parse(input);
  } catch (e) {
    throw new Error('Invalid argument.', { cause: e });
  }

  const { yearsOfService, isDisability, isOfficer, severancePay } = validatedInput;

  const retirementIncomeDeduction = calcRetirementIncomeDeduction({ yearsOfService, isDisability });

  const taxableRetirementIncome = calcTaxableRetirementIncome({
    yearsOfService,
    severancePay,
    deduction: retirementIncomeDeduction,
    isOfficer,
  });

  const incomeTaxBase = calcIncomeTaxBase({ taxableRetirementIncome });

  return calcTaxWithheld({ incomeTaxBase });
};
