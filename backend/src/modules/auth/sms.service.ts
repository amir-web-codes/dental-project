async function sendToSmsProvider(phone: string, message: string) {
    // send
    console.log(phone)
    console.log(message)
}

async function sendSms(phone: string, otp: string) {
    const message = `
    :کد ورود
    این کد را در اختیار هیچکس قرار ندهید
    ${otp}
    `

    await sendToSmsProvider(phone, message)
}

export {
    sendSms
}