# Donasix3 Enterprise – README

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
8. [Operational Guide](#8-operational-guide)
9. [Security & Compliance](#9-security--compliance)
10. [Troubleshooting](#10-troubleshooting)
11. [Roadmap](#11-roadmap)
12. [Contributing](#12-contributing)
13. [License](#13-license)
14. [Support](#14-support)
15. [Changelog](#15-changelog)

---

## 1. Introduction

Donasix3 Enterprise is a **real‑time donation management and display suite** designed for fundraising events, houses of worship, and permanent donor walls. It consists of two Electron‑based desktop applications:

| Component          | Tech Stack                       | Purpose                                                                                                                  |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Admin Panel**    | Electron + TypeScript + Tailwind | Curate live donation data, trigger pop‑ups or full‑screen media, audit history, and manage branding.                     |
| **Display Client** | Electron (BrowserView)           | Render a full‑screen, legally compliant donor leaderboard with zero latency, suitable for projectors or large LED walls. |

3sheet (a separate WinForms tool) can be used to design complex tables and upload them to Firebase, but it is **not required** for day‑to‑day Donasix3 operation.

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
```

* **Realtime Sync:** All write‑operations occur through Firebase to keep Admin/Display in lock‑step.
* **Offline Safety:** Local cache via IndexedDB ensures the Display Client keeps running if the network drops.
* **Security:** Firebase rules restrict write access to authenticated Admin devices while granting read‑only access to Display.

---

## 3. Feature Matrix

| Category                                  | Admin Panel | Display Client |
| ----------------------------------------- | ----------- | -------------- |
| Realtime Firebase Sync                    | ✔           | ✔ (read‑only)  |
| Donation Leaderboard                      | ✔           | ✔              |
| Manual Media Triggers (Audio/Video/Popup) | ✔           | –              |
| Donation History Log                      | ✔           | –              |
| Multi‑Monitor Support                     | ✔           | ✔              |
| Fullscreen / Kiosk Mode                   | –           | ✔              |
| Theming & Branding                        | ✔           | ✔              |

---

## 4. System Requirements

| Component       | OS                                       | Min CPU           | Min RAM | Extras                 |
| --------------- | ---------------------------------------- | ----------------- | ------- | ---------------------- |
| Admin & Display | Windows 10 ×64 / macOS 12 / Ubuntu 20.04 | Dual‑core 2.0 GHz | 4 GB    | Node 18 LTS, npm 9     |
| Firebase        | Any                                      | –                 | –       | Blaze Plan recommended |

---

## 5. Quick Start

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

---

## 7. Configuration

### 7.1 Firebase

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

### 7.2 Admin Panel

Relevant env vars:

```dotenv
MEDIA_PATH="C:\\Donasix3\\media"
ADMIN_PORT=7000
```

### 7.3 Display Client

Runtime flags:

* `--examUrl` – URL to external leaderboard page.
* `--kiosk` – Force fullscreen & hide system chrome.
* `--monitor=2` – Select output monitor.

---

## 8. Operational Guide

### 8.1 Admin Workflow

1. **Log in** (Firebase email/pass)
2. **Monitor** live donations; manual overrides allowed
3. **Trigger**: `Popup`, `Play Audio`, or `Play Video`
4. **Review** history in *Log Tab*

### 8.2 Display Workflow

1. Launch with `--kiosk`
2. Detect active monitor & switch to full‑screen
3. Listen for `popup` or `media` events
4. Render leaderboard every 2 seconds (debounced)

---

## 9. Security & Compliance

| Vector                  | Mitigation                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase rules          | Strict write auth for role = admin                                                                                                     |
| Network                 | All traffic over HTTPS / WSS                                                                                                           |
| Media paths             | Sanitised & verified against local whitelist                                                                                           |
| Electron context        | `contextIsolation`, `sandbox`, `Content‑Security‑Policy`                                                                               |
| Anti‑Cheat (Exam Build) | Uses `disableWindowsFeatures.ps1`, `AppLocker.xml`, and custom policy registry files. Restored by `enableWindowsFeatures.ps1` on exit. |

---

## 10. Troubleshooting

| Issue                      | Fix                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------- |
| Display shows black screen | Check `--examUrl` is reachable; disable CORS block; ensure preload script path correct |
| Admin not syncing          | Verify Firebase credentials; check rules; open DevTools > Console                      |
| Media fails to play        | Ensure file in `MEDIA_PATH`; supported formats: MP3, MP4, WEBM                         |

---

## 11. Roadmap

* Multi‑language UI (🇮🇩 / 🇬🇧)
* OAuth 2.0 SSO for Admin
* Raspberry Pi Kiosk build
* Dark Mode

---

## 12. Contributing

1. Fork ➜ feature branch ➜ Pull Request
2. Lint with `npm run lint`
3. Commit using *Conventional Commits* style

---

## 13. License

```
MIT License © 2023‑2025 Your Organization
```

---

## 14. Support

* **Email:** [leleoon@icloud.com](mailto:leonxlab@icloud.com)

---

## 15. Changelog

| Date       | Version | Highlights                               |
| ---------- | ------- | ---------------------------------------- |
| 2025‑06‑24 | 2.0     | Complete rewrite, anti‑cheat toolchain   |
| 2024‑12‑10 | 1.5     | Firebase rules hardening, Popup refactor |
| 2024‑06‑01 | 1.0     | Initial public release                   |
