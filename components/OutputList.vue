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
          value: this.nationalTaxableIncome
        },
        incomeTax: {
          title: "Income tax",
          value: this.incomeTax
        },
        restorationIncomeSurtax: {
          title: "Restoration income surtax",
          value: this.restorationIncomeSurtax
        },
        localTaxableIncome: {
          title: "Local taxable income",
          value: this.localTaxableIncome
        },
        prefecturalTax: {
          title: "Prefectural tax",
          value: this.prefecturalTax
        },
        municipalTax: {
          title: "Municipal tax",
          value: this.municipalTax
        },
        healthInsurance: {
          title: "Health insurance",
          value: this.healthInsurance
        },
        welfarePension: {
          title: "Welfare pension",
          value: this.welfarePension
        },
        socialInsurance: {
          title: "Social insurance (health + welfare)",
          value: this.socialInsurance
        },
        laborInsurance: {
          title: "Labor insurance",
          value: this.laborInsurance
        },
        totalPay: {
          title: "Total pay",
          value: this.totalPay
        },
        netIncome: {
          title: "Net income",
          value: this.netIncome
        }
      };
    }
  }
};
</script>