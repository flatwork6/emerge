import { remote } from 'webdriverio';

(async () => {
    const browser = await remote({
        path: '/',
        port: 4723,
        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2',
        }
    });

    const source = await browser.getPageSource();
    console.log(source);
    await browser.deleteSession();
})();
