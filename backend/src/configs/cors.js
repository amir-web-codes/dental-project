const allowedOrigins = [
    "http://localhost:5173",
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]

const corsOptions = {
    origin(origin, callback) {

        // Postman یا curl
        if (!origin) {
            return callback(null, true)
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        callback(new Error("Not allowed by CORS"))
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    exposedHeaders: [],

    optionsSuccessStatus: 204
}

module.exports = corsOptions