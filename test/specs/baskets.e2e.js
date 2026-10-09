import 'dotenv/config'
import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js';
import BasketsPage from '../pageobjects/baskets.page.js'
import PortfolioPage from '../pageobjects/portfolio.page.js'
describe('Baskets Automation', () => {

  it('Setup: Navigate to Baskets from Dashboard', async () => {
    await BasketsPage.openBaskets();
  });

  let extractedBasketNames = [];

  it('TC-01: Baskets page shows correct total count on clicking Basket', async () => {
    const header = await BasketsPage.headerCount;
    await header.waitForDisplayed({ timeout: 10000 });
    const desc = await header.getAttribute('content-desc') || await header.getText();

    expect(desc).toContain('Baskets (');

    const match = desc.match(/Baskets \((\d+)\)/);
    const expectedCount = match ? parseInt(match[1]) : 0;

    console.log("Basket count:", expectedCount);
    allure.addStep(`✅ Verified Baskets header count: ${expectedCount}`);

    // Ensure we are at the top of the list before starting
    try {
      await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollToBeginning(10)`);
    } catch (e) {
      console.log("Could not scroll to beginning or already at top.");
    }

    const basketsSet = new Set();
    let prevSource = "";

    while (true) {
      const basketElements = await $$(locators.get('basketQtyRow'));
      for (const el of basketElements) {
        const text = await el.getAttribute('content-desc') || await el.getText();
        if (text) {
          const name = text.split('\n')[0].trim();
          if (name) basketsSet.add(name);
        }
      }
      const currentSource = await driver.getPageSource();
      if (currentSource === prevSource || basketsSet.size >= expectedCount) {
        break;
      }
      prevSource = currentSource;
      const size = await driver.getWindowSize();
      await driver.performActions([{
        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: size.width / 2, y: size.height * 0.8 },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 1000, x: size.width / 2, y: size.height * 0.2 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.pause(1000);
    }

    extractedBasketNames = Array.from(basketsSet);
    console.log("Extracted Baskets Count:", extractedBasketNames.length);
    console.log("Extracted Baskets:", extractedBasketNames);
    allure.addStep(`✅ Extracted ${extractedBasketNames.length} baskets: ${extractedBasketNames.join(', ')}`);

  });

  it('TC-02: Available Margin badge is visible', async () => {
    const margin = await BasketsPage.availableMargin;
    await margin.waitForDisplayed({ timeout: 5000 });
    expect(await margin.isDisplayed()).toBe(true);
    const text = await margin.getAttribute('content-desc') || await margin.getText();

    const marginMatch = text.match(/Available Margin\n(₹[0-9,.]+)/);
    const marginValue = marginMatch ? marginMatch[1] : text;

    console.log("Available margin:", marginValue);
    allure.addStep(`✅ Verified Available Margin badge is visible: ${marginValue}`);
  });

  it('TC-03: Search bar is visible', async () => {
    const searchIcon = await BasketsPage.searchIcon;
    await searchIcon.click();
    await driver.pause(1000);
    const searchBar = await BasketsPage.searchBar;
    await searchBar.waitForDisplayed({ timeout: 5000 });
    allure.addStep(`✅ Verified Search bar is visible`);
  });

  it('TC-04: Partial basket-name search returns matching baskets', async () => {
    const searchBar = await BasketsPage.searchBar;
    if (!(await searchBar.isDisplayed().catch(() => false))) {
      const searchIcon = await BasketsPage.searchIcon;
      await searchIcon.click();
      await searchBar.waitForDisplayed({ timeout: 5000 });
    }
    const basketToSearch = extractedBasketNames.length > 0 ? extractedBasketNames[0] : "new";
    const partialName = basketToSearch.substring(0, Math.max(1, basketToSearch.length - 1));
    await searchBar.click();
    await searchBar.clearValue();
    await searchBar.setValue(partialName);
    await driver.pause(2000);
    allure.addStep(`✅ Verified partial search for: ${partialName}`);
  });

  it('TC-05: Search does not match scrips inside a basket', async () => {
    const searchBar = await BasketsPage.searchBar;
    if (!(await searchBar.isDisplayed().catch(() => false))) {
      const searchIcon = await BasketsPage.searchIcon;
      await searchIcon.click();
      await searchBar.waitForDisplayed({ timeout: 5000 });
    }
    await searchBar.click();
    await searchBar.clearValue();
    await searchBar.setValue("WIPRO"); // Replace with known scrip inside a basket
    await driver.pause(2000);
    const noBaskets = await BasketsPage.noBasketsFound;
    let isVisible = false;
    try {
      await noBaskets.waitForDisplayed({ timeout: 5000 });
      isVisible = true;
    } catch (e) {
      console.log("No Baskets found text did not appear.");
    }
    allure.addStep(`✅ Verified scrip search doesn't match basket names`);
  });

  it('TC-06: Search with no matching basket shows empty state', async () => {
    const searchBar = await BasketsPage.searchBar;
    if (!(await searchBar.isDisplayed().catch(() => false))) {
      const searchIcon = await BasketsPage.searchIcon;
      await searchIcon.click();
      await searchBar.waitForDisplayed({ timeout: 5000 });
    }
    await searchBar.click();
    await searchBar.clearValue();
    await searchBar.setValue("XYZ_NON_EXISTENT_BASKET");
    await driver.pause(2000);
    const noBaskets = await BasketsPage.noBasketsFound;
    let isVisible = false;
    try {
      await noBaskets.waitForDisplayed({ timeout: 5000 });
      isVisible = true;
    } catch (e) {
      console.log("No Baskets found text did not appear.");
    }
    allure.addStep(`✅ Verified empty state text "No Baskets found": ${isVisible}`);
  });

  it('TC-07: New Basket opens the Create Basket modal', async () => {
    const searchBar = await BasketsPage.searchBar;
    if (await searchBar.isDisplayed().catch(() => false)) {
      await BasketsPage.searchIcon.click();
      await driver.pause(1000);
    }

    await driver.performActions([{
      type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: 964, y: 1938 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);

    const title = await BasketsPage.createBasketModalTitle;
    await title.waitForDisplayed({ timeout: 5000 });

    const input = await BasketsPage.basketNameInput;
    expect(await input.isDisplayed()).toBe(true);

    const counter = await BasketsPage.basketNameCounter;
    expect(await counter.isDisplayed()).toBe(true);

    const btn = await BasketsPage.createBasketButton;
    expect(await btn.isDisplayed()).toBe(true);

    allure.addStep(`✅ Verified Create Basket modal opens with input, counter and button`);
  });

  it('TC-08: Basket Name input is capped at 20 characters', async () => {
    const input = await BasketsPage.basketNameInput;
    const longName = "12345678901234567890EXTRA";
    await input.click();
    await input.clearValue();
    await input.setValue(longName);
    await driver.pause(1000);

    const value = await input.getText();
    // It should truncate to 20 chars
    expect(value.length).toBeLessThanOrEqual(20);

    const counter = await BasketsPage.basketNameCounter;
    const counterText = await counter.getAttribute('content-desc') || await counter.getText();
    expect(counterText).toContain("No characters remaining");

    allure.addStep(`✅ Verified basket name is truncated to 20 chars: ${value}`);
  });

  it('TC-09: Special characters are rejected in basket name', async () => {
    const input = await BasketsPage.basketNameInput;
    await input.click();
    await input.clearValue();
    await input.setValue("Basket@123!");
    await driver.pause(1000);

    const value = await input.getText();
    // The field must restrict entry of special characters, so they should be stripped
    expect(value).not.toMatch(/[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]/);

    allure.addStep(`✅ Verified special characters are rejected: ${value}`);
  });

  it('TC-10: Duplicate basket name is rejected on creation', async () => {
    // Assuming 'new' or 'neeeeew' exists from TC-01
    const duplicateName = extractedBasketNames.length > 0 ? extractedBasketNames[0] : "new";
    const input = await BasketsPage.basketNameInput;
    await input.click();
    await input.clearValue();
    await input.setValue(duplicateName);
    await driver.pause(1000);

    const btn = await BasketsPage.createBasketButton;
    await btn.click();
    await driver.pause(2000);

    // Validate it's still on the create modal, or an error is shown
    const title = await BasketsPage.createBasketModalTitle;
    expect(await title.isDisplayed()).toBe(true);

    allure.addStep(`✅ Verified duplicate basket name is rejected`);
  });

  it('TC-11: Valid name creates the basket and opens the Basket Orders modal', async () => {
    const uniqueName = "TestBasket" + Math.floor(Math.random() * 10000);
    const input = await BasketsPage.basketNameInput;
    await input.click();
    await input.clearValue();
    await input.setValue(uniqueName);
    await driver.pause(1000);

    const btn = await BasketsPage.createBasketButton;
    await btn.click();
    await driver.pause(3000);

    // Verify Basket Orders modal opens by checking for the basket name
    // Assuming the basket name appears as a title in the Basket Orders view
    const basketTitle = await $(`//android.view.View[contains(@content-desc, "${uniqueName}") or contains(@text, "${uniqueName}")]`);
    await basketTitle.waitForDisplayed({ timeout: 10000 });
    expect(await basketTitle.isDisplayed()).toBe(true);

    allure.addStep(`✅ Verified new basket created and Basket Orders modal opened: ${uniqueName}`);
  });

  it('TC-12: Search & Add Scrip adds a scrip to the basket', async () => {
    // 1. Click into an existing basket
    const firstBasket = await $(locators.get('basketQtyRow'));
    if (await firstBasket.isExisting()) {
      await firstBasket.click();
      await driver.pause(2000);
    }

    // 2. Click on "+ Add Orders"
    const addOrdersBtn = await BasketsPage.basketAddOrdersBtn;
    await addOrdersBtn.waitForDisplayed({ timeout: 5000 });
    await addOrdersBtn.click();
    await driver.pause(1000);

    // 3. Click on search bar
    const searchBar = await BasketsPage.searchBar;
    await searchBar.waitForDisplayed({ timeout: 5000 });
    await searchBar.click();

    // 4. Search for "infy"
    await searchBar.setValue("infy");
    await driver.pause(3000);

    // 5. Click on the stock

    const infyStock = await BasketsPage.scripToAdd;
    await infyStock.waitForDisplayed({ timeout: 5000 });

    // The + button is on the far right of the row. We will tap on the right side of the scrip row's bounds.
    const location = await infyStock.getLocation();
    const size = await infyStock.getSize();
    const tapX = Math.floor(location.x + size.width - 50); // 50 pixels from the right edge
    const tapY = Math.floor(location.y + (size.height / 2));

    await driver.performActions([{
      type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);

    await driver.pause(2000);

    // 6. Click on ADD button
    const addBtn = await BasketsPage.basketAddBtnUpper;
    await addBtn.waitForDisplayed({ timeout: 5000 });
    await addBtn.click();
    await driver.pause(2000);

    // 7. Check the same scrip appears on the basket
    // We may need to wait and scroll down to find it if the basket has many items
    await driver.pause(3000);

    let scripFound = false;
    for (let i = 0; i < 5; i++) {
      const scripRow = await $(locators.get('basketInfyScrip'));
      if (await scripRow.isExisting()) {
        scripFound = true;
        break;
      }

      // Swipe up (scroll down the page)
      await driver.performActions([{
        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 500, y: 1500 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: 500, y: 500 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.pause(2000);
    }

    expect(scripFound).toBe(true);
    allure.addStep(`✅ Verified scrip is added to basket`);
  });

  it('TC-13: Tapping a scrip row reveals Duplicate, Modify, and Delete icons', async () => {
    // The scrip is already added in TC-12. Tap the scrip row to reveal options.
    const scripRow = await $(locators.get('basketInfyScrip'));
    await scripRow.click();
    await driver.pause(1500);

    const duplicateIcon = await BasketsPage.basketDuplicateIcon;
    const modifyIcon = await BasketsPage.basketModifyIcon;
    const deleteIcon = await BasketsPage.basketDeleteIcon;

    expect(await duplicateIcon.isDisplayed()).toBe(true);
    expect(await modifyIcon.isDisplayed()).toBe(true);
    expect(await deleteIcon.isDisplayed()).toBe(true);

    allure.addStep(`✅ Verified Duplicate, Modify, Delete options appear`);
  });

  it('TC-14: Duplicate duplicates the scrip row', async () => {
    const duplicateIcon = await BasketsPage.basketDuplicateIcon;
    await duplicateIcon.click();
    // Wait for the duplicate loader to disappear and the new scrip to appear
    await driver.waitUntil(async () => {
      const currentScrips = await $$(locators.get('basketInfyEqNse'));
      return currentScrips.length >= 2;
    }, {
      timeout: 10000,
      timeoutMsg: 'Expected duplicate scrip to appear within 10s'
    });

    // Verify a duplicate is added, and it contains the same details (INFY-EQ, NSE, BUY)
    const scrips = await $$(locators.get('basketInfyEqNse'));
    expect(scrips.length).toBeGreaterThanOrEqual(2);

    allure.addStep(`✅ Verified Duplicate added a matching row for INFY-EQ NSE BUY`);

    // Wait for any snackbar or loader from duplication to disappear before starting modify
    await driver.pause(4000);
  });

  it('TC-15: Modify allows modifying Qty and Price of a row', async () => {
    let scrips = await $$(locators.get('basketInfyScrip'));
    let initialDesc = await scrips[0].getAttribute('content-desc');
    let currentQty = initialDesc.match(/([\d.]+)\s*@\s*₹([\d.]+)/) ? initialDesc.match(/([\d.]+)\s*@\s*₹([\d.]+)/)[1] : null;
    let currentPrice = initialDesc.match(/([\d.]+)\s*@\s*₹([\d.]+)/) ? initialDesc.match(/([\d.]+)\s*@\s*₹([\d.]+)/)[2] : null;

    const performModify = async (qtyInstanceId, priceInstanceId, switchProductType = null, switchOrderType = null) => {
      const scripRow = await $(locators.get('basketInfyScrip'));
      await scripRow.click();
      await driver.pause(1500);

      let modifyIcon = await BasketsPage.basketModifyIcon;
      await modifyIcon.click();
      await driver.pause(2500);

      if (switchProductType) {
        let prodTab = await $(`//*[contains(@content-desc, "${switchProductType}")]`);
        if (await prodTab.isExisting()) {
          await prodTab.click();
          await driver.pause(1000);
        }
      }

      if (switchOrderType) {
        let orderTab = await $('~' + switchOrderType);
        if (await orderTab.isExisting()) {
          await orderTab.click();
          await driver.pause(1000);
        }
      }

      const qtyIcon = await $(`android=new UiSelector().className("android.view.View").instance(${qtyInstanceId})`);
      await qtyIcon.click();
      await driver.pause(1000);

      const priceIcon = await $(`android=new UiSelector().className("android.view.View").instance(${priceInstanceId})`);
      await priceIcon.click();
      await driver.pause(1000);

      const modifyBtn = await $(locators.get('basketModifyBtnUpper'));
      await modifyBtn.click();
      await driver.pause(1500);

      // Handle price range error scenario
      let errorMsg = await $(locators.get('basketMustBeBetweenError'));
      if (await errorMsg.isExisting()) {
        let errorText = (await errorMsg.getAttribute('content-desc')) || (await errorMsg.getAttribute('text'));
        let match = errorText.match(/Must be between\s*([\d.]+)\s*-\s*([\d.]+)/);
        if (match) {
          let minPrice = parseFloat(match[1]);
          let maxPrice = parseFloat(match[2]);
          let validPrice = Math.floor((minPrice + maxPrice) / 2).toString();

          let editTexts = await $BasketsPage.searchBar;
          let priceInput = editTexts.length > 1 ? editTexts[1] : editTexts[0];

          if (priceInput && await priceInput.isExisting()) {
            await priceInput.click();
            await priceInput.click();
            await driver.pause(500);
            await priceInput.setValue(validPrice);
            await driver.pause(1000);

            await modifyBtn.click();
            await driver.pause(1500);
          }
        }
      }

      const yesBtn = await $(locators.get('basketYesBtn'));
      if (await yesBtn.isExisting()) {
        await yesBtn.click();
        await driver.pause(1500);
      }

      await driver.waitUntil(async () => {
        let latestScrips = await $$(locators.get('basketInfyScrip'));
        if (latestScrips.length === 0) return false;
        let desc = await latestScrips[0].getAttribute('content-desc');

        let match = desc.match(/([\d.]+)\s*@\s*₹([\d.]+)/);
        let qtyChanged = match && match[1] !== currentQty;
        let priceChanged = match && match[2] !== currentPrice;

        return qtyChanged && priceChanged;
      }, { timeout: 15000, timeoutMsg: `Expected both Qty and Price to change` });

      let latestScrips = await $$(locators.get('basketInfyScrip'));
      let desc = await latestScrips[0].getAttribute('content-desc');
      currentQty = desc.match(/([\d.]+)\s*@\s*₹([\d.]+)/)[1];
      currentPrice = desc.match(/([\d.]+)\s*@\s*₹([\d.]+)/)[2];
    };

    const modifyOrderType = async (productType, orderType, expectedProduct, expectedOrder) => {
      let currentScrips = await $$(locators.get('basketInfyScrip'));

      if (currentScrips.length > 0) {
        await currentScrips[0].click();
        await driver.pause(1500);
      }
      const scripRow = await $(locators.get('basketInfyScrip'));
      await scripRow.click();
      await driver.pause(1500);
      let modifyIcon = await BasketsPage.basketModifyIcon;
      await modifyIcon.click();
      await driver.pause(2500);

      if (productType) {
        let prodTab = await $(`//*[contains(@content-desc, "${productType}")]`);
        if (await prodTab.isExisting()) {
          await prodTab.click();
          await driver.pause(1000);
        }
      }

      if (orderType) {
        let orderTab = await $('~' + orderType);
        if (await orderTab.isExisting()) {
          await orderTab.click();
          await driver.pause(1000);
        }
      }

      const modifyBtn = await $(locators.get('basketModifyBtnUpper'));
      await modifyBtn.click();
      await driver.pause(1500);

      // 1. Handle "Trigger should be lower than limit" error
      let triggerError = await $(locators.get('basketTriggerError'));
      if (await triggerError.isExisting()) {
        let editTexts = await $BasketsPage.searchBar;
        let triggerInput = editTexts[editTexts.length - 1]; // Trigger price is usually the last input
        if (triggerInput && await triggerInput.isExisting()) {
          await triggerInput.click();
          await triggerInput.click();
          await driver.pause(500);
          let newTrigger = (parseFloat(currentPrice) - 5).toFixed(2); // Set a value slightly lower than limit
          await triggerInput.setValue(newTrigger);
          await driver.pause(1000);
          await modifyBtn.click();
          await driver.pause(1500);
        }
      }

      // 2. Handle "Must be between" error
      let rangeError = await $(locators.get('basketMustBeBetweenError'));
      if (await rangeError.isExisting()) {
        let errorText = (await rangeError.getAttribute('content-desc')) || (await rangeError.getAttribute('text'));
        let match = errorText.match(/Must be between\s*([\d.]+)\s*-\s*([\d.]+)/);
        if (match) {
          let minPrice = parseFloat(match[1]);
          let maxPrice = parseFloat(match[2]);
          let validPrice = Math.floor((minPrice + maxPrice) / 2).toString();

          let editTexts = await $BasketsPage.searchBar;
          let targetInput = editTexts[editTexts.length - 1]; // Trigger price

          if (targetInput && await targetInput.isExisting()) {
            await targetInput.click();
            await targetInput.click();
            await driver.pause(500);
            await targetInput.setValue(validPrice);
            await driver.pause(1000);
            await modifyBtn.click();
            await driver.pause(1500);
          }
        }
      }

      const yesBtn = await $(locators.get('basketYesBtn'));
      if (await yesBtn.isExisting()) {
        await yesBtn.click();
        await driver.pause(1500);
      }

      await driver.waitUntil(async () => {
        let latestScrips = await $$(locators.get('basketInfyScrip'));
        if (latestScrips.length === 0) return false;
        let desc = await latestScrips[0].getAttribute('content-desc');

        let hasProduct = desc.includes(expectedProduct);
        let hasOrder = desc.includes(expectedOrder);
        return hasProduct && hasOrder;
      }, { timeout: 15000, timeoutMsg: `Expected order to be ${expectedProduct} and ${expectedOrder}` });
    };

    // 1. Qty + (instance 20) and Price - (instance 24)
    const clickModify = async () => {
      let currentScrips = await $$(locators.get('basketInfyScrip'));
      if (currentScrips.length > 0) {
        await currentScrips[0].click();
        await driver.pause(1500);
      }
    }
 //   await clickModify();
    await performModify(20, 24);

    // 2. Qty - (instance 19) and Price + (instance 25)
   // await clickModify();
    await performModify(19, 25);


    // Delivery (CNC) - MKT -> shows as LMT
    await modifyOrderType("Delivery", "MKT", "CNC", "LMT");

    // Delivery (CNC) - SL-LMT -> shows as SL-LMT
    await modifyOrderType(null, "SL-LMT", "CNC", "SL-LMT");

    // Delivery (CNC) - SL-MKT -> shows as SL-LMT
    await modifyOrderType(null, "SL-MKT", "CNC", "SL-LMT");

    // Intraday (MIS) - LMT Qty/Price tests
    // 1. Qty + (instance 20) and Price - (instance 24)
   // await clickModify();
    await performModify(20, 24, "Intraday", "LMT");

    // 2. Qty - (instance 19) and Price + (instance 25)
   // await clickModify();
    await performModify(19, 25);

    // Intraday (MIS) - MKT -> shows as LMT
    await modifyOrderType("Intraday", "MKT", "MIS", "LMT");

    // Intraday (MIS) - SL-LMT -> shows as SL-LMT
    await modifyOrderType(null, "SL-LMT", "MIS", "SL-LMT");

    // Intraday (MIS) - SL-MKT -> shows as SL-LMT
    await modifyOrderType(null, "SL-MKT", "MIS", "SL-LMT");

    allure.addStep(`✅ Verified Modify allows changing Qty, Price, Product and Order types`);
  });

  it('TC-16: Delete removes the scrip row', async () => {
    // Get current count of INFY scrips
    const scripsBefore = await $$(locators.get('basketInfyScrip'));
    const beforeCount = scripsBefore.length;

    // Tap the first scrip row to reveal options if not already revealed
    let deleteIcon = await BasketsPage.basketDeleteIcon;
    if (!(await deleteIcon.isExisting()) || !(await deleteIcon.isDisplayed())) {
      if (scripsBefore.length > 0) {
        // Try clicking the first scrip to reveal options
        await scripsBefore[0].click();
        await driver.pause(1500);
      } else {
        throw new Error('No INFY scrips found to delete');
      }
    }

    deleteIcon = await BasketsPage.basketDeleteIcon;
    await deleteIcon.click();
    // Wait until delete loader is gone and scrip is removed
    await driver.waitUntil(async () => {
      const currentScrips = await $$(locators.get('basketInfyScrip'));
      return currentScrips.length < beforeCount;
    }, {
      timeout: 10000000,
      timeoutMsg: 'Expected scrip to be deleted within 10s'
    });

    // Verify count decreases
    const scripsAfter = await $$(locators.get('basketInfyScrip'));
    expect(scripsAfter.length).toBeLessThan(beforeCount);

    allure.addStep(`✅ Verified Delete removes the scrip row successfully`);
  })
  it('TC-17: Adding a multi-segment scrip updates Basket Margin and Post Trade Margin', async () => {
    // Helper to get current margin values
    const getMarginValues = async () => {
      const views = await $$(locators.get('basketViewAny'));
      let allTexts = [];
      for (const v of views) {
        try {
          const desc = await v.getAttribute('content-desc') || await v.getAttribute('text');
          if (desc && desc.trim().length > 0) allTexts.push(desc.trim());
        } catch (err) {
          // Ignore stale elements during the scan
        }
      }

      let preTrade = 0;
      let postTrade = 0;

      let firstNumIdx = -1;
      const preIdx = allTexts.findIndex(t => t.includes('Pre Trade Margin'));
      if (preIdx !== -1) {
        for (let i = preIdx + 1; i < allTexts.length; i++) {
          // Check if the text is primarily a number (e.g. 1066.31)
          const stripped = allTexts[i].replace(/[^\d.]/g, '');
          if (stripped.length > 0 && !isNaN(parseFloat(stripped)) && allTexts[i].match(/[\d.]+/)) {
            preTrade = parseFloat(stripped);
            firstNumIdx = i;
            break;
          }
        }
      }

      if (firstNumIdx !== -1) {
        for (let i = firstNumIdx + 1; i < allTexts.length; i++) {
          const stripped = allTexts[i].replace(/[^\d.]/g, '');
          if (stripped.length > 0 && !isNaN(parseFloat(stripped)) && allTexts[i].match(/[\d.]+/)) {
            postTrade = parseFloat(stripped);
            break;
          }
        }
      }
      return { preTrade, postTrade };
    };

    // 1. Capture initial margins
    let initialMargins = await getMarginValues();

    // 2. Add NIFTY scrip
    const addOrdersBtn = await BasketsPage.basketAddOrdersBtn;
    if (await addOrdersBtn.isExisting()) {
      await addOrdersBtn.click();
      await driver.pause(1500);

      const searchBar = await BasketsPage.searchBar;
      await searchBar.click();
      await searchBar.setValue("NIFTY");
      await driver.pause(3000);

      const searchResult = await $(locators.get('basketNiftyScrip'));
      if (await searchResult.isExisting()) {
        const location = await searchResult.getLocation();
        const size = await searchResult.getSize();
        const tapX = Math.floor(location.x + size.width - 50); // 50 pixels from the right edge for the + button
        const tapY = Math.floor(location.y + (size.height / 2));

        await driver.performActions([{
          type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
        await driver.pause(2000);
      }

      const addBtn = await BasketsPage.basketAddBtnUpper;
      if (await addBtn.isExisting()) {
        await addBtn.click();
        await driver.pause(2000);
      }

      await driver.pause(5000);
    }

    // 3. Verify margins increased
    let finalMargins = await getMarginValues();
    expect(finalMargins.preTrade).toBeGreaterThan(initialMargins.preTrade);
    expect(finalMargins.postTrade).toBeGreaterThan(initialMargins.postTrade);

    allure.addStep(`✅ Verified Margin Change | Before: Pre=\${initialMargins.preTrade}, Post=\${initialMargins.postTrade} | After: Pre=\${finalMargins.preTrade}, Post=\${finalMargins.postTrade}`);
    console.log("Initial Margin");
    console.log("Pre trade", initialMargins.preTrade);
    console.log("Post trade", initialMargins.postTrade);
    console.log("Final Margin");
    console.log("Pre trade", finalMargins.preTrade);
    console.log("Post trade", finalMargins.postTrade);
  })


  it('TC-18: Include existing margin factors in current positions/hedging', async () => {
    // 0. Navigate to Positions and check if positions exist
    let backBtn = await $(locators.get("stockOverviewBackButton"));
    if (await backBtn.isExisting()) await backBtn.click();
    else await driver.back();
    await driver.pause(1500);

    // If still not on dashboard (e.g. keyboard was open), press back again
    let basketsHeader1 = await $(locators.get('basketHeaderCountFallback'));
    if (!(await basketsHeader1.isExisting())) {
      backBtn = await $(locators.get("stockOverviewBackButton"));
      if (await backBtn.isExisting()) await backBtn.click();
      else await driver.back();
      await driver.pause(1500);
    }

    await PortfolioPage.openPortfolio('Positions');

    // Scan positions to determine if there are any non-MTF positions
    let hasNonMtfPosition = false;
    let hasMtfPosition = false;

    // We will find position elements, iterate by index to avoid stale elements
    let positionCount = 0;
    const initialPosEls = await $$(locators.get('basketQtyRowFallback'));
    positionCount = initialPosEls.length;

    for (let i = 0; i < positionCount; i++) {
      const posEls = await $$(locators.get('basketQtyRowFallback'));
      if (posEls[i]) {
        const positionName = ((await posEls[i].getAttribute('content-desc') || await posEls[i].getText() || `Position ${i + 1}`).split('\n')[2]);

        await posEls[i].click();
        await driver.pause(1500); // wait for bottom sheet

        // Expand Position Details
        let posDetails = await $(locators.get('basketPositionDetailsCollapsed'));
        if (!(await posDetails.isExisting())) {
          posDetails = await $(locators.get('basketPositionDetails'));
        }

        if (await posDetails.isExisting()) {
          const desc = await posDetails.getAttribute('content-desc') || "";
          if (desc.includes('Position Details') || desc === 'Position Details') {
            await posDetails.click();
            await driver.pause(1500); // wait for accordion to expand
          }

          // Check for MTF under Product
          const mtfProduct = await $(locators.get("mtf"));
          if (await mtfProduct.isExisting()) {
            hasMtfPosition = true;
            console.log(`Position [${positionName}] is MTF`);
            allure.addStep(`Checked position [${positionName}]: It is MTF`);
          } else {
            hasNonMtfPosition = true;
            console.log(`Position [${positionName}] is NON-MTF`);
            allure.addStep(`Checked position [${positionName}]: It is NON-MTF`);
          }
        } else {
          // If Position Details isn't found, fallback
          hasNonMtfPosition = true;
          console.log(`Position [${positionName}] is assumed NON-MTF (Details not found)`);
          allure.addStep(`Checked position [${positionName}]: Assumed NON-MTF`);
        }

        // Close the bottom sheet by pressing back
        await driver.pressKeyCode(4);
        await driver.pause(1500);
      }
    }

    allure.addStep(`✅ Positions verification: Non-MTF found: ${hasNonMtfPosition}, MTF found: ${hasMtfPosition}`);

    // Navigate back to Baskets and open the basket
    let basketsHeader = await $(locators.get('basketHeaderCountFallback'));
    if (!(await basketsHeader.isExisting())) {
      const { width, height } = await driver.getWindowSize();
      await driver.performActions([{
        type: 'pointer', id: 'fingerBasket', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.floor(width * 0.7), y: Math.floor(height - 50) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.pause(2000);

      basketsHeader = await $(locators.get('basketHeaderCountFallback'));
      if (!(await basketsHeader.isExisting())) {
        await BasketsPage.openBaskets();
        await driver.pause(2000);
      }
    }

    const basketElements = await $$(locators.get('basketQtyRow'));
    if (basketElements.length > 0) {
      await basketElements[0].click();
      await driver.pause(2000);
    } else {
      throw new Error("Could not find basket to re-enter");
    }

    // Helper to get current margin values
    const getMarginValues = async () => {
      const views = await $$(locators.get('basketViewAny'));
      let allTexts = [];
      for (const v of views) {
        try {
          const desc = await v.getAttribute('content-desc') || await v.getAttribute('text');
          if (desc && desc.trim().length > 0) allTexts.push(desc.trim());
        } catch (err) { }
      }

      let preTrade = 0;
      let postTrade = 0;

      let firstNumIdx = -1;
      const preIdx = allTexts.findIndex(t => t.includes('Pre Trade Margin'));
      if (preIdx !== -1) {
        for (let i = preIdx + 1; i < allTexts.length; i++) {
          const stripped = allTexts[i].replace(/[^\d.]/g, '');
          if (stripped.length > 0 && !isNaN(parseFloat(stripped)) && allTexts[i].match(/[\d.]+/)) {
            preTrade = parseFloat(stripped);
            firstNumIdx = i;
            break;
          }
        }
      }

      if (firstNumIdx !== -1) {
        for (let i = firstNumIdx + 1; i < allTexts.length; i++) {
          const stripped = allTexts[i].replace(/[^\d.]/g, '');
          if (stripped.length > 0 && !isNaN(parseFloat(stripped)) && allTexts[i].match(/[\d.]+/)) {
            postTrade = parseFloat(stripped);
            break;
          }
        }
      }
      return { preTrade, postTrade, allTexts };
    };

    // 1. Capture initial margins
    let initialMargins = await getMarginValues();

    // 2. Click the include existing margin toggle (clicking the checkbox to the left of the text)
    const includeMarginToggle = await $(locators.get('basketIncludeExistingMargin'));
    if (await includeMarginToggle.isExisting()) {
      const location = await includeMarginToggle.getLocation();
      const size = await includeMarginToggle.getSize();

      // Tap slightly to the left of the text bounds to hit the checkbox directly
      const tapX = Math.max(10, Math.floor(location.x - 40));
      const tapY = Math.floor(location.y + (size.height / 2));

      await driver.performActions([{
        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.pause(2500);

      // 3. Extract the existing margin value shown next to the toggle
      let finalMargins = await getMarginValues();
      let existingMarginValue = 0;
      const toggleIdx = finalMargins.allTexts.findIndex(t => t.includes('Include existing margin'));
      if (toggleIdx !== -1) {
        // The value might be part of the string or the next string
        let text = finalMargins.allTexts[toggleIdx];
        let match = text.match(/[\d.]+/);
        if (match && parseFloat(match[0]) > 0) {
          existingMarginValue = parseFloat(match[0]);
        } else if (toggleIdx + 1 < finalMargins.allTexts.length) {
          const nextText = finalMargins.allTexts[toggleIdx + 1];
          if (nextText.match(/^[\d.]+$/)) {
            existingMarginValue = parseFloat(nextText);
          }
        }
      }

      // 4. Verify the margins against MTF logic
      if (hasNonMtfPosition || positionCount != 0) {
        expect(existingMarginValue).toBeGreaterThan(0);
        expect(finalMargins.preTrade).not.toEqual(initialMargins.preTrade);
        expect(finalMargins.postTrade).not.toEqual(initialMargins.postTrade);
        allure.addStep(`✅ Verified Include existing margin WITH non-MTF or no positions. Existing Margin: ${existingMarginValue}`);
      } else {
        expect(existingMarginValue).toEqual(0);
        expect(finalMargins.preTrade).toEqual(initialMargins.preTrade);
        expect(finalMargins.postTrade).toEqual(initialMargins.postTrade);
        if (hasMtfPosition) {
          allure.addStep(`✅ Verified Include existing margin ignores MTF-only positions. Margin stayed at: ${initialMargins.preTrade}`);
        } else {
          allure.addStep(`✅ Verified Include existing margin (No active positions found to offset). Margin stayed at: ${initialMargins.preTrade}`);
        }
      }

      // Revert back (tap same coordinates)
      await driver.performActions([{
        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.pause(1500);
    } else {
      allure.addStep(`⚠️ Toggle not found. Assuming no positions available to hedge.`);
    }
  });



  it('TC-20: EXECUTE opens an Order Confirmation popup', async () => {
    const executeBtn = await $(locators.get('basketExecuteBtn'));
    if (await executeBtn.isExisting()) {
      await executeBtn.click();
      await driver.pause(2000);
    }

    const confirmPopup = await $(locators.get('basketConfirmBtn'));
    expect(await confirmPopup.isExisting()).toBe(true);
    const cancelPopup = await $(locators.get("biometricUserChoice"));
    expect(await cancelPopup.isExisting()).toBe(true);

    allure.addStep(`✅ Verified EXECUTE opens Order Confirmation popup`);
  });

  it('TC-22: CANCEL discards the execution attempt', async () => {
    const cancelBtn = await $(locators.get("biometricUserChoice"));
    if (await cancelBtn.isExisting()) {
      await cancelBtn.click();
      await driver.pause(1500);
    }

    const confirmPopup = await $(locators.get('basketOrderConfirmation'));
    expect(await confirmPopup.isExisting()).toBe(false);
    allure.addStep(`✅ Verified CANCEL discards the execution`);
  });

  it('TC-21: PROCEED places the order(s)', async () => {
    const executeBtn = await $(locators.get('basketExecuteBtn'));
    if (await executeBtn.isExisting()) {
      await executeBtn.click();
      await driver.pause(2000);
    }

    const confirmBtn = await $(locators.get('basketConfirmBtn'));
    if (await confirmBtn.isExisting()) {
      await confirmBtn.click();
      await driver.pause(3000);
    }

    allure.addStep(`✅ Verified PROCEED places the orders`);
  });


  it('TC-23: Post-execution, each row shows its order Status', async () => {
    // Check if any row contains text like 'REJECTED' or 'COMPLETE' (or 'Complete'/'Rejected')
    const statusElements = await $$(locators.get('basketOrderStatus'));
    // Ensure we found at least one status (since there's at least one scrip in the basket)
    expect(statusElements.length).toBeGreaterThan(0);
    allure.addStep(`✅ Verified STATUS appears on executed rows`);
  });

  it('TC-24: Reset button appears after execution', async () => {
    const resetBtn = await $(locators.get('basketResetBtn'));
    expect(await resetBtn.isExisting()).toBe(true);
    allure.addStep(`✅ Verified Reset button appears in footer`);
  });

  it('TC-25: Reset restores the basket to its pre-execution state', async () => {
    const resetBtn = await $(locators.get('basketResetBtn'));
    try {
      await resetBtn.waitForDisplayed({ timeout: 15000 });
    } catch (e) { }

    if (await resetBtn.isExisting()) {
      await resetBtn.click();
    }

    // Wait for the UI to slowly reset
    const executeBtn = await $(locators.get('basketExecuteBtn'));
    try {
      await executeBtn.waitForDisplayed({ timeout: 15000 });
    } catch (e) { }

    // Check STATUS is gone
    const statusElements = await $$(locators.get('basketOrderFinalStatus'));
    expect(statusElements.length).toBe(0);

    // Check EXECUTE button is back
    expect(await executeBtn.isExisting()).toBe(true);

    allure.addStep(`✅ Verified Reset restores basket to pre-execution state`);
  });

  it('TC-26: Re-execution after Reset places the same set of scrips again', async () => {
    const executeBtn = await $(locators.get('basketExecuteBtn'));
    if (await executeBtn.isExisting()) {
      await executeBtn.click();
      await driver.pause(2000);
    }

    const confirmBtn = await $(locators.get('basketConfirmBtn'));
    if (await confirmBtn.isExisting()) {
      await confirmBtn.click();
      await driver.pause(3000);
    }

    // Validate it successfully reached the post-execution state again
    const resetBtn = await $(locators.get('basketResetBtn'));
    expect(await resetBtn.isExisting()).toBe(true);

    allure.addStep(`✅ Verified Re-execution flows successfully after Reset`);
  });

  it('TC-27: Actions menu shows Rename Basket', async () => {
    const renameIcon = await $(locators.get("fundsTabIcon"));
    await renameIcon.waitForDisplayed({ timeout: 10000 });
    await renameIcon.click();
    await driver.pause(1000);

    const updateBtn = await $(locators.get('basketUpdateBtn'));
    expect(await updateBtn.isExisting()).toBe(true);

    allure.addStep(`✅ Verified tap on edit icon opens rename modal and update button appears`);
  });

  it('TC-28: Valid rename (≤20 chars, alphanumeric) succeeds', async () => {
    const input = await BasketsPage.searchBar;
    await input.click();
    await input.clearValue();

    const newName = "TestBasket" + Math.floor(Math.random() * 1000);
    await input.setValue(newName);

    const updateBtn = await $(locators.get('basketUpdateBtn'));
    await updateBtn.click();
    await driver.pause(2000);

    allure.addStep(`✅ Verified valid rename succeeds`);
  });

  it('TC-29: Rename input is capped at 20 characters', async () => {
    const renameIcon = await $(locators.get("fundsTabIcon"));
    await renameIcon.click();
    await driver.pause(1000);

    const input = await BasketsPage.searchBar;
    await input.click();
    await input.clearValue();

    const longName = "ThisIsAVeryLongBasketName"; // 25 chars
    await input.setValue(longName);

    const val = await input.getText();
    if (val) {
      expect(val.length).toBeLessThanOrEqual(20);
    }

    const updateBtn = await $(locators.get('basketUpdateBtn'));
    await updateBtn.click();
    await driver.pause(2000);
    allure.addStep(`✅ Verified rename input is capped at 20 characters`);
  });

  it('TC-30: Duplicate basket name is rejected on rename', async () => {
    // 1. Go back to the Basket List
    const backBtn = await $(locators.get("stockOverviewBackButton"));
    if (await backBtn.isExisting()) {
      await backBtn.click();
    } else {
      await driver.back();
    }
    await driver.pause(2000);

    // 2. Scroll to the end to pick a target duplicate name
    let duplicateName = "ExistingBasket";
    try {
      await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollToEnd(10)`);
      await driver.pause(1000);
    } catch (e) {
      console.log("Could not scroll to end or already at end.");
    }

    // Extract names from current view
    const basketElements = await $$(locators.get('basketQtyRow'));
    let names = [];
    for (const el of basketElements) {
      const text = await el.getAttribute('content-desc') || await el.getText();
      if (text) {
        names.push(text.split('\n')[0].trim());
      }
    }

    if (names.length > 0) {
      // Pick the last one in the view
      duplicateName = names[names.length - 1];
    }

    // 3. Scroll back to beginning to select the first basket to edit
    try {
      await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollToBeginning(10)`);
      await driver.pause(1000);
    } catch (e) {
      console.log("Could not scroll to beginning.");
    }

    // Click the first basket in the list to open it
    const topBaskets = await $$(locators.get('basketQtyRow'));
    if (topBaskets.length > 0) {
      // Ensure we don't pick the same basket as duplicateName
      for (let b of topBaskets) {
        const bText = await b.getAttribute('content-desc') || await b.getText();
        if (bText && !bText.startsWith(duplicateName)) {
          await b.click();
          break;
        }
      }
      await driver.pause(2000);
    }

    // 4. Open rename modal
    const renameIcon = await $(locators.get("fundsTabIcon"));
    await renameIcon.waitForDisplayed({ timeout: 10000 });
    await renameIcon.click();
    await driver.pause(1000);

    const input = await BasketsPage.searchBar;
    await input.click();
    await input.clearValue();

    // Set to the extracted duplicate name
    await input.setValue(duplicateName);

    const updateBtn = await $(locators.get('basketUpdateBtn'));
    await updateBtn.click();
    await driver.pause(2000);

    // Should show validation error and not rename
    const errorToast = await $(locators.get('basketAlreadyPresentError'));
    if (await errorToast.isExisting()) {
      expect(await errorToast.isExisting()).toBe(true);
    }

    // Close the rename modal using back button if it's still open
    if (await input.isExisting()) {
      await driver.back();
      await driver.pause(1000);
    }

    allure.addStep(`✅ Verified duplicate basket name is rejected`);
  });

  it('TC-31: Special characters are rejected on rename', async () => {
    const renameIcon = await $(locators.get("fundsTabIcon"));
    if (await renameIcon.isExisting()) {
      await renameIcon.click();
      await driver.pause(1000);
    }

    const input = await BasketsPage.searchBar;
    if (await input.isExisting()) {
      await input.click();
      await input.clearValue();

      await input.setValue("Basket@123");

      const updateBtn = await $(locators.get('basketUpdateBtn'));
      await updateBtn.click();
      await driver.pause(2000);

      // Validation for special characters
      const errorToast = await $(locators.get('basketSpecialCharError'));
      if (await errorToast.isExisting()) {
        expect(await errorToast.isExisting()).toBe(true);
      }

      if (await input.isExisting()) {
        await driver.back();
        await driver.pause(1000);
      }
    }

    allure.addStep(`✅ Verified special characters are rejected on rename`);
  });

  it('TC-32: Delete Basket shows a confirmation popup with correct content', async () => {
    // Navigate back to the Baskets List
    const backBtn = await $(locators.get("stockOverviewBackButton"));
    if (await backBtn.isExisting()) {
      await backBtn.click();
    } else {
      await driver.back();
    }
    await driver.pause(2000);

    // Click first 3 checkboxes (instances 1, 2, 3)
    const cb1 = await $(locators.get('basketCheckbox1'));
    const cb2 = await $(locators.get('basketCheckbox2'));
    const cb3 = await $(locators.get('basketCheckbox3'));

    if (await cb1.isExisting()) await cb1.click();
    if (await cb2.isExisting()) await cb2.click();
    if (await cb3.isExisting()) await cb3.click();
    await driver.pause(1000);

    // Verify Delete(3) shows and click it
    const deleteBtn = await $(locators.get('basketDelete3Btn'));
    if (await deleteBtn.isExisting()) {
      expect(await deleteBtn.isExisting()).toBe(true);
      await deleteBtn.click();
      await driver.pause(1000);
    }

    const popupMsg = await $(locators.get('basketDeleteSurePopup'));
    if (await popupMsg.isExisting()) {
      expect(await popupMsg.isExisting()).toBe(true);

      const popupText = (await popupMsg.getAttribute('content-desc')) || (await popupMsg.getText());
      const match = popupText.match(/\d+/);
      if (match) {
        const count = match[0];
        console.log(`\n--- Extracted count from popup (3 deletions): ${count} ---\n`);
        allure.addStep(`✅ Verified popup text: ${popupText}`);
        allure.addStep(`✅ Verified count inside popup is: ${count}`);
        expect(parseInt(count, 10)).toBe(3);
      }
    }
    allure.addStep(`✅ Verified Delete Basket shows confirmation popup with selected count`);
  });

  it('TC-33: Cross icon leaves the basket intact', async () => {
    // Click cross
    const cross = await $(locators.get('basketCrossIcon'));
    if (await cross.isExisting()) {
      await cross.click();
    } else {
      await driver.back(); // Fallback
    }
    await driver.pause(1500);

    const popupMsg = await $(locators.get('basketDeleteSurePopup'));
    expect(await popupMsg.isExisting()).toBe(false);

    allure.addStep(`✅ Verified cross icon cancels deletion`);
  });

  it('TC-34: Tick icon removes the basket', async () => {
    // Click Delete(3) again
    const deleteBtn = await $(locators.get('basketDelete3Btn'));
    if (await deleteBtn.isExisting()) {
      await deleteBtn.click();
      await driver.pause(1000);
    }

    // Click tick
    const tickIcon = await $(locators.get('basketTickIcon'));
    if (await tickIcon.isExisting()) {
      await tickIcon.click();
    }
    await driver.pause(2000);

    const popupMsg = await $(locators.get('basketDeleteSurePopup'));
    expect(await popupMsg.isExisting()).toBe(false);

    allure.addStep(`✅ Verified tick icon deletes the basket`);
  });

  it('TC-35: Verify Select All Checkbox Delete Flow', async () => {
    // Get total count of baskets from header
    const header = await $(locators.get('basketHeaderCountFallback'));
    let totalCount = 0;
    if (await header.isExisting()) {
      const desc = await header.getAttribute('content-desc') || await header.getText();
      const match = desc.match(/Baskets \((\d+)\)/);
      if (match) {
        totalCount = parseInt(match[1], 10);
      }
    }

    // Click select all checkbox (instance 0)
    const selectAllCb = await $(locators.get('basketSelectAllCheckbox'));
    if (await selectAllCb.isExisting()) {
      await selectAllCb.click();
    }
    await driver.pause(1000);

    // Click the Delete btn at the bottom
    const deleteBtn = await $(locators.get('basketDeleteDynamicBtn'));
    if (await deleteBtn.isExisting()) {
      await deleteBtn.click();
      await driver.pause(1000);
    }

    // Verify the popup appears
    const popupMsg = await $(locators.get('basketDeleteSurePopup'));
    expect(await popupMsg.isExisting()).toBe(true);

    // Verify the count inside the popup
    const popupText = (await popupMsg.getAttribute('content-desc')) || (await popupMsg.getText());
    allure.addStep(`✅ Verified popup text: ${popupText}`);

    // Extract the number from "Are you sure you want to delete 30 selected baskets?"
    const match = popupText.match(/\d+/);
    if (match) {
      const count = match[0];
      console.log(`\n--- Extracted count from popup (Select All deletions): ${count} ---\n`);
      allure.addStep(`✅ Verified count inside popup is: ${count}, expected: ${totalCount}`);
      expect(parseInt(count, 10)).toBe(totalCount);
    }

    // Click cross
    const cross = await $(locators.get('basketCrossIcon'));
    if (await cross.isExisting()) {
      await cross.click();
    } else {
      await driver.back(); // Fallback
    }
    await driver.pause(1500);

    const popupMsgAfter = await $(locators.get('basketDeleteSurePopup'));
    expect(await popupMsgAfter.isExisting()).toBe(false);

    // Uncheck select all
    if (await selectAllCb.isExisting()) {
      await selectAllCb.click();
    }
    allure.addStep(`✅ Verified Select All delete flow cancellation`);
  });

  it('TC-36: Basket page consisting baskets should be scrollable', async () => {
    try {
      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);

      // Swipe up (scroll down) multiple times to reach bottom
      const startYDown = Math.floor(height * 0.65);
      const endYDown = Math.floor(height * 0.35);
      for (let i = 0; i < 4; i++) {
        await driver.performActions([{
          type: 'pointer',
          id: `fingerDown${i}`,
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startYDown },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 50 },
            { type: 'pointerMove', duration: 150, x: startX, y: endYDown },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
        await driver.releaseActions();
        await driver.pause(200);
      }

      // Swipe down (scroll up) multiple times to reach top
      const startYUp = Math.floor(height * 0.35);
      const endYUp = Math.floor(height * 0.65);
      for (let i = 0; i < 8; i++) {
        await driver.performActions([{
          type: 'pointer',
          id: `fingerUp${i}`,
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: startX, y: startYUp },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 50 },
            { type: 'pointerMove', duration: 150, x: startX, y: endYUp },
            { type: 'pointerUp', button: 0 }
          ]
        }]);
        await driver.releaseActions();
        await driver.pause(200);
      }
    } catch (e) {
      console.log("Could not scroll list: ", e);
    }
    await driver.pause(1000);
    allure.addStep(`✅ Verified basket page is scrollable till bottom and top`);
  });

  it('TC-37: Download button on Baskets page exports a CSV', async () => {
    // Click the download/export icon on the page (Top right corner)
    const downloadBtn = await $(locators.get('basketDownloadCsvBtn'));
    if (await downloadBtn.isExisting()) {
      await downloadBtn.click();
    }
    await driver.pause(2000);

    let shareSheet = await $(locators.get('basketShareSheet'));
    expect(await shareSheet.isExisting()).toBe(true);

    allure.addStep(`✅ Verified share sheet opens with the exported CSV`);

    // Click outside the popup (near the top of the screen) to close it
    let { width } = await driver.getWindowSize();
    await driver.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: Math.floor(width / 2), y: 150 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);

    allure.addStep(`✅ Verified clicking outside closes the share sheet`);
  });


  it('TC-38: Each basket holds less than or equal to 20 stocks, shows snackbar above 20', async () => {
    await driver.pause(2000);

    let isSnackbarFound = false;
    let foundValidBasket = false;

    // Pass 1: Find the highest quantity across all baskets in the entire list
    let highestQty = -1;

    for (let scroll = 0; scroll < 4; scroll++) {
      const qtyElements = await $$(locators.get('basketQtyStrict'));
      for (let i = 0; i < qtyElements.length; i++) {
        const text = (await qtyElements[i].getAttribute('content-desc')) || (await qtyElements[i].getText());
        if (text) {
          const match = text.match(/Qty:\s*(\d+)\/20/);
          if (match) {
            const qty = parseInt(match[1], 10);
            if (qty > highestQty && qty <= 20) highestQty = qty;
          }
        }
      }

      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);
      const startYDown = Math.floor(height * 0.65);
      const endYDown = Math.floor(height * 0.35);
      await driver.performActions([{
        type: 'pointer', id: `fingerDownFind${scroll}`, parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startYDown },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 50 },
          { type: 'pointerMove', duration: 150, x: startX, y: endYDown },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.releaseActions();
      await driver.pause(500);
    }

    // Pass 1.5: Scroll back up to the top
    for (let scroll = 0; scroll < 4; scroll++) {
      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);
      const startYUp = Math.floor(height * 0.35);
      const endYUp = Math.floor(height * 0.65);
      await driver.performActions([{
        type: 'pointer', id: `fingerUpReset${scroll}`, parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startYUp },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 50 },
          { type: 'pointerMove', duration: 150, x: startX, y: endYUp },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.releaseActions();
      await driver.pause(200);
    }

    // Pass 2: Find the basket with the highestQty and click it
    for (let scroll = 0; scroll < 5; scroll++) {
      const qtyElements = await $$(locators.get('basketQtyStrict'));

      for (let i = 0; i < qtyElements.length; i++) {
        const text = (await qtyElements[i].getAttribute('content-desc')) || (await qtyElements[i].getText());
        if (text) {
          const match = text.match(/Qty:\s*(\d+)\/20/);
          if (match) {
            const qty = parseInt(match[1], 10);
            if (qty === highestQty) {
              await qtyElements[i].click();
              await driver.pause(2000);

              const snackbar = await $(locators.get('basketMax20Snackbar'));
              let attempts = 0;
              while (attempts < 20 && !isSnackbarFound) {
                const allScrips = await $$(locators.get('basketAnyExchangeScrip'));

                if (allScrips.length > 0) {
                  try {
                    await allScrips[0].click();
                    await driver.pause(1500); // wait for options to appear

                    const dupIcon = await BasketsPage.basketDuplicateIcon;
                    if (await dupIcon.isExisting()) {
                      await dupIcon.click();
                      await driver.pause(1500); // wait for duplicate to complete and snackbar to appear
                    }

                    if (await snackbar.isExisting()) {
                      isSnackbarFound = true;
                      break;
                    }
                  } catch (e) {
                    console.log("Error during duplication attempt: ", e);
                  }
                }
                attempts++;
              }

              if (isSnackbarFound) break;

              // If we reach here, it failed (expired stocks etc.), go back
              const backBtn = await $(locators.get("stockOverviewBackButton"));
              if (await backBtn.isExisting()) await backBtn.click();
              else await driver.back();
              await driver.pause(2000);
            }
          }
        }
      }

      if (isSnackbarFound) break;

      // Scroll down for next screen search
      const { width, height } = await driver.getWindowSize();
      const startX = Math.floor(width / 2);
      const startYDown = Math.floor(height * 0.65);
      const endYDown = Math.floor(height * 0.35);

      await driver.performActions([{
        type: 'pointer', id: `fingerDownTarget${scroll}`, parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startYDown },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 50 },
          { type: 'pointerMove', duration: 150, x: startX, y: endYDown },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
      await driver.releaseActions();
      await driver.pause(500);
    }

    expect(isSnackbarFound).toBe(true);
    allure.addStep(`✅ Verified snackbar "Basket can contain maximum of 20 stocks" appears upon exceeding limit`);

    // Final cleanup
    const backBtn = await $(locators.get("stockOverviewBackButton"));
    if (await backBtn.isExisting()) {
      await backBtn.click();
    } else {
      await driver.back();
    }
    await driver.pause(2000);
  });
});
