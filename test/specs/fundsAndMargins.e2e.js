import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import FundsPage from '../pageobjects/funds.page.js'


describe('Funds and Margin Validation', () => {
  it('TC-02: The margin page is scrollable', async () => {
    console.log(`\n--- Validating TC-02: Scrollability ---`)
    await FundsPage.clickFundsTab()
    await FundsPage.verifyScrollability()
  })

  it('TC-03: Available Margin hero card sums only Equity/FNO and Commodity', async () => {
    console.log(`\n--- Validating TC-03: Available Margin Sum ---`)
    await FundsPage.verifyAvailableMarginSum()
  })

  it('TC-04: Donut chart shows the correct "% Used"', async () => {
    console.log(`\n--- Validating TC-04: Donut Chart Percentage ---`)
    await FundsPage.verifyDonutChartPercentage()
  })

  it('TC-05: Total Credits and Utilized sub-values are shown correctly', async () => {
    console.log(`\n--- Validating TC-05: Sub-values match Breakdown ---`)
    await FundsPage.verifySubValuesMatchBreakdown()
  })

  it('TC-06: Peak Margin card shows the correct value', async () => {
    console.log(`\n--- Validating TC-06: Peak Margin ---`)
    await FundsPage.verifyPeakMarginSum()
  })

  it('TC-07: Expiry Margin card shows the correct value', async () => {
    console.log(`\n--- Validating TC-07: Expiry Margin ---`)
    await FundsPage.verifyExpiryMarginSum()
  })

  it('TC-08: Withdraw navigates to a separate screen', async () => {
    console.log(`\n--- Validating TC-08: Withdraw Navigation ---`)
    await FundsPage.clickWithdrawAndVerify()
  })

  it('TC-09 to TC-12 Move Fund navigates to a separate screen or bottom sheet', async () => {
    console.log(`\n--- Validating TC-09 to TC-11: Move Fund Navigation ---`)
    await FundsPage.clickMoveFundAndVerify()
  })

  it('TC-14: Add Funds navigates to a separate screen', async () => {
    console.log(`\n--- Validating TC-14: Add Funds Navigation ---`)
    await FundsPage.clickAddFundsAndVerify()
  })

  it('TC-15: Breakdown table shows the correct 3 tabs', async () => {
    console.log(`\n--- Validating TC-15: Breakdown Tabs ---`)
    await FundsPage.verifyBreakdownTabs()
  })

  it('TC-16: Equity/FNO tab will be selected and visible by default', async () => {
    console.log(`\n--- Validating TC-16: Equity/FNO Tab Selected ---`)
    await FundsPage.verifyEquityFnoTabSelected()
  })

  it('TC-17: Tapping on Commodity column navigates to Commodity', async () => {
    console.log(`\n--- Validating TC-17: Commodity Tab ---`)
    await FundsPage.verifyCommodityTabSelected()
  })

  it('TC-18: Tapping on MTF column navigates to MTF (if enabled)', async () => {
    console.log(`\n--- Validating TC-18: MTF Tab ---`)
    await FundsPage.verifyMtfTabSelected()
  })

  it('TC-19: Expand All reveals every section\'s sub-rows', async () => {
    console.log(`\n--- Validating TC-19: Expand All ---`)
    await FundsPage.clickExpandAllAndVerify()
  })

  it('TC-20: Collapse All hides every section\'s sub-rows', async () => {
    console.log(`\n--- Validating TC-20: Collapse All ---`)
    await FundsPage.clickCollapseAllAndVerify()
  })

  it('TC-21: Total Credits breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Total Credits Breakdown across tabs ---`)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("MTF", FundsPage.mtfTab)
  })

it('TC-22: Utilized value equals sum of intraday margin and deliver/cf margin', async () => {
  console.log(`\n--- Validating TC-22: Utilized Sum ---`)
  await FundsPage.verifyUtilizedSum("Equity/FNO", FundsPage.equityOrFnoTab)
  await FundsPage.verifyUtilizedSum("Commodity", FundsPage.commodityTab)
  await FundsPage.verifyUtilizedSum("MTF", FundsPage.mtfTab)
  await FundsPage.compareSum()
})

  it('TC-23: Expanding Utilization under Equity/FNO reveals TAX, Delivery Margin, Basket Margin, Realized Loss', async () => {
    console.log(`\n--- Validating TC-23: Utilization Breakdown for Equity/FNO---`)
    await FundsPage.verifyEquityOrFnoUtilizationBreakdown()
  })

  it('TC-24: Utilization equals the sum of its sub-rows, per column under Equity/FNO', async () => {
    console.log(`\n--- Validating TC-24: Utilization Sum ---`)
    await FundsPage.verifyEquityOrFnoUtilizationSum()
  })

  it('TC-25: Expanding Utilization under Commodity reveals SPAN, Exposure, Commodity Unrealized MTOM CF', async () => {
    console.log(`\n--- Validating TC-25: Utilization Breakdown ---`)
    await FundsPage.verifyCommodityUtilizationBreakdown()
  })

  it('TC-26: Utilization equals the sum of its sub-rows, per column under Commodity', async () => {
    console.log(`\n--- Validating TC-26: Utilization Sum ---`)
    await FundsPage.verifyCommodityUtilizationSum()
  })

  it('TC-27: Expanding Utilization under MTF reveals Basket Margin and Realized Loss', async () => {
    console.log(`\n--- Validating TC-27: Utilization Breakdown for MTF ---`)
    await FundsPage.verifyMtfUtilizationBreakdown()
  })

  it('TC-28: Utilization equals the sum of its sub-rows, per column under MTF', async () => {
    console.log(`\n--- Validating TC-28: Utilization Sum under MTF ---`)
    await FundsPage.verifyMtfUtilizationSum()
  })

  it('TC-29: Expanding MTOM / Margin percentage reveals Margin percentage and MToM Percentage', async () => {
    console.log(`\n--- Validating TC-29: MTOM Percentage Breakdown ---`)
    await FundsPage.verifyMtomPercentageBreakdown()
  })

  it('TC-30: Collateral breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Collateral Breakdown across tabs ---`)
    await FundsPage.verifyCollateralBreakdown("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyCollateralBreakdown("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyCollateralBreakdown("MTF", FundsPage.mtfTab)
  })

  it('TC-31: "Utilization Details" is a non-expandable section header', async () => {
    console.log(`\n--- Validating TC-31: Utilization Details Header ---`)
    await FundsPage.verifyUtilizationDetailsHeader()
  })

  it('TC-32: Normal Margin , Intraday Margin and Delivery/CF Margin rows are visible under Utilization Details', async () => {
    console.log(`\n--- Validating TC-32: Utilization Details Rows ---`)
    await FundsPage.verifyUtilizationDetailsRows()
  })

  it('TC-33: Intraday margin shows its sub-rows on clicking chevron', async () => {
    console.log(`\n--- Validating TC-33: Intraday Margin Breakdown ---`)
    await FundsPage.verifyIntradayMarginBreakdown()
  })

  it('TC-34: Sum of intraday margin subrows values equals intraday margin value', async () => {
    console.log(`\n--- Validating TC-34: Intraday Margin Sum ---`)
    await FundsPage.verifyIntradayMarginSum()
  })

  it('TC-35: Expanding Delivery/CF Margin reveals Delivery Margin and matches value', async () => {
    console.log(`\n--- Validating TC-35: Delivery/CF Margin Breakdown across tabs ---`)
    await FundsPage.verifyDeliveryCfMarginBreakdown("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyDeliveryCfMarginBreakdown("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyDeliveryCfMarginBreakdown("MTF", FundsPage.mtfTab)
  })

  it('TC-36: Normal Margin breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Normal Margin Breakdown across tabs ---`)
    await FundsPage.verifyNormalMarginBreakdownAndSum("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyNormalMarginBreakdownAndSum("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyNormalMarginBreakdownAndSum("MTF", FundsPage.mtfTab)
  })
})
