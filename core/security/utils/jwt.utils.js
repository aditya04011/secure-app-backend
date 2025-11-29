import jwt from "jsonwebtoken";
import { constants } from "../../../utils/constants.utils.js";
import { EncryptJWT, importJWK, jwtDecrypt } from "jose";
import User from "../models/user.model.js";
import { asyncLocalStorage } from "../../../utils/asyncLocalStorage.js";

const tokenKey = constants.jwt.tokenSecret;

export async function generateAccessToken(jwtPayload, isPayment = false) {
  const secretKey = await importJWK(
    {
      kty: "oct",
      k: Buffer.from(tokenKey).toString("base64url"),
      alg: "A256GCM",
    },
    "A256GCM"
  );

  return new EncryptJWT(jwtPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(isPayment ? "15m" : "7d")
    .encrypt(secretKey);
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Authorization token missing", code: "TOKEN_MISSING" });
  }

  try {
    const secretKey = await importJWK(
      {
        kty: "oct",
        k: Buffer.from(tokenKey).toString("base64url"),
        alg: "A256GCM",
      },
      "A256GCM"
    );

    // 🔐 Decrypt the token and extract payload
    const { payload } = await jwtDecrypt(token, secretKey);
    req.user = payload;

    const { email, passwordChangedAt: tokenIssuedAt, isPayment, isEnquiry } = payload.userdetails;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: "Session expired or user not found. Please log in again.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if(!isPayment && !isEnquiry){
      if(user.tokenVersion !== payload?.userdetails?.tokenVersion){
        return res.status(401).json({error:"token expired", code: "TOKEN_EXPIRED"})
      }

      // 🔒 Check if password was changed after token was issued
      if (
        user.passwordChangedAt &&
        new Date(user.passwordChangedAt).getTime() >
          new Date(tokenIssuedAt).getTime()
      ) {
        return res.status(401).json({
          error: "Your password was changed. Please log in again.",
          code: "TOKEN_EXPIRED"
        });
      }
    }
    
    // if(user && isPayment){
    //   return {message: "Valid token"};
    // }
    const store = {
      userId: user?._id
    }
    asyncLocalStorage.run(store, () => {
    next();
  });
  } catch (err) {
    if (err.code === "ERR_JWT_EXPIRED") {
      return res.status(401).json({
        error: "Token has expired. Please log in again.",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({
      error: "Invalid or corrupted token. Please log in again.",
      code: "INVALID_TOKEN"
    });

  }
}
