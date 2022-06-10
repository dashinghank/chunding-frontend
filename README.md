# 專案名稱 Nuxt + Pixi JS

# 簡介

### 語言 : TypeScript

### 主旨 :

- 在 Nuxt 中加入 Pixi JS

# 快速開始

## 環境建立

- VS Code
- Yarn

## Nuxt 專案建置步驟

1. npx nuxi init <專案名稱>

2. yarn install

3. 安裝 nuxtjs/tailwindcss
   ```powershell
   yarn add --dev @nuxtjs/tailwindcss
   ```
4. 修改 nuxt.config.ts

5.

## 加入 Tailwind

1. ```powershell
   yarn add -D tailwindcss@latest postcss@latest autoprefixer@latest
   ```

2. ```powershell
   yarn tailwindcss init -p
   ```

3. 修改 tailwind.config.js

   ```javascript
   module.exports = {
     mode: "jit",
     content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
     theme: {
       extend: {},
     },
     variants: {
       extend: {},
     },
     plugins: [require("daisyui")],
   };
   ```

4. 建立 src/css/index.css 並加入

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. main.js 中加入

   ```javascript
   import "./css/index.css";
   ```

## 觀念

- 注意 vite scaffold 沒有內建 router 和 vuex，並且 vite 沒有 CLI 偵錯, 可考慮使用 typescript 編輯

- mode:”jit”，可以大幅減少建立後 css 的容量
