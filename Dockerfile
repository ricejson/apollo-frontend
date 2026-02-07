# 1. 使用 Node 20
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖定义
COPY package.json yarn.lock ./

# 修改点：去掉 --production，安装所有依赖（包括 vite）
RUN yarn install --frozen-lockfile && yarn cache clean

# 复制源代码
COPY . .

# 执行构建（现在能找到 vite 了）
RUN npm run build

# --- 运行阶段 ---
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物 (请确认产物目录是 dist)
COPY --from=builder /app/dist /usr/share/nginx/html

ENV GEMINI_API_KEY=""

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]