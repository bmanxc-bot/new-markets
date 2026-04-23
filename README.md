# New Markets API and Mobile Client

This repository provides a simple Express API for retrieving a **market
snapshot** and a companion React Native mobile application for Android.

## Overview

* **API**: The Express router defined in `market (2).ts` exposes two endpoints:
  * `POST /market/snapshot` — builds a market snapshot by aggregating live and fallback data from multiple providers (Financial Modeling Prep, Alpha Vantage, Finnhub, Alpaca and FRED). It computes a market quality score, an execution window score, and category scores (volatility, trend structure, breadth proxies, momentum participation and macro liquidity). The response includes human‑readable summaries, risk flags, regime badges and a ticker strip for major ETFs and sectors.
  * `GET /market/news` — returns the latest news articles from configured news APIs (e.g. NewsData.io and Marketaux). Clients can pass `?symbol=SPY` to focus the news on a particular ticker. Provider statuses indicate which services were used or are unavailable.
* **Mobile Client**: The `android_app/App.tsx` file contains a basic
  React Native application that polls the `/market/snapshot` endpoint
  every **3 seconds** and displays the returned scores, summaries and provider statuses in a
  mobile‑friendly format. Replace the `API_BASE` constant with the
  URL of your deployed API (e.g. a Vercel serverless function) before
  building the app. You can extend the client to also call `/market/news` if you enable news providers.

## Running the API Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start an Express server (you will need to wrap the exported router in
   an Express app). For example:

   ```ts
   import express from 'express';
   import marketRouter from './market (2)';

   const app = express();
   app.use(express.json());
   app.use('/api', marketRouter);
   app.listen(3000, () => console.log('Server running on port 3000'));
   ```

3. Set up environment variables for live data (optional):

   * `FINNHUB_API_KEY`: to fetch live quotes from Finnhub.
   * `ALPACA_API_KEY` and `ALPACA_SECRET_KEY`: to fetch daily bars from
     Alpaca.
   * `FRED_API_KEY`: to fetch Treasury yield data from FRED.

   If these keys are not provided, the API will fall back to synthetic
   data with sensible defaults.

## Running the Android App

1. Install the Expo CLI if you don’t have it yet:

   ```bash
   npm install -g expo-cli
   ```

2. Navigate to `android_app` and start the Expo development server:

   ```bash
   cd android_app
   expo start
   ```

3. Replace `API_BASE` in `App.tsx` with the URL of your deployed API
   (for example, a Vercel function endpoint). The mobile client makes a
   POST request to `${API_BASE}/market/snapshot` every **3 seconds** to
   refresh the data. If you extend the API to include additional endpoints (for example, `/market/news`) you can fetch them on the same interval or with their own timers.

4. Use the Expo Go app on your Android phone to scan the QR code and
   test the client. You can also run the app on an Android emulator
   via Android Studio.

## Deploying to Vercel

1. Create a new Vercel project and import this repository.
2. Set up environment variables in the Vercel project settings. At a minimum you should provide keys for any providers you wish to use:
   `FINNHUB_API_KEY`, `ALPACA_API_KEY`, `ALPACA_SECRET_KEY`, `FRED_API_KEY` for the default data sources.
   If you integrate additional market‑data or news services (e.g. Financial Modeling Prep, Alpha Vantage, Marketaux, NewsData.io), also add variables such as `FMP_API_KEY`, `ALPHAVANTAGE_API_KEY`, `MARKETAUX_API_KEY`, `NEWSDATA_API_KEY`.
3. Configure a serverless function at `/api/market/snapshot` that
   exports the Express handler from `market (2).ts`.
4. Deploy the project. Vercel will build the serverless function and
   expose the endpoint at `https://<your-vercel-project>.vercel.app/api/market/snapshot`.
5. Update the `API_BASE` constant in the mobile app to use your
   Vercel URL.

## License

This project is provided for demonstration purposes and comes with no
express warranty. Feel free to modify and adapt the code to suit your
own use case.
