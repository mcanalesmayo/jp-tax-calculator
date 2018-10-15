<template>
  <div id="app">
    <div class="row">
      <div class="col-sm-4">
        <Field v-for="(field, key, index) in employmentInfo" :key="key" :field-data="field" :field-name="key" />
        <Field v-for="(field, key, index) in taxes" :key="key" :field-data="field" :field-name="key" />
        <Field v-for="(field, key, index) in insurances" :key="key" :field-data="field" :field-name="key" />
      </div>
    </div>
    <div class="row">
      <div class="col-sm-4">
        <Field v-for="(field, key, index) in results" :key="key" :field-data="field" :field-name="key" />
      </div>
    </div>
  </div>
</template>

<script>
import Field from './components/Field.vue';

export default {
  components: {
    Field
  },
  data() {
    return {
      employmentInfo: {
        employmentIncome: {
          title: "Yearly income",
          description: "Salary",
          placeholder: "Gross income",
          value: 6500000,
          type: 'in'
        }
      },
      rules: {
        nationalEmploymentIncomeDeduction: 380e3,
        localEmploymentIncomeDeduction: 330e3,

        orderedDeductionRules: [
          {
            upperLimit: 1.625e6,
            deduction: {
              proportional: 0,
              fixed: 0.65e6
            }
          },
          {
            upperLimit: 1.8e6,
            deduction: {
              proportional: 0.4,
              fixed: 0
            }
          },
          {
            upperLimit: 3.6e6,
            deduction: {
              proportional: 0.3,
              fixed: 0.18e6
            }
          },
          {
            upperLimit: 6.6e6,
            deduction: {
              proportional: 0.2,
              fixed: 0.54e6
            }
          },
          {
            upperLimit: 10e6,
            deduction: {
              proportional: 0.1,
              fixed: 1.2e6
            }
          },
          {
            upperLimit: Infinity,
            deduction: {
              proportional: 0,
              fixed: 2.2e6
            }
          }
        ],
        orderedIncomeTaxRules: [
          {
            upperLimit: 1.95e6,
            rate: 0.05
          },
          {
            upperLimit: 3.3e6,
            rate: 0.1
          },
          {
            upperLimit: 6.95e6,
            rate: 0.2
          },
          {
            upperLimit: 9e6,
            rate: 0.23
          },
          {
            upperLimit: 18e6,
            rate: 0.33
          },
          {
            upperLimit: 40e6,
            rate: 0.4
          },
          {
            upperLimit: Infinity,
            rate: 0.45
          }
        ],
        restorationIncomeSurtaxRate: 2.1e-2,

        healthInsurance: 4.95e-2,
        welfarePension: 9.15e-2,
        laborInsurance: 0.6e-2,

        prefecturalTaxRate: {
          proportional: 4e-2,
          fixed: 1.5e3
        },
        municipalTaxRate: {
          proportional: 6e-2,
          fixed: 3.5e3
        }
      }
    };
  },
  computed: {
    employmentIncomeDeduction() {
      var oCurrRule,
        iEmploymentIncome = this.employmentInfo.employmentIncome.value;

      for (var i=0; i<this.rules.orderedDeductionRules.length; i++) {
        oCurrRule = this.rules.orderedDeductionRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (iEmploymentIncome <= oCurrRule.upperLimit) {
          return iEmploymentIncome * oCurrRule.deduction.proportional + oCurrRule.deduction.fixed;
        }
      }
    },

    nationalTaxableIncome() {
      return this.employmentInfo.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.nationalEmploymentIncomeDeduction);
    },
    localTaxableIncome() {
      return this.employmentInfo.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.localEmploymentIncomeDeduction);
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
      return this.employmentInfo.employmentIncome.value * this.rules.healthInsurance;
    },
    welfarePension() {
      return this.employmentInfo.employmentIncome.value * this.rules.welfarePension;
    },
    socialInsurance() {
      return this.healthInsurance + this.welfarePension;
    },
    laborInsurance() {
      return this.employmentInfo.employmentIncome.value * this.rules.laborInsurance;
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
      return this.employmentInfo.employmentIncome.value - this.totalPay;
    },

    taxes() {
      return {
        nationalTaxableIncome: {
          title: "National taxable income",
          description: "Salary minus Employment income deductions",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.nationalTaxableIncome,
          type: 'out'
        },
        incomeTax: {
          title: "Income tax",
          description: "Portion of the Salary that is taxable",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.incomeTax,
          type: 'out'
        },
        restorationIncomeSurtax: {
          title: "Restoration income surtax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.restorationIncomeSurtax,
          type: 'out'
        },
        localTaxableIncome: {
          title: "Local taxable income",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.localTaxableIncome,
          type: 'out'
        },
        prefecturalTax: {
          title: "Prefectural tax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.prefecturalTax,
          type: 'out'
        },
        municipalTax: {
          title: "Municipal tax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.municipalTax,
          type: 'out'
        }
      };
    },
    insurances() {
      return {
        healthInsurance: {
          title: "Health insurance",
          description: "4.95% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.healthInsurance,
          type: 'out'
        },
        welfarePension: {
          title: "Welfare pension",
          description: "9.15% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.welfarePension,
          type: 'out'
        },
        socialInsurance: {
          title: "Social insurance",
          description: "Sum of Health insurance + Welfare pension",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.socialInsurance,
          type: 'out'
        },
        laborInsurance: {
          title: "Labor insurance",
          description: "0.6% of the Salary",
          references: [
            "https://www.pwc.com/jp/en/tax-services/assets/pdf/starting_operation_in_japan_2018.pdf",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Other-taxes"
          ],
          value: this.laborInsurance,
          type: 'out'
        }
      };
    },
    results() {
      return {
        total: {
          title: "Tax and insurance liability",
          value: this.totalPay,
          type: 'out'
        },
        netIncome: {
          title: "Net income",
          value: this.netIncome,
          type: 'out'
        }
      };
    }
  }
};
</script>

<style lang="scss">
$fa-font-path: "node_modules/font-awesome/fonts";

@import 'node_modules/bootstrap/scss/bootstrap.scss';
@import 'node_modules/font-awesome/scss/font-awesome.scss';
</style>