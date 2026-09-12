const { remote } = require('webdriverio');
const fs = require('fs');
(async () => {
    const browser = await remote({
        port: 42637,
        capabilities: {
            platformName: 'Android',
            'appium:automationName': 'UiAutomator2'
        }
    });
    // This is just to connect to the existing session if possible, but webdriverio remote creates a new session.
    // We can't easily attach to the running test session unless we know the session ID.
})();
