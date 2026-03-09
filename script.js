const billList = document.getElementById('billList');
const addBillBtn = document.getElementById('addBillBtn');
const billRowTemplate = document.getElementById('billRowTemplate');

const paycheckAmount = document.getElementById('paycheckAmount');
const payFrequency = document.getElementById('payFrequency');
const extraMonthlyIncome = document.getElementById('extraMonthlyIncome');
const yearlySavingsGoal = document.getElementById('yearlySavingsGoal');

const monthlyBillsTotal = document.getElementById('monthlyBillsTotal');
const monthlyIncomeResult = document.getElementById('monthlyIncomeResult');
const yearlyIncomeResult = document.getElementById('yearlyIncomeResult');
const yearlyBillsResult = document.getElementById('yearlyBillsResult');
const leftAfterBillsMonthly = document.getElementById('leftAfterBillsMonthly');
const leftAfterBillsYearly = document.getElementById('leftAfterBillsYearly');
const yearEndBudget = document.getElementById('yearEndBudget');

function currency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

function toNumber(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
}

function setResult(el, value) {
  el.textContent = currency(value);
  el.classList.remove('positive', 'negative');
  if (value > 0) el.classList.add('positive');
  if (value < 0) el.classList.add('negative');
}

function getMonthlyBills() {
  const amounts = [...billList.querySelectorAll('.bill-amount')].map(input => toNumber(input.value));
  return amounts.reduce((sum, amount) => sum + amount, 0);
}

function calculateBudget() {
  const paycheck = toNumber(paycheckAmount.value);
  const checksPerYear = toNumber(payFrequency.value);
  const extraIncome = toNumber(extraMonthlyIncome.value);
  const savingsGoal = toNumber(yearlySavingsGoal.value);
  const monthlyBills = getMonthlyBills();

  const yearlyIncome = (paycheck * checksPerYear) + (extraIncome * 12);
  const monthlyIncome = yearlyIncome / 12;
  const yearlyBills = monthlyBills * 12;
  const monthlyLeft = monthlyIncome - monthlyBills;
  const yearlyLeft = yearlyIncome - yearlyBills;
  const finalYearBudget = yearlyLeft - savingsGoal;

  monthlyBillsTotal.textContent = currency(monthlyBills);
  setResult(monthlyIncomeResult, monthlyIncome);
  setResult(yearlyIncomeResult, yearlyIncome);
  setResult(yearlyBillsResult, yearlyBills);
  setResult(leftAfterBillsMonthly, monthlyLeft);
  setResult(leftAfterBillsYearly, yearlyLeft);
  setResult(yearEndBudget, finalYearBudget);

  saveState();
}

function createBillRow(name = '', amount = '') {
  const fragment = billRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.bill-row');
  const nameInput = row.querySelector('.bill-name');
  const amountInput = row.querySelector('.bill-amount');
  const removeBtn = row.querySelector('.remove-bill');

  nameInput.value = name;
  amountInput.value = amount;

  nameInput.addEventListener('input', calculateBudget);
  amountInput.addEventListener('input', calculateBudget);
  removeBtn.addEventListener('click', () => {
    row.remove();
    calculateBudget();
  });

  billList.appendChild(row);
}

function saveState() {
  const state = {
    paycheckAmount: paycheckAmount.value,
    payFrequency: payFrequency.value,
    extraMonthlyIncome: extraMonthlyIncome.value,
    yearlySavingsGoal: yearlySavingsGoal.value,
    bills: [...billList.querySelectorAll('.bill-row')].map(row => ({
      name: row.querySelector('.bill-name').value,
      amount: row.querySelector('.bill-amount').value
    }))
  };
  localStorage.setItem('budgetPaycheckPlanner', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('budgetPaycheckPlanner');
  if (!saved) {
    createBillRow('Rent / Mortgage', '1450');
    createBillRow('Car Payment', '430');
    createBillRow('Electric', '160');
    createBillRow('Internet', '90');
    return;
  }

  const state = JSON.parse(saved);
  paycheckAmount.value = state.paycheckAmount || '';
  payFrequency.value = state.payFrequency || '26';
  extraMonthlyIncome.value = state.extraMonthlyIncome || '';
  yearlySavingsGoal.value = state.yearlySavingsGoal || '';

  if (Array.isArray(state.bills) && state.bills.length) {
    state.bills.forEach(bill => createBillRow(bill.name, bill.amount));
  } else {
    createBillRow();
  }
}

addBillBtn.addEventListener('click', () => {
  createBillRow();
  calculateBudget();
});

[paycheckAmount, payFrequency, extraMonthlyIncome, yearlySavingsGoal].forEach(el => {
  el.addEventListener('input', calculateBudget);
  el.addEventListener('change', calculateBudget);
});

loadState();
calculateBudget();
