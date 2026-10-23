# AGATHIYA Mobile Experience Audit Report (Mobile-First Optimization)

**Audit Date:** October 2026  
**Tested Viewports:** 
- **360px × 640px** (Entry-level Android devices: Samsung Galaxy A03/A12, Redmi 9A/10A)
- **390px × 844px** (Standard modern mobile: iPhone 12/13/14/15)
- **412px × 915px** (Popular Android devices: Samsung Galaxy A54, Google Pixel 7)
**Target Environment:** 3G / Slow 4G networks, cheap Android smartphones with limited RAM and CPU power.

---

## 1. Executive Summary

While AGATHIYA looks attractive on desktop, testing across 360px, 390px, and 412px viewports reveals several friction points that impede students on inexpensive mobile phones:
1. **Viewport Meta Tag:** `index.html` has `maximum-scale=5.0` but lacks `viewport-fit=cover` for edge-to-edge notch/safe-area displays.
2. **Horizontal Overflow Bugs:**
   - Decorative background glows (`.hp-cta-glow-bg`) bleed to **403.5px** on 360px screens.
   - Profile tabs (`.profile-tab-btn`) bleed to **443.8px** on 360px screens, causing tab text to be cut off without horizontal scroll indicators.
   - Admin and mentor tables (`<table>`) squish columns and overflow to **380px** on 360px screens. Action buttons become vertically stretched sticks (39px wide × 191px high).
3. **Font Sizing & iOS Zoom Trigger:**
   - Search inputs (14.4px), filter selects (14.4px), and contact form fields (14.72px) are all below the **16px threshold**, triggering forced viewport zooming on mobile browsers and causing disorienting layout shifts.
4. **Touch Target Deficits (< 44px × 44px):**
   - Header user pill: 36px × 36px.
   - Mobile hamburger toggle: 38px × 38px.
   - Action buttons (`.btn-sm`): 31px to 38px height.
   - Filter pills: 34px to 38px height.
   - Form checkboxes: 17px × 17px without expanded touch padding.
5. **Key Flow Deficits:**
   - **Hero Section:** Multiple action buttons and explanatory paragraphs push the first live session far below the fold (requires 3 full swipes on 360px screen).
   - **Payment Modal:** Opens as a desktop-centered card that nearly touches the screen edges, lacking a native mobile slide-up bottom sheet, drag handle, or `upi://pay` deep link for 1-tap Google Pay / PhonePe opening.
   - **Student Navigation:** Lacks a sticky bottom tab bar (`Home`, `Sessions`, `Achievements`, `Profile`), forcing students to constantly reach to the top left/right for the hamburger drawer.
   - **Onboarding Flow:** "Next" and "Back" buttons are located at the bottom of long scrollable content rather than fixed at the bottom viewport.
   - **Tables:** Dense data tables on admin and mentor pages fail on mobile, needing card-based mobile stacking.

---

## 2. Page-by-Page Audit Matrix

