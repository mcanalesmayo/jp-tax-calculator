// Official Japan Government sources: https://www.jetro.go.jp/en/invest/setting_up/section3/page7.html
var app = new Vue({
  el: '#app',
  data: {
    employmentIncome: 6500000,
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
    ]
  },
  computed: {
    employmentIncomeDeduction: function() {
      var oCurrRule;
        
      for (var i=0; i<this.orderedDeductionRules.length; i++) {
        oCurrRule = this.orderedDeductionRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (this.employmentIncome <= oCurrRule.upperLimit) {
          return this.employmentIncome * oCurrRule.deduction.proportional + oCurrRule.deduction.fixed;
        }
      }
    },
    taxableIncome: function() {
      return this.employmentIncome - this.employmentIncomeDeduction;
    },
    incomeTax: function() {
      var oCurrRule,
        iCurrLowerLimit = 0,
        fTax = 0.0;
      
      for (var i=0; i<this.orderedIncomeTaxRules.length; i++) {
        oCurrRule = this.orderedIncomeTaxRules[i];
        
        // Assuming there's at least an upperLimit Infinity rule
        if (oCurrRule.upperLimit < this.taxableIncome) {
          fTax += (oCurrRule.upperLimit - iCurrLowerLimit)*oCurrRule.rate;
          
          iCurrLowerLimit = oCurrRule.upperLimit;
        } else {
          fTax += (this.taxableIncome - iCurrLowerLimit)*oCurrRule.rate;
          
          break;
        }
      }
      
      return fTax;
    }
  }
});
