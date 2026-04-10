# SenYao 资源管理系统

集图床、资源中心于一体的资源管理系统，基于 Cloudflare R2 存储。

## 功能特点

- **图床** - 图片上传，支持 Markdown/URL/HTML 链接格式
- **资源中心** - 图片、文档混合管理，支持分类筛选
- **主题切换** - 浅色/深色模式
- **响应式设计** - 适配桌面和移动端
- **可扩展架构** - 便于后续添加更多功能

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **路由**: React Router 6
- **状态管理**: Zustand
- **图标**: Lucide React
- **后端**: Cloudflare Workers + R2

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署

### 1. 创建 R2 Bucket

在 Cloudflare Dashboard > R2 > Create Bucket，命名如 `imghost`。

### 2. 配置 Wrangler

确保 `wrangler.toml` 中的 bucket 名称正确：

```toml
[[r2_buckets]]
binding = "IMG_BUCKET"
bucket_name = "imghost"
```

### 3. 部署

```bash
# 登录 Cloudflare
wrangler login

# 部署
wrangler deploy
```

## 项目结构

```
├── src/
│   ├── components/      # 公共组件
│   │   ├── Layout/      # 布局组件
│   │   ├── UploadZone/  # 上传组件
│   │   ├── ImageCard/   # 图片卡片
│   │   ├── FileCard/    # 文件卡片
│   │   ├── Lightbox/    # 预览弹窗
│   │   └── Toast/       # 提示组件
│   ├── pages/           # 页面
│   │   ├── Home/        # 首页
│   │   ├── ImageBed/    # 图床
│   │   └── ResourceCenter/ # 资源中心
│   ├── hooks/           # 自定义 Hooks
│   ├── services/        # API 服务
│   ├── stores/          # 状态管理
│   └── styles/          # 全局样式
├── worker/
│   └── index.ts         # Cloudflare Worker
├── public/
├── package.json
├── vite.config.ts
└── wrangler.toml
```

## API 端点

| 方法   | 路径              | 描述         |
|--------|-------------------|--------------|
| POST   | `/upload`         | 上传文件     |
| GET    | `/files`         | 列出所有文件 |
| GET    | `/files/:key`    | 获取文件信息 |
| DELETE | `/files/:key`    | 删除文件     |

## License

MIT
