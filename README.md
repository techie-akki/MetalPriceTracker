# Metal Price Tracker

A React Native + TypeScript app for tracking live prices of gold, silver, platinum, and palladium.

The home screen acts as the landing page with gradient glass-style tiles, cached sample data for instant rendering, and user-triggered live refreshes. The detail screen adds quote metadata plus optional hourly history when you choose to load it.

## Screenshots

<details open>
<summary><strong>App preview</strong></summary>
<br />

<table>
  <tr>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2022.59.43.png" width="240" alt="Screenshot 1" /></td>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2022.59.53.png" width="240" alt="Screenshot 2" /></td>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.00.png" width="240" alt="Screenshot 3" /></td>
  </tr>
  <tr>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.11.png" width="240" alt="Screenshot 4" /></td>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.29.png" width="240" alt="Screenshot 5" /></td>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.37.png" width="240" alt="Screenshot 6" /></td>
  </tr>
  <tr>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.42.png" width="240" alt="Screenshot 7" /></td>
    <td><img src="assets/Simulator%20Screenshot%20-%20iPhone%2017%20Pro%20-%202026-04-28%20at%2023.00.52.png" width="240" alt="Screenshot 8" /></td>
    <td></td>
  </tr>
</table>
</details>

## Stack

- React Native 0.85
- TypeScript
- React Navigation
- TanStack Query
- Axios
- `react-native-config`
- `react-native-mmkv` (Nitro Modules)
- MetalpriceAPI live pricing

## Environment setup

### env notes

- env file is in env.zip at root directory. Extract it and create a .env file copy paste api key and baseurl into it.

1. Copy `.env.example` to `.env`
2. Add your MetalpriceAPI key

```sh
METAL_PRICE_API_KEY=your_metalpriceapi_key_here
METAL_PRICE_API_BASE_URL=https://api.metalpriceapi.com/v1
```

## Install

```sh
npm install
```

## iOS native dependencies

```sh
bundle install
bundle exec pod install
```

## Run

Start Metro:

```sh
npm start
```

Run Android:

```sh
npm run android
```

Run iOS:

```sh
npm run ios
```

## Included features

- Live pricing for `XAU`, `XAG`, `XPT`, `XPD`
- Gradient glassmorphism tiles
- 24K per-gram price on landing tiles
- Cached sample data for instant first paint
- Pull-to-refresh landing screen
- Detail screen with:
  - current price
  - estimated open
  - estimated previous close
  - estimated day high / low
  - bid / ask
  - exchange
  - quote timestamps
  - optional live hourly history
- Typed React Navigation setup
- Environment-based API key handling

## Quota behavior

- The app tracks a local live-request budget of 100 requests using MMKV.
- One live quote fetch is attempted automatically on first launch.
- After first launch, live quote refreshes are user-triggered from the home screen and detail screen.
- Detail screen history is loaded only when the user requests it.
- The 100-request budget is local to the app install/device, not globally enforced per API key.

## Data notes

- MetalpriceAPI supplies the live spot quote used by the app.
- Open, previous close, high, and low are derived app-side estimates, not direct exchange session fields.

## Deployment notes

- Configure `METAL_PRICE_API_KEY` and `METAL_PRICE_API_BASE_URL` in your release environment.
- Base URL defaults to `https://api.metalpriceapi.com/v1` when `METAL_PRICE_API_BASE_URL` is not set.
- Revisit request-budget rules if you need server-side or API-key-wide quota enforcement.
- Re-run `bundle exec pod install` after native dependency changes on iOS.

## Test

```sh
npm test
```

## APK artifact

This repo includes a prebuilt Android APK inside the `artifact/` folder:

- `artifact/MetalPriceTracker.apk`

