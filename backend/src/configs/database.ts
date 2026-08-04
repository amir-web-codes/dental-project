import prisma from "./prisma"

async function connectToDB() {
    await prisma.$connect()
    console.log("Connected to Database successfully")
}

export default connectToDB