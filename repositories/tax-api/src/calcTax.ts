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
