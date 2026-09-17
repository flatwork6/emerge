const wdio = require('webdriverio');
const opts = {
    path: '/wd/hub',
    port: 4723,
    capabilities: {
        platformName: "Android",
        "appium:automationName": "UiAutomator2",
        "appium:noReset": true
    }
};

async function main() {
    const driver = await wdio.remote(opts);
    const elems = await driver.$$('//*');
    for (const elem of elems) {
        const desc = await elem.getAttribute("content-desc").catch(() => "");
        const textAttr = await elem.getText().catch(() => "");
        const combined = (desc || "") + " " + (textAttr || "");
        if (combined.trim().length > 0) {
            console.log("FOUND TEXT:", combined.replace(/\n/g, "\\n"));
        }
    }
    await driver.deleteSession();
}
main();
