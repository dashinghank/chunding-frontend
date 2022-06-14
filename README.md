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

   ```typescript
   export default defineNuxtConfig({
     modules: ["@nuxtjs/tailwindcss"],
   });
   ```

5. 加入 tailwind.config.js

   ```powershell
   npx tailwindcss init
   ```

6. 建立 assets/css/tailwind.css

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

7. 建立 pages, 等同於 vue3 router

8. 加入 PIXI
   ```powershell
   yarn add pixi.js
   ```
9. 在 <script> 加入
   ```typescript
   import * as PIXI from "pixi.js";
   ```

## PIXIJS 使用說明

#### Application

1. ```typescript
   const app = new PIXI.Application({ width: 256, height: 256 });
   document.body.appendChild(app.view);
   ```

## 觀念

- 帶補充
