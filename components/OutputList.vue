<template>
  <form>
    <fieldset disabled>
      <div class="form-group row" v-for="(output, key, index) in outputs">
        <label :id="key + 'Label'" class="col-sm-2 col-form-label" :for="key + 'Input'">{{ output.title }}</label>
        <div class="input-group col-sm-10">
          <span class="input-group-prepend input-group-text">&yen;</span>
          <input :id="key + 'Input'" type="text" class="form-control" :aria-describedby="key + 'Label'" v-model.number="output.value">
        </div>
      </div>
    </fieldset>
  </form>
</template>

<script>
export default {
  props: [ 'inputs', 'rules' ],
  computed: {
    employmentIncomeDeduction() {
      var oCurrRule,
        iEmploymentIncome = this.inputs.employmentIncome.value;

      for (var i=0; i<this.rules.orderedDeductionRules.length; i++) {
        oCurrRule = this.rules.orderedDeductionRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (iEmploymentIncome <= oCurrRule.upperLimit) {
          return iEmploymentIncome * oCurrRule.deduction.proportional + oCurrRule.deduction.fixed;
        }
      }
    },

    nationalTaxableIncome() {
      return this.inputs.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.nationalEmploymentIncomeDeduction);
    },
    localTaxableIncome() {
      return this.inputs.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.localEmploymentIncomeDeduction);
    },

    incomeTax() {
      var oCurrRule,
        iCurrLowerLimit = 0,
        fTax = 0.0;
      
      for (var i=0; i<this.rules.orderedIncomeTaxRules.length; i++) {
        oCurrRule = this.rules.orderedIncomeTaxRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (oCurrRule.upperLimit < this.nationalTaxableIncome) {
          fTax += (oCurrRule.upperLimit - iCurrLowerLimit) * oCurrRule.rate;
          
          iCurrLowerLimit = oCurrRule.upperLimit;
        } else {
          fTax += (this.nationalTaxableIncome - iCurrLowerLimit) * oCurrRule.rate;
          
          break;
        }
      }
      
      return fTax;
    },
    restorationIncomeSurtax() {
      return this.incomeTax * this.rules.restorationIncomeSurtaxRate;
    },

    healthInsurance() {
      return this.inputs.employmentIncome.value * this.rules.healthInsurance;
    },
    welfarePension() {
      return this.inputs.employmentIncome.value * this.rules.welfarePension;
    },
    socialInsurance() {
      return this.healthInsurance + this.welfarePension;
    },
    laborInsurance() {
      return this.inputs.employmentIncome.value * this.rules.laborInsurance;
    },

    prefecturalTax() {
      return this.localTaxableIncome * this.rules.prefecturalTaxRate.proportional + this.rules.prefecturalTaxRate.fixed;
    },
    municipalTax() {
      return this.localTaxableIncome * this.rules.municipalTaxRate.proportional + this.rules.municipalTaxRate.fixed;
    },

    totalPay() {
      return this.incomeTax + this.restorationIncomeSurtax + this.prefecturalTax + this.municipalTax + this.socialInsurance + this.laborInsurance;
    },
    netIncome() {
      return this.inputs.employmentIncome.value - this.totalPay;
    },

    outputs() {
      return {
        nationalTaxableIncome: {
          title: "National taxable income",
          description: "Salary minus Employment income deductions",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.nationalTaxableIncome
        },
        incomeTax: {
          title: "Income tax",
          description: "Portion of the Salary that is taxable",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.incomeTax
        },
        restorationIncomeSurtax: {
          title: "Restoration income surtax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.restorationIncomeSurtax
        },
        localTaxableIncome: {
          title: "Local taxable income",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.localTaxableIncome
        },
        prefecturalTax: {
          title: "Prefectural tax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.prefecturalTax
        },
        municipalTax: {
          title: "Municipal tax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.municipalTax
        },
        healthInsurance: {
          title: "Health insurance",
          description: "4.95% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.healthInsurance
        },
        welfarePension: {
          title: "Welfare pension",
          description: "9.15% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.welfarePension
        },
        socialInsurance: {
          title: "Social insurance",
          description: "Sum of Health insurance + Welfare pension",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.socialInsurance
        },
        laborInsurance: {
          title: "Labor insurance",
          description: "0.6% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.laborInsurance
        },
        totalPay: {
          title: "Total pay",
          description: "Sum of all taxes and insurances",
          value: this.totalPay
        },
        netIncome: {
          title: "Net income",
          description: "Salary minus all taxes and insurances",
          value: this.netIncome
        }
      };
    }
  }
};
</script>