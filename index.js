import Vue from 'vue';
import App from './App.vue';

// Official Japan Government sources: https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html
new Vue({
  el: '#app',
  template: '<App :inputs="inputs" :rules="rules"/>',
  components: {
    App
  },
  data: function() {
    return {
      inputs: {
        employmentIncome: {
          description: "Employment income",
          placeholder: "Gross income",
          value: 6500000
        }
      },
      rules: {
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
  }
});