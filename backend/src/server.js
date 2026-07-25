require("dotenv").config();

const app = require("./app");

// const connectMongo = require("./configs/database");
// const connectRedis = require("./configs/redis");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {

        // await connectMongo();
        // await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

bootstrap();