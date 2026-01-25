# Google Indexing API Setup Guide

To enable instant indexing of published content, you need to configure a Google Cloud Service Account.

## 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select existing).
3. Enable **"Web Search Indexing API"**.
4. Go to **IAM & Admin > Service Accounts**.
5. Click **Create Service Account**.
   - Name: `indexing-bot` (example)
   - Role: `Owner` (or specific Indexing API role if available)
6. Once created, go to the **Keys** tab -> **Add Key** -> **Create new key** -> **JSON**.
7. Save the JSON file securely.

## 2. Google Search Console Setup (CRITICAL)
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Select your property (`https://todaypharm.kr` or similar).
3. Go to **Settings > Users and permissions**.
4. Click **Add User**.
5. Enter the **email address of the Service Account** (e.g., `indexing-bot@project-id.iam.gserviceaccount.com`).
6. Set Permission: **Owner** (Required for Indexing API).

## 3. Environment Variables
Add the following to your `.env.local` (and GitHub Secrets):

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email@..."
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

> [!NOTE]
> For GitHub Secrets, just paste the raw values.
> For `.env.local`, ensure newlines in the private key are handled correctly (copy the full string including `\n`).

## 4. Verification
Run a manual publish (if you have pending items) or check the logs:
```bash
npm run publish:queue
```
You should see: `Requesting indexing for: ...` followed by a success message.
