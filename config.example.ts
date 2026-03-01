import path from "node:path";

// Gmail accounts to search through
const accounts = ["you@gmail.com", "you@yourdomain.com"];

// Partial sender addresses or domains to match against
const senders = [
  "fly.io",
  "railway",
  "aws",
  "payments-noreply@google.com",
  // add more senders here
];

// Only fetch emails after this date
const after = "2026/02/01";

export const queries = [
  // Search for emails from the listed senders
  {
    accounts,
    senders,
    after,
  },
  // Search for emails containing "invoice" from your own accounts
  // (useful for catching income invoices)
  {
    accounts,
    senders: accounts,
    after,
    text: "invoice",
  },
];

export const outFilesDirectory = path.join(import.meta.dir, "files");
