# Sử dụng image Node.js chính thức từ Docker Hub
FROM node:16

# Tạo thư mục app và thiết lập nó làm thư mục làm việc
WORKDIR /app

# Sao chép file package.json và yarn.lock để cài đặt dependencies
COPY package.json yarn.lock ./

# Cài đặt tất cả dependencies cho dự án
RUN yarn install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Điều hướng đến thư mục /api/rest
WORKDIR /app/api/rest

# Cài đặt dependencies cho thư mục /api/rest
RUN yarn install

# Mở cổng 3000 cho ứng dụng (hoặc cổng khác nếu ứng dụng của bạn sử dụng cổng khác)
EXPOSE 3000

# Lệnh để khởi động ứng dụng ở chế độ phát triển
CMD ["yarn", "start:dev"]
