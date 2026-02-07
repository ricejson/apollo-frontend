# 1. 修改点：将 node:18 改为 node:20
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖定义文件
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# --- 运行阶段 ---
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物（注意：请确认你的构建输出目录是 dist 还是 build）
COPY --from=builder /app/dist /usr/share/nginx/html

# 环境变量
ENV GEMINI_API_KEY=""

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]