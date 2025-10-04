# Test Data Generator - Manual Commands

**Use these commands in Telegram to generate test data for chart testing**

---

## Quick Test Data Set (5 expenses)

Copy and paste these messages one by one:

```
I spent 150 on groceries
```

```
I spent 50 on coffee
```

```
I spent 200 on electricity bill
```

```
I spent 80 on taxi
```

```
I spent 120 on restaurant
```

**Expected Categories:**
- Food: 170 EGP (coffee + restaurant)
- Shopping: 150 EGP (groceries)
- Bills: 200 EGP (electricity)
- Transportation: 80 EGP (taxi)

**Total:** 600 EGP

---

## Comprehensive Test Data (15 expenses)

### Food & Dining
```
I spent 50 on coffee at starbucks
```
```
I spent 120 on lunch at restaurant
```
```
I spent 200 on groceries at supermarket
```
```
I spent 30 on breakfast
```

### Transportation
```
I spent 80 on taxi to work
```
```
I spent 150 on uber rides
```
```
I spent 300 on gas for car
```

### Bills & Utilities
```
I spent 250 on electricity bill
```
```
I spent 180 on internet bill
```
```
I spent 100 on phone bill
```

### Shopping
```
I spent 500 on clothes shopping
```
```
I spent 150 on shoes
```

### Entertainment
```
I spent 100 on cinema tickets
```
```
I spent 200 on concert
```

### Healthcare
```
I spent 300 on doctor visit
```

**Expected Totals:**
- Food: 400 EGP
- Transportation: 530 EGP
- Bills: 530 EGP
- Shopping: 650 EGP
- Entertainment: 300 EGP
- Healthcare: 300 EGP

**Grand Total:** 2,710 EGP

---

## Income Test Data

```
I received salary 5000
```

```
I received bonus 1000
```

**Expected Balance:** 5000 + 1000 - 2710 = 3,290 EGP

---

## Arabic Test Data

### مصروفات (Expenses)
```
صرفت 50 على القهوة
```

```
صرفت 100 على البقالة
```

```
صرفت 200 على فاتورة الكهرباء
```

```
صرفت 80 على التاكسي
```

### دخل (Income)
```
استلمت راتب 3000
```

---

## Edge Cases Test Data

### Very Small Amount
```
I spent 1 on candy
```

### Very Large Amount
```
I spent 10000 on laptop
```

### Decimal Amount
```
I spent 50.50 on coffee
```

### Multiple Items
```
I spent 100 on coffee and snacks
```

### Unclear Description
```
I spent 50 on stuff
```

### Long Description
```
I spent 75 on a really nice coffee from that new cafe downtown that everyone has been talking about
```

---

## Chart Testing Scenarios

### Scenario 1: Balanced Distribution
- 5 categories, ~20% each
- Use: Quick Test Data Set above

### Scenario 2: One Dominant Category
```
I spent 1000 on rent
I spent 50 on coffee
I spent 30 on snacks
I spent 20 on water
```
Expected: Rent dominates at ~90%

### Scenario 3: Many Small Transactions
```
I spent 10 on coffee
I spent 15 on snack
I spent 12 on water
I spent 8 on candy
I spent 20 on juice
I spent 18 on tea
I spent 25 on sandwich
I spent 14 on chips
```
Expected: Many small slices in pie chart

### Scenario 4: Weekly Trend
Day 1:
```
I spent 50 on breakfast
I spent 100 on lunch
```

Day 2:
```
I spent 60 on breakfast
I spent 120 on lunch
```

Day 3:
```
I spent 55 on breakfast
I spent 110 on lunch
```

Expected: Line chart shows daily variation

---

## Verification Commands

After adding test data, verify with:

```
/balance
```
Check: Total balance matches expected

```
/chart
```
Check: Pie chart shows correct distribution

Click "📊 Bar Chart"
Check: Bar chart shows daily breakdown

Click "📈 Line Chart"
Check: Line chart shows spending trend

---

## Clean Up Test Data

**Note:** Currently no delete function implemented.
To clean up:
1. Go to Convex Dashboard
2. Navigate to Data tab
3. Select `transactions` table
4. Manually delete test transactions
5. Update account balances accordingly

---

## Expected Chart Outputs

### Pie Chart
- Shows category breakdown
- Percentages add up to 100%
- Colors are distinct
- Labels are readable

### Bar Chart
- Shows daily expenses
- Bars are proportional
- X-axis shows dates
- Y-axis shows amounts

### Line Chart
- Shows spending trend
- Line connects daily totals
- Smooth curve
- Clear trend visible

---

*Use this guide to systematically test all chart features*
