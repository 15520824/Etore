# Sử dụng image Node.js chính thức từ Docker Hub
FROM node:16

# Tạo thư mục app và thiết lập nó làm thư mục làm việc
WORKDIR /app

# Sao chép file package.json và yarn.lock để cài đặt dependencies
COPY package.json yarn.lock ./

# Cài đặt tất cả dependencies bao gồm cả graphql-let
RUN yarn install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Chạy lệnh codegen nếu cần thiết
RUN yarn codegen

# Chạy lệnh build cho shop gql
RUN yarn build:shop-gql

# Mở cổng 3000 cho ứng dụng
EXPOSE 3000

# Lệnh để khởi động ứng dụng
CMD ["yarn", "start:shop-gql"]  