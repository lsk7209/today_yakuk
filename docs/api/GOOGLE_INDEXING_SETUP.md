# Google Indexing API Setup Guide

> Use least privilege. Grant the service account only the minimum Search Console property permission required for the verified workflow; do not grant Owner solely for indexing automation.

To enable instant indexing of published content, you need to configure a Google Cloud Service Account.

## 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select existing).
3. Enable **"Web Search Indexing API"**.
4. Go to **IAM & Admin > Service Accounts**.
5. Click **Create Service Account**.
   - Name: `indexing-bot` (example)
   - Do not assign a broad project role for this integration. Create the service account, enable only the required API, and keep its IAM permissions minimal.
6. Once created, go to the **Keys** tab -> **Add Key** -> **Create new key** -> **JSON**.
7. Save the JSON file securely.

## 2. Google Search Console Setup (CRITICAL)
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Select your property (`https://todaypharm.kr` or similar).
3. Go to **Settings > Users and permissions**.
4. Click **Add User**.
5. Enter the **email address of the Service Account** (e.g., `indexing-bot@project-id.iam.gserviceaccount.com`).
6. Add the service-account email to the exact Search Console property with the lowest permission level that passes the intended URL-notification test. Escalate only when a documented API error proves it is necessary.

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
