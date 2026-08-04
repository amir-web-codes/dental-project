import dotenv from "dotenv";
dotenv.config();

import env from "./utils/env"
import app from "./app"

const PORT = env("PORT") || 3000;
async function bootstrap() {
    try {

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}


bootstrap();