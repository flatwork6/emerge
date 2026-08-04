import LoginPage from '../pageobjects/login.page.js'


describe('Emerge Login', () => {

    it('should login successfully', async () => {

       await LoginPage.enterPassword("Shwetha@123")

       await LoginPage.enterTotp("2003")

       await LoginPage.clickLogin()

       console.log("Login button clicked")
    })

})