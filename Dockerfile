# 使用轻量级 Node 运行环境
FROM node:18-alpine

# 安装一个简单的静态资源服务器
RUN npm install -g serve

# 设置工作目录
WORKDIR /app

# 复制依赖并安装
COPY package*.json ./
RUN npm install

# 复制所有文件并构建
COPY . .
RUN npm run build

# 暴露端口（serve 默认使用 3000，也可以根据需要修改）
EXPOSE 3000

# 运行生产环境构建后的目录
# 假设你的构建输出目录是 dist (Vite 默认)
CMD ["serve", "-s", "dist", "-l", "3000"]