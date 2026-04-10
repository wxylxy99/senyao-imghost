# 图床 (Image Bed) - Cloudflare R2

## 1. Concept & Vision

一个简洁优雅的图片托管服务，融合现代极简主义与功能性。用户可以拖拽上传图片，即时获取 Markdown/URL 链接，支持图库浏览。整体感觉像是一个私人云相册，轻盈、快速、私密。

## 2. Design Language

### Aesthetic Direction
现代极简主义 + 柔和的玻璃态（Glassmorphism）。灵感来自苹果的毛玻璃设计，但更加温暖和有机。

### Color Palette
```
--bg-primary: #f8f7f4 (温暖米白)
--bg-secondary: #ffffff
--bg-glass: rgba(255, 255, 255, 0.7)
--text-primary: #1a1a1a
--text-secondary: #6b6b6b
--accent: #e85d04 (活力橙)
--accent-hover: #dc4c00
--border: rgba(0, 0, 0, 0.08)
--shadow: rgba(0, 0, 0, 0.04)
--success: #10b981
--error: #ef4444
```

### Typography
- Headings: "Outfit" (Google Fonts) - 现代几何无衬线
- Body: "Inter" (Google Fonts) - 清晰易读
- Code/URLs: "JetBrains Mono" - 等宽字体

### Spatial System
- Base unit: 8px
- Card padding: 24px
- Grid gap: 16px
- Border radius: 16px (cards), 12px (buttons), 8px (inputs)

### Motion Philosophy
- 入场: fade + translateY(10px), 300ms ease-out, staggered 50ms
- 悬停: scale 1.02, shadow lift, 200ms ease-out
- 上传进度: smooth progress bar, 150ms
- 成功反馈: checkmark animation + confetti burst (subtle)

### Visual Assets
- Icons: Lucide Icons (stroke-width: 1.5)
- 拖拽区域: 虚线边框 + 渐变背景动画
- 空状态: 简约插图 (SVG)

## 3. Layout & Structure

### Page Structure
```
┌─────────────────────────────────────────┐
│  Header: Logo + Title + 主题切换        │
├─────────────────────────────────────────┤
│  Upload Zone (主要交互区域)              │
│  - 拖拽上传                             │
│  - 点击选择                             │
│  - 即时预览                             │
├─────────────────────────────────────────┤
│  Link Output (上传成功后显示)            │
│  - Markdown / URL / HTML 切换           │
│  - 一键复制                            │
├─────────────────────────────────────────┤
│  Gallery Grid (图片网格)                 │
│  - 响应式网格 (2-4列)                   │
│  - 图片卡片: 预览 + 操作                │
│  - 分页/无限滚动                        │
└─────────────────────────────────────────┘
```

### Responsive Strategy
- Mobile (< 640px): 单列网格，上传区域全宽
- Tablet (640-1024px): 2列网格
- Desktop (> 1024px): 3-4列网格，最大宽度 1200px

## 4. Features & Interactions

### Core Features

**图片上传**
- 拖拽上传: 拖入时边框变实线 + 背景高亮
- 点击选择: 支持多选
- 即时预览: 上传前显示缩略图
- 支持格式: JPG, PNG, GIF, WebP, AVIF
- 文件大小限制: 10MB (可配置)

**链接生成**
- 上传成功后自动生成多种格式链接
- Markdown: `![filename](url)`
- URL: 直接图片链接
- HTML: `<img src="url">`
- 点击复制，toast 提示

**图库浏览**
- 网格展示所有已上传图片
- 点击查看大图 (lightbox)
- 复制链接按钮
- 删除功能

### States

**Empty State**
- 友好的空状态插图
- 引导文字: "拖拽图片到这里，或点击选择"

**Loading State**
- 上传进度条
- 骨架屏 (skeleton) 用于图库加载

**Error State**
- 红色边框 + 错误图标
- 清晰的错误信息
- 重试按钮

## 5. Component Inventory

### Upload Zone
- Default: 虚线边框，中心图标 + 文字
- Hover: 边框颜色加深，背景微亮
- Drag-over: 边框实线，背景渐变动画，图标放大
- Uploading: 进度条 + 百分比
- Error: 红色边框，错误信息

### Image Card
- Default: 圆角图片 + 底部信息栏
- Hover: 向上微微抬起，显示操作按钮 (复制、删除)
- Selected: 蓝色边框

### Link Output Box
- Tab bar: Markdown / URL / HTML
- Code block with copy button
- Copied! 确认动画

### Lightbox
- 全屏黑色遮罩
- 居中大图
- 底部工具栏: 复制链接、删除、关闭
- ESC 关闭

### Toast Notification
- 底部中央弹出
- 成功: 绿色 + checkmark
- 错误: 红色 + x icon
- 自动消失 3s

## 6. Technical Approach

### Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │ ──── │ Cloudflare   │ ──── │    R2       │
│  (HTML/CSS) │      │   Worker     │      │   Bucket    │
└─────────────┘      └──────────────┘      └─────────────┘
```

### Frontend
- 单 HTML 文件，内联 CSS/JS
- 原生 JavaScript (无框架依赖)
- Fetch API 与 Worker 通信

### Backend (Cloudflare Worker)
Endpoints:
- `POST /upload` - 上传图片到 R2
- `GET /images` - 列出所有图片
- `DELETE /images/:key` - 删除图片

### API Design

**POST /upload**
Request: `multipart/form-data` with `file` field
Response:
```json
{
  "success": true,
  "data": {
    "key": "abc123.jpg",
    "url": "https://your-domain.com/images/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 102400,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**GET /images**
Response:
```json
{
  "success": true,
  "data": [
    {
      "key": "abc123.jpg",
      "url": "https://your-domain.com/images/abc123.jpg",
      "filename": "abc123.jpg",
      "size": 102400,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Data Model
R2 Bucket stored objects:
- Key: 随机 UUID + original extension
- Metadata: filename, uploadedAt

### Environment Variables (Worker)
- `R2_BUCKET_NAME`: R2 bucket 名称
- `CUSTOM_DOMAIN`: 自定义域名 (可选)