| Page / Route | Screen Width | Issues Identified | Severity |
| :--- | :---: | :--- | :---: |
| **Home (`/`)** | 360px, 390px, 412px | Decorative glow `.hp-cta-glow-bg` overflows to 403.5px; Hero takes >100vh pushing live guidance sessions deep below the fold; Filter pills are 38px high; Mini CTAs are 21px high. | High |
| **Login / Register (`/login`)** | 360px, 390px | Card has fixed paddings that squish inputs; input font size is 14.5px; password toggle target is 32px; testing shortcuts wrap unevenly; Google button is not full width on small screens. | High |
| **Onboarding (`/onboarding`)** | 360px, 390px | Long single scroll with step indicator; Next/Back buttons are below the fold; lacks fixed bottom action bar and compact progress indicator. | High |
| **Sessions (`/sessions`)** | 360px, 390px, 412px | Search & dropdown inputs are 14.4px (triggers zoom); no sticky bottom registration bar; session action buttons are 31px-36px. | High |
| **Payment Modal (`/payments`)** | 360px, 390px | Renders as a floating card rather than an ergonomic bottom sheet; lacks drag handle; QR is not touch-optimized; no `upi://` deep link for 1-tap app launch. | High |
| **Student Dashboard (`/home`)** | 360px, 390px | Roadmap step buttons ("View Format", "View Checklist") are 33px-38px; Google Meet action button is only 31px high; summary cards stack vertically taking entire screen. | Medium |
| **Profile (`/profile`)** | 360px, 390px | Profile tabs (`Personal Details`, `Sign-in & Email`, `Privacy`) overflow to 443px on 360px viewport; input labels lack mobile spacing; form buttons not full width. | High |
| **Achievements (`/achievements`)** | 360px, 390px | Grid images lack explicit aspect-ratio causing CLS (Cumulative Layout Shift) on slow 3G networks; filter tabs lack touch padding. | Medium |
| **Contact (`/contact`)** | 360px, 390px | All inputs & textareas are 14.72px; checkbox is 17px; support cards have small call/copy buttons rather than full-width touch actions. | Medium |
| **Legal / Privacy (`/privacy`, `/terms`)** | 360px, 390px | Long dense paragraphs without fluid scaling or easy mobile table of contents; line-height is tight on small Android screens. | Low |
| **Admin Control (`/admin`)** | 360px, 390px | Stat cards stack into long list; navigation buttons are small; tables overflow horizontally. | Medium |
| **Admin Sessions (`/admin/sessions`)** | 360px, 390px | Tables squish columns; table right bound reaches 380px on 360px screen; edit button squished into 39px × 191px; registration modal tabs overflow. | High |
| **Admin Users (`/admin/users`)** | 360px, 390px | User management table overflows 360px width; role select buttons are tightly packed (< 36px height). | High |
| **Mentor Dashboard (`/mentor`)** | 360px, 390px | Status filter pills are 34px height; session action buttons are 35px × 25px; meeting room link is 21px high. | Medium |

---

## 3. Plan of Execution (Phases 2 – 5)

1. **Phase 2 (Global Fixes):**
   - Update `index.html` viewport meta tag to `width=device-width, initial-scale=1, viewport-fit=cover`.
   - Add global CSS rules in `src/index.css`: `overflow-wrap: anywhere; word-break: break-word`, clamp-based fluid typography with 16px minimum body, minimum 44px tap targets, 16px inputs, `100dvh` support, and `env(safe-area-inset-*)` padding.
2. **Phase 3 (Navigation and Layout):**
   - Re-engineer mobile Navbar: compact logo + AGATHIYA title, 44px hamburger button, full-height backdrop-blurred drawer closing on link click & Escape.
   - Implement **Student Bottom Tab Bar** (`Home`, `Sessions`, `Achievements`, `Profile`) for screens `< 768px`.
   - Optimize Hero section: single punchy headline, 1 main CTA, live workshop card immediately visible.
   - Convert admin/mentor tables into responsive stacked cards on mobile screens (`< 768px`).
   - Create large stacked Call, WhatsApp, and Email touch buttons in contact & footer.
3. **Phase 4 (Key Flows):**
   - Mobile-first Login/Signup with full-width Google CTA, large inputs with correct `inputmode`, `type`, and visible error states.
   - Multi-step Onboarding with fixed bottom action buttons and clear progress indicator.
   - Transform Payment Modal into a native **Mobile Bottom Sheet** (max 90dvh, drag handle, 240px QR, "Open UPI App" `upi://` deep link, "Save QR", "I have paid").
   - Add summary cards horizontal scroll / 2-column grid and skeleton loaders.
4. **Phase 5 (Performance & Accessibility):**
   - Code-split routes via `React.lazy` and `Suspense` in `App.jsx`.
   - Optimize asset delivery and report bundle size reductions.
   - Verify Noto Sans Tamil typography wrapping and high contrast ratio (≥ 4.5:1).
