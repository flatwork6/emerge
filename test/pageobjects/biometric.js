class SetBiometric {
    get userChoice() {
        return $('~Cancel')
    }


    async chooseUserChoice() {
        //await this.userChoice.waitForDisplayed({ timeout: 1200000 })
        await this.userChoice.click()
    }
}

export default new SetBiometric()