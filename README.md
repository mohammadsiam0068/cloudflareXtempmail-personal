<h1 align="center">Temp Mail | Disposable Email Service</h1>

<div align="center">

[![Temp Mail](https://img.shields.io/badge/Status-Live-brightgreen)](https://ahcm.pages.dev/) [![Version](https://img.shields.io/badge/Version-1.0.0-green)](https://ahcm.pages.dev/) [![License](https://img.shields.io/badge/License-MIT-yellow)](https://ahcm.pages.dev/) [![Live Demo](https://img.shields.io/badge/Live%20Demo-https://ahcm.pages.dev/-blue)](https://ahcm.pages.dev/)

*AHCM Mail is a fast, secure, and fully self-hosted disposable email service built on React (Vite) and deployed through Cloudflare Pages & Workers. It uses Cloudflare D1 as its database layer and Cloudflare Email Routing to receive mail in real time.*

*One of the biggest advantages of this project is that it runs entirely on Cloudflare's free tier. <font color="green">Cloudflare Pages, Workers, and D1 Database all offer generous lifetime free usage</font>, making this an extremely cost-effective solution for personal projects and production-ready deployments without any hosting expenses.*

</div>

---

## 🌐 Live Demo

Experience the full functionality of **AHCM Temp Mail** with all features available online!

**🚀 Web:** [https://ahcm.pages.dev/](https://ahcm.pages.dev/)

---

## ✨ Features

- **Modern UI/UX**
- **PWA App**
- **Responsive Design**
- **Instant Disposable Addresses**
- **Multiple Domain Support**
- **Realtime Inbox (Auto-refresh)**
- **Auto-delete Messages After 1 Hour**
- **Lifetime Free Server**

## 🧩 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Cloudflare Worker + Cloudflare Pages Functions
- **Database:** Cloudflare D1 (SQLite)
- **Email:** Cloudflare Email Routing
- **Hosting:** Cloudflare Pages

---

## 🚀 Deployment Guide

Follow the steps below in order — the sequence matters, especially the worker/pages naming and binding steps.

---

### 1️⃣ Fork the Repository

- Fork this repository to your own GitHub account:
  ```
  https://github.com/botolmehedi/tempmail-cloudflare
  ```

---

### 2️⃣ Create a Free Cloudflare Account

- Sign up or log in at **https://cloudflare.com**
- Make sure you added/connect the domains you plan to use for temporary email addresses added to your account (e.g. `abc123.net`, `abc123.com`, `abc-ai.com`, `abc123.app`).

- Also you need CLOUDFLARE_API_TOKEN. To create your `CLOUDFLARE_API_TOKEN`, sign in to your Cloudflare account, open **My Profile**, and go to the **API Tokens** section. Click **Create Token**, choose **Create Custom Token**, and grant only the following permissions: **Email Security DMARC Reports: Read & Write**, **Cache Settings: Write**, **Email Routing Rules: Write**, **Zone: Read & Write**, and **DNS: Write**. After configuring the permissions, create the token, copy it immediately, and store it in a secure location, as Cloudflare will only display the token once.

---

### 3️⃣ Set Your Temp Mail Domains

Before deploying, open the file:

```
src/lib/tempmail-api.ts
```

```
worker/src/index.ts
```

Add the domain name(s) you want to use as your temporary email domains. This must be done **before** you deploy the project as a Worker or a Page, otherwise the generated addresses won't match your Email Routing setup.

---


#

# 🗄️ Database Setup (Cloudflare D1)

### 4️⃣ Create the D1 Database

You can do this either from the Dashboard or via terminal.

**Option A — Dashboard:**
1. Go to **Storage & Databases → D1**
2. Click **Create Database**
3. Name it, for example: `tempmail-db`

**Option B — Terminal:**
```bash
npx wrangler d1 create tempmail-db
```

---

### 5️⃣ Import the Schema

1. Open your newly created database → **Explore Data** (or run it via terminal)
2. Open the file `worker/schema.sql` from the repo
3. Copy the schema and run it against your database

**Via terminal:**
```bash
cd worker
npx wrangler d1 execute tempmail-db --file=schema.sql
```

⚠️ *If importing manually through the dashboard query editor, paste and run the schema section by section instead of all at once — pasting everything together can sometimes prevent all tables from being created properly.*

---

### 6️⃣ Add Your Database ID

Copy the **Database UUID** and **Database Name** from the D1 dashboard, then paste them into:

- `worker/wrangler.toml`
- `wrangler.jsonc`

```toml
[[d1_databases]]
binding = "DB"
database_name = "tempmail-db"
database_id = "your-database-uuid-here"
```

---

## ☁️ Deploy the Project

⚠️ *Important: Deploy the project as a **Worker first**, then deploy it as **Pages**. Your Worker project name must exactly match the name you set in `wrangler.toml` / `wrangler.jsonc`. For example, if the name field says `tempmail-api`, your deployed Worker must also be named `tempmail-api`.*

### 7️⃣ Deploy as a Worker

**Via Website:**

1. Go to **Cloudflare Dashboard**.
2. Navigate to:  
   **Compute → Pages & Workers → Create Application**
3. Select **Import an existing Git repository**
4. Connect your **GitHub account** & Then Select the **forked repository**.

**Via terminal:**

```bash
cd worker
npm install
npm run deploy
```

**Build Configuration:**

Use the following settings:

- **Build Command:**  
  ```
  npm install && npm run build
  ```
- **Deploy command:**  

Replace `ahcm` with your **Pages project name**—the name you chose/want to use when deploy the Pages project, **not** your Worker name.

  ```
  npx wrangler pages deploy dist --project-name=ahcm
  ```
- **Output Directory:**  
  ```
  dist
  ```
- **Root Directory:**  
  ```
  /
  ```  
**Add Environment Variables:**

- **Variable Name:** `CLOUDFLARE_API_TOKEN`  
- **Value:** `true`  
- **Type:** Text  


Save the configuration and proceed with deployment.

---

Then bind the database to the Worker:

1. Go to **Compute → Pages & Workers**
2. Select your deployed Worker project
3. Go to **Settings → Bindings → Add Binding**
4. Choose **D1 Database**
5. Set:
   - **Variable Name:** `DB`
   - **Database:** select the database you created (e.g. `tempmail-db`)
6. Save changes

---

### 8️⃣ Deploy as Pages

**Via Website:**

1. Go to **Cloudflare Dashboard**.
2. Navigate to:  
   **Compute → Pages & Workers → Create Application**
3. Click Looking to deploy Pages? **Get started** 
4. Select **Import an existing Git repository**
5. Connect your **GitHub account** & Then Select the **forked repository**.

**Via terminal:**

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=tempmail
```

**Build Configuration:**

Use the following settings:

- **Framework Preset:** React (Vite)  
- **Build Command:**  
  ```
  npm install && npm run build
  ```
- **Output Directory:**  
  ```
  dist
  ```
- **Root Directory:**  
  ```
  /
  ```  

**Add Environment Variables:**

- **Variable Name:** `SKIP_DEPENDENCY_INSTALL`  
- **Value:** `true`  
- **Type:** Text

- **Variable Name:** `CLOUDFLARE_API_TOKEN`  
- **Value:** `true`  
- **Type:** Text  


Save the configuration and proceed with deployment.

---

Then bind the same database to the Pages project, exactly the same way:

1. Go to **Compute → Pages & Workers**
2. Select your deployed Pages project
3. Go to **Settings → Bindings → Add Binding**
4. Choose **D1 Database**
5. Set:
    
    - **Variable Name:** `DB`
   - **Database:** select the same database (e.g. `tempmail-db`)
6. Save changes

---

### 9️⃣ Set .env File Variables

Update your `.env.production` file to point to your **deployed Pages URL** — not the Worker URL. It will start automatic deploy from Github.

```
VITE_API_URL=https://your-deployed-project.pages.dev
```

---

## 📧 Email Routing Setup

### 🔟 Enable DMARC (Required for Each Domain)

For **each domain** you added in Step 3:

1. Cloudflare Dashboard → select the domain
2. Go to **Email → DMARC Management**
3. Click **Activate**

---

### 1️⃣1️⃣ Enable Email Routing

For **each domain**:

1. Go to **Build (dropdown) → Email Service → Email Routing**
2. Add your domain
3. Go to **Routing Rules**
4. Enable **Catch-all rule**
5. Set:
   - **Action:** `Send to a Worker`
   - **Destination:** select your deployed Worker project
6. Go to the **Destination Addresses** tab and **verify your email address** — this step is required or routing will not work

> Cloudflare will automatically add the required MX and TXT DNS records for you.

---

## ✅ Deployment Complete

Visit your deployed Pages URL — the application should now be fully functional and able to receive real emails on your configured domains.

---


## 💡 Feature Requests

Have an idea? We'd love to hear it:

1. **Check existing requests**
2. **Create a new issue** with:
   - Detailed description
   - Use case explanation
   - Potential implementation ideas

---

## 🤝 Contributing

I built this for myself, but I'd love to see what you can add! Here's how to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request🎯

<div align="center">

[Star](https://github.com/botolmehedi/tempmail-cloudflare/stargazers) | [Issue](https://github.com/botolmehedi/tempmail-cloudflare/issues) | [Discussion](https://github.com/botolmehedi/tempmail-cloudflare/discussions)

</div>

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use this freely, modify it, sell it, whatever. Just don't blame me if something ______!😪

---

## ⚠️ Disclaimer

This tool is created for educational and research purposes only. Do not use it for any illegal activities. The creator is not responsible for any misuse, damage, or legal consequences caused by the use of this tool. By using this project, you agree that you are doing so at your own risk and for learning purposes only.

---

<div align="center">

### 🌟 Star this [REPO](https://github.com/botolmehedi/tempmail-cloudflare) if you find it helpful!

[Portfolio](https://mehedi.fun) | [Email](mailto:hello@mehedi.fun) | [Github](https://github.com/BotolMehedi)

**Made with ❤️ and lots of 💦 by [BotolMehedi](https://github.com/BotolMehedi)**

</div>
