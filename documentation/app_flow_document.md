# App Flow Document

# Business Finance Tracker App Flow Document

## Onboarding and Sign-In/Sign-Up

When a user first arrives, they land on a simple welcome page with the product name and a prompt to either sign in or get started. If the user clicks Get Started, they are taken to a sign-up page where they enter an email address, choose a secure password, and confirm their agreement to terms of service. After submitting, they receive a verification email to confirm their address. If they follow the link in that email, the account is activated and they are routed to the initial setup. Should the user already have an account, they can choose Sign In instead, provide their email and password, and immediately enter the application. A Forgot Password link on the sign-in page leads to a view where they submit their email, receive a reset link, and create a new password. A Sign Out button sits in the navigation so that at any time the user can securely end their session and return to the welcome page.

## Main Dashboard or Home Page

After successful login and any first-time setup, the user arrives at the Dashboard. The screen is divided into a left navigation pane and a main content area. The navigation pane uses a green accent and lists Dashboard, Chat, Export, and Settings. The top of the main area displays the business name, the current date range view, and a date picker. Below, interactive line charts mark income versus expenses trends over time, side-by-side bar charts break down spending by category, and a summary table shows recent transactions. Each chart responds when hovered, showing precise figures, and updating instantly if the date range is changed. From here, the user can click Chat to record a new transaction, Export to download data, or Settings to adjust their account. The layout makes it clear how to move between key areas without any hidden menus.

## Detailed Feature Flows and Page Transitions

On the Chat page, the user is greeted by a conversational window. At the bottom is a text input field where they type statements such as “I spent $200 on office supplies yesterday.” The AI assistant powered by GPT-4.1 immediately parses that message. If any required detail is missing—say the category or payment method—the assistant asks a follow-up question in the same chat. The user replies, and once all fields (date, amount, category, vendor, payment method, and optional notes) are confirmed, the assistant displays a confirmation message and a summary card of the saved record. Behind the scenes, the information is validated against formatting rules and then sent via an API to the PostgreSQL database. A brief loader appears below the new message until the API call succeeds.

If the user types a query like “What’s my projected cash flow for next month?” the assistant detects it as an insight request rather than a transaction. The AI then runs a forecast model, generates text explaining the predicted cash flow, and displays a small trend line chart inline in the chat. The user can scroll through past messages, click on chart points for more detail, or return to typing new entries. Whenever the assistant recognizes an unusually large transaction or category overspend, it automatically injects an alert message in the chat thread, drawing attention to potential anomalies.

From the Dashboard, clicking on any segment of a bar chart drills down into a filtered table of transactions on a separate view. That view retains the left navigation, a breadcrumb to return, and a back button that brings the user back to the full dashboard. When the user navigates to Export, they see a simple form where they select the data type—expenses, incomes, assets or all—and pick a date range. After clicking Download, the system generates an Excel file with separate sheets and pivot tables for each data type and triggers a browser download.

## Settings and Account Management

In Settings, the user lands on a page divided into Profile and Business Details sections. Profile shows the user’s email and a Change Password button. Clicking that reveals fields to enter the current password and choose a new one, with inline validation for strength. Business Details displays fields for business name, preferred currency, and fiscal year start date. The user can edit any field and click Save to update the database. A Notifications tab allows toggling email alerts for anomalies or monthly summaries. After saving, a success banner appears at the top, and the user can click Back to Dashboard or select any other main navigation item.

## Error States and Alternate Paths

If the user enters invalid credentials at sign-in, a red inline error appears stating “Email or password incorrect.” On the forgot password screen, submitting an unknown email triggers “No account found with that address.” During chat entry, if the AI cannot interpret an amount or date, it responds with a friendly message such as “Sorry, I didn’t catch the date. Can you specify when that expense occurred?” Network errors during save operations display a toast notification reading “Network error. Please try again.” If the Excel export generation fails, an error dialog informs the user and suggests retrying after a moment. In every case, clear instructions guide the user back to a normal flow, whether by retyping input, clicking Retry, or returning to the home view.

## Conclusion and Overall App Journey

A new user begins by signing up, verifying their email, and completing simple business setup details. They arrive at the Dashboard to see an immediate overview of financial health. From there, they use the Chat interface to log every expense, income, or asset in natural language. The AI assistant fills in gaps and confirms each record. The user switches between the conversational view and the graphical Dashboard to track trends, ask for forecasts, and get anomaly alarms. When needed, they export data as an Excel workbook for offline work. They manage their account and business settings in a unified Settings area and sign out when finished. This cycle—from signup to daily data entry, insight exploration, and export—forms a seamless journey that delivers clarity and control over business finances.


---
**Document Details**
- **Project ID**: ec473bf4-ddb2-4ff4-8740-6df58f387758
- **Document ID**: cf802ef6-2d3a-49cc-9bcb-20091610aea0
- **Type**: custom
- **Custom Type**: app_flow_document
- **Status**: completed
- **Generated On**: 2025-10-02T11:33:55.779Z
- **Last Updated**: 2025-10-02T11:40:41.271Z
