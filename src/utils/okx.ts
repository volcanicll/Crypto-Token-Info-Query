import crypto from "crypto";
import config from "@/config";
import { RawAxiosRequestHeaders } from "axios";

export interface OKXHeaders {
  "OK-ACCESS-KEY": string;
  "OK-ACCESS-SIGN": string;
  "OK-ACCESS-TIMESTAMP": string;
  "OK-ACCESS-PASSPHRASE": string;
}

export function generateOKXSignature(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string = ""
): OKXHeaders {
  if (
    !config.env.okxSecretKey ||
    !config.env.okxApiKey ||
    !config.env.okxPassphrase
  ) {
    throw new Error("Missing OKX API credentials");
  }

  // Pre-hash string: timestamp + method + requestPath + body
  const prehashString = timestamp + method.toUpperCase() + requestPath + body;

  // Create HMAC SHA256 signature using secret key
  const signature = crypto
    .createHmac("sha256", config.env.okxSecretKey)
    .update(prehashString)
    .digest("base64");

  return {
    "OK-ACCESS-KEY": config.env.okxApiKey,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": config.env.okxPassphrase,
  };
}

export function getTimestamp(): string {
  return new Date().toISOString();
}

export function buildOKXRequestPath(
  endpoint: string,
  params: Record<string, string>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });
  return `${endpoint}?${searchParams.toString()}`;
}

export function generateRequestHeaders(
  method: string,
  requestPath: string,
  body: string = ""
): RawAxiosRequestHeaders {
  const timestamp = getTimestamp();
  const okxHeaders = generateOKXSignature(timestamp, method, requestPath, body);

  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": okxHeaders["OK-ACCESS-KEY"],
    "OK-ACCESS-SIGN": okxHeaders["OK-ACCESS-SIGN"],
    "OK-ACCESS-TIMESTAMP": okxHeaders["OK-ACCESS-TIMESTAMP"],
    "OK-ACCESS-PASSPHRASE": okxHeaders["OK-ACCESS-PASSPHRASE"],
  };
}

export function handleOKXResponse<T>(response: any): T {
  if (response?.code === "0") {
    return response.data;
  }

  throw new Error(
    `OKX API Error: ${response?.msg || "Unknown error"} (Code: ${
      response?.code || "unknown"
    })`
  );
}
