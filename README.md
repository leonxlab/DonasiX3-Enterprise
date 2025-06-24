# Donasix3 Enterprise & 3sheet – Comprehensive README

> **Version:** 2.0  |  **Last updated:** 24 June 2025 (Jakarta)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [High‑Level Architecture](#2-high-level-architecture)
3. [Feature Matrix](#3-feature-matrix)
4. [System Requirements](#4-system-requirements)
5. [Quick Start](#5-quick-start)
6. [Detailed Installation](#6-detailed-installation)
7. [Configuration](#7-configuration)

   * 7.1 [Firebase](#71-firebase)
   * 7.2 [Admin Panel](#72-admin-panel)
   * 7.3 [Display Client](#73-display-client)
   * 7.4 [Environment Variables](#74-environment-variables)
8. [Data Model](#8-data-model)
9. [Operational Guide](#9-operational-guide)
10. [Security & Compliance](#10-security--compliance)
11. [Troubleshooting](#11-troubleshooting)
12. [Roadmap](#12-roadmap)
13. [Contributing](#13-contributing)
14. [License](#14-license)
15. [Support](#15-support)
16. [Changelog](#16-changelog)

---

## 1. Introduction

Donasix3 Enterprise is a **real‑time donation management and display suite** designed for fundraising events, permanent donor walls, and houses of worship. The suite is split into two desktop applications:

| Component          | Tech Stack                       | Purpose                                                                                                                 |
| ------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Admin Panel**    | Electron + TypeScript + Tailwind | Curate and moderate live donation data, trigger pop‑ups or full‑screen media, and audit history.                        |
| **Display Client** | Electron (BrowserView)           | Render a full‑screen, legally compliant donor leaderboard with zero latency, suitable for large displays or projectors. |

Complementing Donasix3 Enterprise, **3sheet** is a **WinForms/VB.NET** spreadsheet engine used internally to design complex table layouts, import/export Excel, and push existing sheets to Firebase.

---

## 2. High‑Level Architecture

```mermaid
flowchart TD
    Firebase[Firebase Realtime DB] -- WebSocket Sync --> AdminPanel[Admin Panel (Electron)]
    Firebase -- WebSocket Sync --> DisplayClient[Display Client (Electron)]
    AdminPanel -- Manual Triggers / Settings --> Firebase
    subgraph LocalNetwork
        AdminPanel -.IPC.-> DisplayClient
    end
    3sheet[(3sheet WinForms App)] -- REST/SDK --> Firebase
```

* **Realtime Sync:** All write‑operations occur through Firebase to keep Admin/Display in lock‑step.
* **Offline Safety:** Local cache via IndexedDB ensures the Display Client keeps running if the network drops.
* **Security:** Firebase rules restrict write access to authenticated Admin devices while granting read‑only access to Display.

---

## 3. Feature Matrix

| Category                                  | Donasix3 Admin | Donasix3 Display | 3sheet |
| ----------------------------------------- | -------------- | ---------------- | ------ |
| Realtime Firebase Sync                    | ✔              | ✔ (read‑only)    | ✔      |
| Excel Import/Export                       | –              | –                | ✔      |
| Cell Merging & Formatting                 | –              | –                | ✔      |
| Donation Leaderboard                      | ✔              | ✔                | –      |
| Manual Media Triggers (Audio/Video/Popup) | ✔              | –                | –      |
| Donation History Log                      | ✔              | –                | –      |
| Multi‑Monitor Support                     | ✔              | ✔                | –      |
| Font Styling & Zoom                       | –              | –                | ✔      |
| Chart Insertion                           | –              | –                | ✔      |
| Fullscreen Display w/ Kiosk Mode          | –              | ✔                | –      |
| Theming & Branding                        | ✔              | ✔                | –      |

---

## 4. System Requirements

| Component       | OS                                       | Min CPU           | Min RAM | Extras                                 |
| --------------- | ---------------------------------------- | ----------------- | ------- | -------------------------------------- |
| Admin & Display | Windows 10 ×64 / macOS 12 / Ubuntu 20.04 | Dual‑core 2.0 GHz | 4 GB    | Node 18 LTS, npm 9                     |
| 3sheet          | Windows 10 ×64                           | Dual‑core 2.0 GHz | 4 GB    | .NET Framework 4.8, Visual Studio 2022 |
| Firebase        | Any                                      | –                 | –       | Blaze Plan recommended for production  |

---

## 5. Quick Start

```bash
# 1. Clone
$ git clone https://github.com/your‑org/donasix3‑enterprise.git
$ cd donasix3‑enterprise

# 2. Install Dependencies
$ npm install

# 3. Configure Environment (see section 7)
$ cp .env.example .env
$ nano .env

# 4. Run Admin Panel (Dev)
$ npm run dev:admin

# 5. Run Display Client (Dev)
$ npm run dev:display -- --examUrl="https://your‑donation‑screen.local"
```

For **3sheet**:

```bash
# Open 3sheet.sln in Visual Studio and press F5.
```

---

## 6. Detailed Installation

### 6.1 Cloning & Branching

* **main** – stable releases
* **dev** – active development
* **feature/**\* – feature branches

### 6.2 Building Production Binaries

```bash
# Build Admin (Windows)
$ npm run build:admin:win

# Build Display (Windows)
$ npm run build:display:win
```

Artifacts are emitted in `dist/`:

* `Donasix3‑Admin‑Setup‑x64.exe`
* `Donasix3‑Display‑Setup‑x64.exe`

### 6.3 Packaging 3sheet

Run **Publish…** in Visual Studio ➜ *Folder* profile. Output goes to `bin\Release\net48\publish`.

---

## 7. Configuration

### 7.1 Firebase <a name="71-firebase"></a>

Create a **Realtime Database** and copy credentials into `.env`:

```dotenv
FIREBASE_API_KEY="..."
FIREBASE_AUTH_DOMAIN="...firebaseapp.com"
FIREBASE_DATABASE_URL="https://your‑project.firebaseio.com"
FIREBASE_PROJECT_ID="your‑project"
FIREBASE_STORAGE_BUCKET="your‑project.appspot.com"
```

Define rules:

```json
{
  "rules": {
    "donations": {
      ".read": true,
      ".write": "auth != null && auth.token.role === 'admin'"
    }
  }
}
```

### 7.2 Admin Panel <a name="72-admin-panel"></a>

Relevant env vars:

```dotenv
MEDIA_PATH="C:\\Donasix3\\media"
ADMIN_PORT=7000
```

### 7.3 Display Client <a name="73-display-client"></a>

Flags:

* `--examUrl` – URL to external leaderboard page.
* `--kiosk` – Force fullscreen & hide system chrome.
* `--monitor=2` – Select output monitor.

### 7.4 Environment Variables <a name="74-environment-variables"></a>

See `.env.example` for a full list. **Never** commit real credentials.

---

## 8. Data Model

### 8.1 Firebase Structure

```json
{
  "Sheet1": {
    "A1": { "value": "John Doe" },
    "B1": { "value": 1500000 },
    "C1": { "value": "IDR" },
    "D1": { "merge": "C1:D1" }
  },
  "Sheet2": {
    "A1": { "value": "Jane" },
    "B1": { "value": 750000 },
    "histori": {
      "2025-06-24T07:41:00Z": { "nominal": 750000 }
    }
  }
}
```

* **Alphabet Cell** ➜ Donor name
* **Numeric Cell** ➜ Donation amount
* **Merge key** ignored during aggregation

### 8.2 Name Deduplication Logic

1. Iterate non‑merged cells
2. If `value` is string & next cell numeric ⇒ name/value
3. If name repeats, **sum** the numeric values

---

## 9. Operational Guide

### 9.1 Admin Workflow

1. **Log in** (Firebase email/pass)
2. **Monitor** live donations; manual overrides allowed
3. **Trigger**: `Popup`, `Play Audio`, or `Play Video`
4. **Review** history in *Log Tab*

### 9.2 Display Workflow

1. Launch with `--kiosk`
2. Detect active monitor & switch to full‑screen
3. Listen for `popup` or `media` events
4. Render leaderboard every 2 seconds (debounced)

### 9.3 3sheet Usage

* Design sheet ➜ *Export* ➜ *Upload* via built‑in Firebase button
* Supports font styling, zoom levels 25‑400 %, and chart insertion

---

## 10. Security & Compliance

| Vector                  | Mitigation                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase rules          | Strict write auth for role = admin                                                                                                                            |
| Network                 | All traffic over HTTPS / WSS                                                                                                                                  |
| Media paths             | Sanitised & verified against local whitelist                                                                                                                  |
| Electron context        | `contextIsolation`, `sandbox`, `Content‑Security‑Policy`                                                                                                      |
| Anti‑Cheat (Exam Build) | Uses `disableWindowsFeatures.ps1`, `AppLocker.xml`, and custom policy registry files (`setCustomShell.reg`). Restored by `enableWindowsFeatures.ps1` on exit. |

---

## 11. Troubleshooting

| Issue                      | Fix                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Display shows black screen | Check `--examUrl` is reachable; disable CORS block; ensure preload script path correct |
| Admin not syncing          | Verify Firebase credentials; check rules; open DevTools > Console                      |
| Media fails to play        | Ensure file in `MEDIA_PATH`; supported formats: MP3, MP4, WEBM                         |
| 3sheet compile errors      | Install .NET 4.8 Dev Pack; set VS *Preferred 32‑bit* off                               |

---

## 12. Roadmap

* Multi‑language UI (🇮🇩 / 🇬🇧)
* OAuth 2.0 SSO for Admin
* GraphQL aggregation backend
* Raspberry Pi Kiosk build
* Dark Mode

---

## 13. Contributing

1. Fork ➜ feature branch ➜ Pull Request
2. Lint with `npm run lint`
3. Commit using *Conventional Commits* style

---

## 14. License

```
MIT License © 2023‑2025 Your Organization
```

---

## 15. Support

* **Email:** [leleoon@icloud.com](mailto:leonxlab@icloud.com)

---

## 16. Changelog

| Date       | Version | Highlights                                                 |
| ---------- | ------- | ---------------------------------------------------------- |
| 2025‑06‑24 | 2.0     | Complete rewrite, 3sheet integration, anti‑cheat toolchain |
| 2024‑12‑10 | 1.5     | Firebase rules hardening, Popup refactor                   |
| 2024‑06‑01 | 1.0     | Initial public release                                     |
