<template>
  <form>
    <fieldset disabled>
      <div class="form-group row" v-for="(output, key, index) in outputs">
        <label :id="key + 'Label'" class="col-sm-2 col-form-label" :for="key + 'Input'">{{ output.description }}</label>
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
    taxableIncome() {
      return this.inputs.employmentIncome.value - this.employmentIncomeDeduction;
    },
    incomeTax() {
      var oCurrRule,
        iCurrLowerLimit = 0,
        fTax = 0.0;
      
      for (var i=0; i<this.rules.orderedIncomeTaxRules.length; i++) {
        oCurrRule = this.rules.orderedIncomeTaxRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (oCurrRule.upperLimit < this.taxableIncome) {
          fTax += (oCurrRule.upperLimit - iCurrLowerLimit) * oCurrRule.rate;
          
          iCurrLowerLimit = oCurrRule.upperLimit;
        } else {
          fTax += (this.taxableIncome - iCurrLowerLimit) * oCurrRule.rate;
          
          break;
        }
      }
      
      return fTax;
    },
    restorationIncomeSurtax() {
      return this.incomeTax * this.rules.restorationIncomeSurtaxRate;
    },
    prefecturalTax() {
      return this.taxableIncome * this.rules.prefecturalTaxRate.proportional + this.rules.prefecturalTaxRate.fixed;
    },
    municipalTax() {
      return this.taxableIncome * this.rules.municipalTaxRate.proportional + this.rules.municipalTaxRate.fixed;
    },
    totalTaxes() {
      return this.incomeTax + this.restorationIncomeSurtax + this.prefecturalTax + this.municipalTax;
    },
    netIncome() {
      return this.inputs.employmentIncome.value - this.totalTaxes;
    },
    outputs() {
      return {
        employmentIncomeDeduction: {
          description: "Employment income deduction",
          value: this.employmentIncomeDeduction
        },
        taxableIncome: {
          description: "Taxable income",
          value: this.taxableIncome
        },
        incomeTax: {
          description: "Income tax",
          value: this.incomeTax
        },
        restorationIncomeSurtax: {
          description: "Restoration income surtax",
          value: this.restorationIncomeSurtax
        },
        prefecturalTax: {
          description: "Prefectural tax",
          value: this.prefecturalTax
        },
        municipalTax: {
          description: "Municipal tax",
          value: this.municipalTax
        },
        totalTaxes: {
          description: "Total taxes",
          value: this.totalTaxes
        },
        netIncome: {
          description: "Net income",
          value: this.netIncome
        }
      };
    }
  }
};
</script>