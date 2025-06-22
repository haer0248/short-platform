# 很簡單ㄉ短網址
基於 NodeJS

# 安裝
```
npm install
```

# 路徑
```
/ 
沒東西

/:shortCode
導向到目標網頁

/dashboard
儀表板

/dashboard/analytics
點擊分析
```

# 使用
- 修改 `.env.sample` 為 `.env`
- 修改內容

```
#正式環境請輸入 production
NODE_ENV=

# 自訂端口
PORT=8080

# 目前僅支援 MongoDB
MONGODB_URI=mongodb://localhost:27017/shortlinks

# 自行生成一個存放於 SESSION 的密鑰
# https://tools.haer0248.me/rand
SESSION_SECRET=

# 因為使用 Discord 登入，請自行設定 OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://127.0.0.1:8080/auth/discord/callback

# 是否啟用註冊功能
ENABLE_REGISTER=true
```

# 啟動！

```
npm run start
```

記得 MongoDB 要開。
開好之後進 `http://127.0.0.1:8080/dashboard` 登入就可以用ㄌ。

# 能動 ✅

因為只是想要自己用，所以就沒特別寫什麼東西。
想要改的話就自己處理 (茶)