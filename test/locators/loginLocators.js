import commonLocators from './commonLocators.js';

const loginLocators = {
    useAnotherAccountBtn: '~Use Another Account',
    username: 'android=new UiSelector().className("android.widget.EditText").instance(0)',
    password: 'android=new UiSelector().className("android.widget.EditText").instance(1)',
    totpOrOtp: 'android=new UiSelector().className("android.widget.EditText").instance(2)',
    loginButton: '~LOGIN',
    getOtp: '~Get OTP',
    forgotPassword: 'Forgot Password?',
    openAccount: 'Open account',
    continueBtn: 'android=new UiSelector().description("Continue Anyway")',
    allowButton: 'android=new UiSelector().text("Allow")',
    biometricUserChoice: '~Cancel',
    acceptRiskDisclosureBtn: '~Accept',
    accLOGOUT: '~LOGOUT',
    accLogout: '~Logout',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in loginLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default loginLocators;
