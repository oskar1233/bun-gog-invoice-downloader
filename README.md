# Gmail Invoice Downloader

Bulk download PDF invoices and receipts from your Gmail accounts.

Uses [`gog`](https://github.com/steipete/gogcli) to search Gmail, then downloads all PDF attachments matching your configured queries.

<!-- TODO: Add article link -->

## Setup

1. Install [Bun](https://bun.sh) and [`gog`](https://github.com/steipete/gogcli)
2. Authenticate `gog` with your Google account(s)
3. Copy the example config and edit it with your accounts/senders:

```sh
cp config.example.ts config.ts
```

4. Install dependencies and run:

```sh
bun install
bun start
```

Downloaded PDFs will be saved to `files/`.
