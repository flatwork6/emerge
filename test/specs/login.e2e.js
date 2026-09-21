import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import allure from '@wdio/allure-reporter'
import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import RiskDisclosure from '../pageobjects/riskDisclosure.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


describe('Emerge Login & Segment Guard Validation', () => {
  it('should login successfully', async () => {

    // await LoginPage.securityWarning();

    // await LoginPage.getNotification();

    // await LoginPage.clickUseAnotherAccount()

    await LoginPage.enterUserName(process.env.USER_ID)

    await LoginPage.enterPassword(process.env.PASSWORD)

    await LoginPage.enterTotp(process.env.TOTP)

    await LoginPage.clickLogin()

    // Wait dynamically for either Biometric Screen OR Risk Disclosure popup
    const detected = await driver.waitUntil(async () => {
      const hasBiometric = await SetBiometric.userChoice.isExisting() && await SetBiometric.userChoice.isDisplayed();
      if (hasBiometric) return 'biometric';

      const hasRisk = await RiskDisclosure.acceptRiskDisclosureBtn.isExisting() && await RiskDisclosure.acceptRiskDisclosureBtn.isDisplayed();
      if (hasRisk) return 'risk';

      return false;
    }, {
      timeout: 120000,
      timeoutMsg: 'Neither Biometric screen nor Risk Disclosure appeared within 2 minutes'
    });

    if (detected === 'risk') {
      await RiskDisclosure.acceptRiskDisclosureBtn.click();
      console.log("Risk Disclosure accepted.");

      // Now wait for Biometric screen to appear after accepting risk
      await SetBiometric.userChoice.waitForDisplayed({
        timeout: 120000,
        timeoutMsg: 'Biometric screen did not appear after Risk Disclosure within 2 minutes'
      });
    }

    await SetBiometric.chooseUserChoice();

    console.log("Login successful! Navigating to profile...")

  })
})

describe('Trading previliges validation', () => {
  it('should extract trading previliges successfully', async () => {
    // Extract Trading Privileges from UI
    await ProfilePage.openTradingPrivileges()
    await ProfilePage.extractActiveSegments()

    // Load test data dynamically from testData.csv
    const orderTestData = testDataHelper.getOrderTestData()
    console.log(`Loaded ${orderTestData.length} scrip records from testData.csv`)

    for (const testCase of orderTestData) {
      const { segment, symbol } = testCase
      const isEnabled = segmentGuard.isSegmentEnabled(segment)
      const logMsg = `[DYNAMIC CHECK]: Scrip '${symbol}' on Segment '${segment}' | UI Status: ${isEnabled ? 'ACTIVE/ENABLED' : 'INACTIVE/DISABLED'}`
      console.log(`\n--- ${logMsg} ---`)

      try {
        segmentGuard.assertCanPlaceOrder(segment, symbol)
        const allowedMsg = `✅ [ORDER ALLOWED]: Order placement allowed for '${symbol}' on segment '${segment}'.`
        console.log(allowedMsg)
        allure.addStep(allowedMsg)
      } catch (err) {
        const restrictedMsg = `🛑 [ORDER RESTRICTED]: Order placement blocked for '${symbol}' on segment '${segment}' - Account privilege disabled.`
        console.log(restrictedMsg)
        allure.addStep(restrictedMsg)
      }
    }

    await ProfilePage.clickProfileBackButton()

    await ProfilePage.clickAccountsAndServicesCrossButton()

  })
})
