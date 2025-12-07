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
/**
 * Initializes and configures the Express app, including:
 * 1. CORS configuration based on HTTPS.
 * 2. Middleware setup (express.json(), express.urlencoded()).
 * 3. Elasticsearch, Redis, and BullQueue initialization.
 * 4. Module loading based on config.
 */
// Configure CORS to properly handle preflight requests and credentials.
// Note: Access-Control-Allow-Origin cannot be '*' when credentials are used.

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any origin
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true, // Allow credentials to be sent
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204, // For legacy browser support
};

// Apply CORS middleware for both preflight and actual requests
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests if needed
app.options('*', cors(corsOptions));


app.use("/queues", router);
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Integration
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
