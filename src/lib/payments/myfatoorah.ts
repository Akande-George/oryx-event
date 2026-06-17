// Server-only thin client for the MyFatoorah API.
// Docs: https://docs.myfatoorah.com/

import "server-only";

const BASE_URL =
  process.env.MYFATOORAH_BASE_URL ?? "https://apitest.myfatoorah.com";
const API_KEY = process.env.MYFATOORAH_API_KEY;

function requireKey() {
  if (!API_KEY)
    throw new Error(
      "MYFATOORAH_API_KEY is not set. Add it to .env.local before calling MyFatoorah.",
    );
  return API_KEY;
}

type Notification = "LNK" | "EML" | "SMS" | "ALL";

export type SendPaymentInput = {
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  mobileCountryCode?: string;
  callbackUrl: string;
  errorUrl: string;
  customerReference: string;
  userDefinedField?: string;
  language?: "en" | "ar";
  notification?: Notification;
};

export type SendPaymentResult = {
  invoiceId: number;
  invoiceUrl: string;
  customerReference: string;
};

type MyFatoorahEnvelope<T> = {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors?: Array<{ Name: string; Error: string }>;
  Data?: T;
};

async function call<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const raw = await res.text();
  let json: MyFatoorahEnvelope<T>;
  try {
    json = JSON.parse(raw) as MyFatoorahEnvelope<T>;
  } catch {
    throw new Error(
      `MyFatoorah ${path} returned non-JSON (HTTP ${res.status}): ${raw.slice(0, 300)}`,
    );
  }
  if (!json.IsSuccess || !json.Data) {
    const validation = json.ValidationErrors?.map(
      (v) => `${v.Name}: ${v.Error}`,
    ).join("; ");
    // When MyFatoorah gives only a generic message, include the raw body so
    // the real cause (auth, currency, field) is visible in logs.
    const detail = validation
      ? ` (${validation})`
      : ` [HTTP ${res.status}] ${raw.slice(0, 300)}`;
    throw new Error(`MyFatoorah ${path} failed: ${json.Message}${detail}`);
  }
  return json.Data;
}

export async function sendPayment(
  input: SendPaymentInput,
): Promise<SendPaymentResult> {
  const data = await call<{ InvoiceId: number; InvoiceURL: string }>(
    "/v2/SendPayment",
    {
      // MyFatoorah SendPayment v2 fields: InvoiceValue + DisplayCurrencyIso
      // (NOT InvoiceAmount/CurrencyIso), and NotificationOption must be
      // upper-case ("LNK" | "SMS" | "EML" | "ALL").
      NotificationOption: input.notification ?? "LNK",
      CustomerName: input.customerName,
      DisplayCurrencyIso: input.currency ?? "QAR",
      CustomerEmail: input.customerEmail,
      InvoiceValue: Number(input.amount.toFixed(3)),
      CallBackUrl: input.callbackUrl,
      ErrorUrl: input.errorUrl,
      Language: input.language ?? "en",
      CustomerReference: input.customerReference,
      UserDefinedField: input.userDefinedField ?? "",
      ...(input.customerMobile
        ? {
            CustomerMobile: input.customerMobile,
            MobileCountryCode: input.mobileCountryCode ?? "+974",
          }
        : {}),
    },
  );
  return {
    invoiceId: data.InvoiceId,
    invoiceUrl: data.InvoiceURL,
    customerReference: input.customerReference,
  };
}

export type PaymentTransaction = {
  transactionId: string;
  status: string; // "Succss" (sic) | "Failed" | "Pending"
  paymentGateway: string; // "KNET", "VISA", ...
  paymentId: string;
  amount: string;
  currency: string;
};

export type PaymentStatusResult = {
  invoiceId: number;
  invoiceStatus: "Paid" | "Failed" | "Pending" | "Expired";
  customerReference: string | null;
  userDefinedField: string | null;
  transactions: PaymentTransaction[];
  successfulTransaction?: PaymentTransaction;
};

export async function getPaymentStatus(
  key: string,
  keyType: "PaymentId" | "InvoiceId" = "PaymentId",
): Promise<PaymentStatusResult> {
  type Raw = {
    InvoiceId: number;
    InvoiceStatus: PaymentStatusResult["invoiceStatus"];
    CustomerReference?: string | null;
    UserDefinedField?: string | null;
    InvoiceTransactions: Array<{
      TransactionId: string;
      TransactionStatus: string;
      PaymentGateway: string;
      PaymentId: string;
      Amount: string;
      Currency: string;
    }>;
  };
  const data = await call<Raw>("/v2/GetPaymentStatus", {
    Key: key,
    KeyType: keyType,
  });
  const transactions: PaymentTransaction[] = data.InvoiceTransactions.map(
    (t) => ({
      transactionId: t.TransactionId,
      status: t.TransactionStatus,
      paymentGateway: t.PaymentGateway,
      paymentId: t.PaymentId,
      amount: t.Amount,
      currency: t.Currency,
    }),
  );
  return {
    invoiceId: data.InvoiceId,
    invoiceStatus: data.InvoiceStatus,
    customerReference: data.CustomerReference ?? null,
    userDefinedField: data.UserDefinedField ?? null,
    transactions,
    successfulTransaction: transactions.find(
      (t) =>
        t.status === "Succss" ||
        t.status === "Success" ||
        t.status.toLowerCase() === "succss",
    ),
  };
}
