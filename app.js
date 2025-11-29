import express from "express";
import { constants } from "./utils/constants.utils.js";
import cors from "cors";
import { router } from "bull-board";
import swaggerUi from "swagger-ui-express";
import specs from "./utils/swagger.utils.js";
import cookieParser from 'cookie-parser';
// import './modules/admissions/services/installment.notify.service.js'
const app = express();


// Check for HTTPS enabling or not
const isHttpsEnabled = constants.isHttp2Enabled ? true : false;
console.warn("isHttpsEnabled",isHttpsEnabled)
/**
 * Initializes and configures the Express app, including:
 * 1. CORS configuration based on HTTPS.
 * 2. Middleware setup (express.json(), express.urlencoded()).
 * 3. Elasticsearch, Redis, and BullQueue initialization.
 * 4. Module loading based on config.
 */
// Configure CORS to properly handle preflight requests and credentials.
// Note: Access-Control-Allow-Origin cannot be '*' when credentials are used.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4005",
      "https://localhost:3000",
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, server-to-server requests)
    if (!origin) return callback(null, true);

    // Allow all origins
    return callback(null, true);
  },
  credentials: true,  // Allow credentials to be sent
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,  // For legacy browser support
};

// Apply CORS middleware
app.use(cors(corsOptions));

// app.options("*", cors(corsOptions));

app.use("/queues", router);
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Integration
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
