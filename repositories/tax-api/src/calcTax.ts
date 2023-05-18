type CalcRetirementIncomeDeductionInput = {
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

type CalcTaxableRetirementIncomeInput = {
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
