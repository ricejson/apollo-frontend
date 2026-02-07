# 使用官方 Node.js 镜像作为构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package.json yarn.lock ./

# 修改点：使用 yarn 安装依赖
# --frozen-lockfile 相当于 npm ci，确保版本严格锁定
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 后面保持不变...
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
ENV GEMINI_API_KEY=""
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]