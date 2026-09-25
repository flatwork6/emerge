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
  it('TC-01: User ID field is present', async () => {
    expect(await LoginPage.username.isDisplayed()).toBe(true);
    allure.addStep('✅ Verified User ID field is displayed');
  });

  it('TC-02: Password field is present', async () => {
    expect(await LoginPage.password.isDisplayed()).toBe(true);
    allure.addStep('✅ Verified Password field is displayed');
  });

  it('TC-03: TOTP/OTP/PAN field is present', async () => {
    let fields = await $$('android=new UiSelector().className("android.widget.EditText")');
    let isTotpDisplayed = fields.length >= 3 ? await fields[2].isDisplayed() : await LoginPage.totpOrOtp.isDisplayed();
    expect(isTotpDisplayed).toBe(true);
    allure.addStep('✅ Verified TOTP/OTP/PAN field is displayed');
  });

  it('TC-05: LOGIN button is disabled by default', async () => {
    // Clear fields to guarantee clean state if app was not restarted
    let fields = await $$('android=new UiSelector().className("android.widget.EditText")');
    for (let field of fields) {
        if (await field.isDisplayed()) {
            await field.clearValue();
        }
    }
    expect(await LoginPage.loginButton.isEnabled()).toBe(false);
    allure.addStep('✅ Verified LOGIN button is disabled by default');
  });

  it('TC-06: LOGIN button stays disabled after entering only User ID', async () => {
    await LoginPage.enterUserName(process.env.USER_ID);
    allure.addStep('Entered User ID');
    expect(await LoginPage.loginButton.isEnabled()).toBe(false);
    allure.addStep('✅ Verified LOGIN button remains disabled after entering only User ID');
  });

  it('TC-07: LOGIN button stays disabled after entering User ID and Password', async () => {
    await LoginPage.enterPassword(process.env.PASSWORD);
    allure.addStep('Entered Password');
    expect(await LoginPage.loginButton.isEnabled()).toBe(false);
    allure.addStep('✅ Verified LOGIN button remains disabled after entering User ID and Password');
  });

  it('TC-08: LOGIN button becomes enabled only after all three fields are filled', async () => {
    await LoginPage.enterTotp('000000'); // Invalid TOTP initially
    allure.addStep('Entered TOTP');
    expect(await LoginPage.loginButton.isEnabled()).toBe(true);
    allure.addStep('✅ Verified LOGIN button becomes enabled after filling all fields');
  });

  it('TC-10a: Wrong TOTP shows "Invalid totp" error', async () => {
    allure.addStep('Fill correct username/password, wrong TOTP');
    await LoginPage.enterUserName(process.env.USER_ID);
    await LoginPage.enterPassword(process.env.PASSWORD);
    await LoginPage.enterTotp('000000');
    await LoginPage.clickLogin();
    allure.addStep('Clicked LOGIN with incorrect TOTP');
    const errorMsg = await $('//android.view.View[contains(@content-desc, "OTP") or contains(@text, "OTP") or contains(@content-desc, "otp") or contains(@text, "otp")]');
    await errorMsg.waitForDisplayed({ timeout: 10000 });
    expect(await errorMsg.isDisplayed()).toBe(true);
    allure.addStep('✅ Verified "Invalid totp" error message is displayed');
    await driver.pause(2000); // Wait for error to dismiss
  });

  it('TC-10b: Wrong password shows "invalid password" error', async () => {
    allure.addStep('Fill correct username/TOTP, wrong password');
    await LoginPage.enterUserName(process.env.USER_ID);
    await LoginPage.enterPassword('wrongpass');
    await LoginPage.enterTotp(process.env.TOTP);
    await LoginPage.clickLogin();
    allure.addStep('Clicked LOGIN with incorrect password');
    const errorMsg = await $('//android.view.View[contains(@content-desc, "assword") or contains(@text, "assword")]');
    await errorMsg.waitForDisplayed({ timeout: 10000 });
    expect(await errorMsg.isDisplayed()).toBe(true);
    allure.addStep('✅ Verified "invalid password" error message is displayed');
    await driver.pause(2000); // Wait for error to dismiss
  });

  it('TC-10c: Wrong username shows "Invalid input : Invalid user" error', async () => {
    allure.addStep('Fill correct password/TOTP, wrong username');
    await LoginPage.enterUserName('wronguser');
    await LoginPage.enterPassword(process.env.PASSWORD);
    await LoginPage.enterTotp(process.env.TOTP);
    await LoginPage.clickLogin();
    allure.addStep('Clicked LOGIN with incorrect username');
    const errorMsg = await $('//android.view.View[contains(@content-desc, "nvalid user") or contains(@text, "nvalid user") or contains(@content-desc, "nvalid User") or contains(@text, "nvalid User")]');
    await errorMsg.waitForDisplayed({ timeout: 10000 });
    expect(await errorMsg.isDisplayed()).toBe(true);
    allure.addStep('✅ Verified "Invalid input : Invalid user" error message is displayed');
    await driver.pause(2000); // Wait for error to dismiss
  });

  it('TC-09 & TC-04: Valid credentials log in and navigate to the Dashboard', async () => {
    // Restore correct username for successful login
    await LoginPage.enterUserName(process.env.USER_ID);
    await LoginPage.clickLogin();
    allure.addStep('Clicked LOGIN with valid credentials');

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

    // TC-04: Biometric is shown if its enabled
    expect(await SetBiometric.userChoice.isDisplayed()).toBe(true);

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
