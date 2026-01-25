# 階段 1: 編譯 TS 為 JS
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 使用 package.json 中定義的編譯指令
RUN npm run build:ts 

# 階段 2: 運行 Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# 修正：確保複製所有必要的 HTML 檔案，包含 launch.html
COPY --from=builder /app/index.html .
COPY --from=builder /app/launch.html . 
COPY --from=builder /app/calculator.html .
COPY --from=builder /app/test-Patient.json .
COPY --from=builder /app/js ./js
COPY --from=builder /app/css ./css
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]