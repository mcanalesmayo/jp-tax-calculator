<template>
  <div id="app">
    <div class="row">
      <div class="col-sm-4">
        <Field v-for="(field, key, index) in employmentInfo" :key="key" :field-data="field" :field-name="key" />
        <Field v-for="(field, key, index) in taxes" :key="key" :field-data="field" :field-name="key" />
        <Field v-for="(field, key, index) in insurances" :key="key" :field-data="field" :field-name="key" />
      </div>
      <div class="col-sm-4">
        <Field v-for="(field, key, index) in housing" :key="key" :field-data="field" :field-name="key" />
      </div>
      <div class="col-sm-4">
        <Field v-for="(field, key, index) in otherExpenses" :key="key" :field-data="field" :field-name="key" />
      </div>
    </div>
    <div class="row">
      <div class="offset-4 col-sm-4">
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
          description: "Employment income (salary)",
          placeholder: "Gross income",
          value: 6500000,
          type: 'in'
        }
      },
      rules: {
        nationalTaxesDeduction: 380e3,
        localTaxesDeduction: 330e3,

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
      },
      housing: {
        monthlyFee: {
          title: 'Monthly housing fee',
          description: 'Monthly rent',
          value: 150000,
          type: 'in'
        },
        yearlyCosts: {
          title: 'Initial housing costs (yearly)',
          description: 'Additional initial costs like deposit, key money, insurance and other fees',
          value: 400000,
          type: 'in'
        }
      },
      otherExpenses: {
        dailyFood: {
          title: 'Daily food',
          value: 1500,
          type: 'in'
        },
        monthlyTransportation: {
          title: 'Monthly transportation',
          description: 'All-line Pass allows public transportation in all lines. The monthly ticket is more expensive than bigger periods (3-month or 6-month)',
          references: [
            'https://www.tokyometro.jp/lang_en/ticket/types/pass/all/index.html'
          ],
          value: 17300,
          type: 'in'
        },
        monthlyPersonalCare: {
          title: 'Personal care',
          description: 'Monthly expenses in personal care. This only includes common items for male and female, like medicine, deodorant, shampoo, etc',
          value: 10000,
          type: 'in'
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
          return this.zeroLowerLimit(iEmploymentIncome * oCurrRule.deduction.proportional + oCurrRule.deduction.fixed);
        }
      }
    },

    nationalTaxableIncome() {
      return this.zeroLowerLimit(this.employmentInfo.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.nationalTaxesDeduction));
    },
    localTaxableIncome() {
      return this.zeroLowerLimit(this.employmentInfo.employmentIncome.value - (this.employmentIncomeDeduction + this.rules.localTaxesDeduction));
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
      
      return this.zeroLowerLimit(fTax);
    },
    restorationIncomeSurtax() {
      return this.zeroLowerLimit(this.incomeTax * this.rules.restorationIncomeSurtaxRate);
    },

    healthInsurance() {
      return this.zeroLowerLimit(this.employmentInfo.employmentIncome.value * this.rules.healthInsurance);
    },
    welfarePension() {
      return this.zeroLowerLimit(this.employmentInfo.employmentIncome.value * this.rules.welfarePension);
    },
    socialInsurance() {
      return this.healthInsurance + this.welfarePension;
    },
    laborInsurance() {
      return this.zeroLowerLimit(this.employmentInfo.employmentIncome.value * this.rules.laborInsurance);
    },

    prefecturalTax() {
      return this.zeroLowerLimit(this.localTaxableIncome * this.rules.prefecturalTaxRate.proportional + this.rules.prefecturalTaxRate.fixed);
    },
    municipalTax() {
      return this.zeroLowerLimit(this.localTaxableIncome * this.rules.municipalTaxRate.proportional + this.rules.municipalTaxRate.fixed);
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
          description: "Salary minus Employment income deductions and national taxes deduction. Portion of the Salary that is taxable for national taxes.",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.nationalTaxableIncome,
          type: 'out'
        },
        incomeTax: {
          title: "Income tax",
          description: "Based on the National taxable income.",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.incomeTax,
          type: 'out'
        },
        restorationIncomeSurtax: {
          title: "Restoration income surtax",
          description: "2.1% of the Income tax",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html",
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Taxes-on-personal-income"
          ],
          value: this.restorationIncomeSurtax,
          type: 'out'
        },
        localTaxableIncome: {
          title: "Local taxable income",
          description: "Salary minus Employment income deductions and local taxes deduction. Portion of the Salary that is taxable for local taxes.",
          references: [
            "http://taxsummaries.pwc.com/ID/Japan-Individual-Deductions",
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.localTaxableIncome,
          type: 'out'
        },
        prefecturalTax: {
          title: "Prefectural tax",
          description: "6% of the Local taxable income",
          references: [
            "https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html"
          ],
          value: this.prefecturalTax,
          type: 'out'
        },
        municipalTax: {
          title: "Municipal tax",
          description: "4% of the Local taxable income",
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

    housingYearlyCosts() {
      return 12 * this.housing.monthlyFee.value + this.housing.yearlyCosts.value;
    },

    otherExpensesCosts() {
      return 365 * this.otherExpenses.dailyFood.value + 12 * this.otherExpenses.monthlyTransportation.value + 12 * this.otherExpenses.monthlyPersonalCare.value;
    },

    results() {
      return {
        totalIncomePay: {
          title: "Total tax and insurance liability",
          value: this.totalPay,
          type: 'out'
        },
        netIncome: {
          title: "Net income (after taxes and insurances)",
          value: this.netIncome,
          type: 'out'
        },
        totalHousingPay: {
          title: 'Housing costs (yearly)',
          value: this.housingYearlyCosts,
          type: 'out'
        },
        otherExpenses: {
          title: 'Other expenses',
          description: 'Costs of food, commuting, personal care, ...',
          value: this.otherExpensesCosts,
          type: 'out'
        },
        totalFreeMoney: {
          title: 'Total free money',
          description: 'After paying taxes, insurances, housing and other expenses',
          value: this.netIncome - this.housingYearlyCosts - this.otherExpensesCosts
        }
      };
    }
  },
  methods: {
    zeroLowerLimit(oNum) {
      return Math.max(0, oNum);
    }
  }
};
</script>

<style lang="scss">
$fa-font-path: "node_modules/font-awesome/fonts";

@import 'node_modules/bootstrap/scss/bootstrap.scss';
@import 'node_modules/font-awesome/scss/font-awesome.scss';
</style>