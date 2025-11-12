# Mockel - Mock Data Generator

Professional mock data generator with schema-based data creation, file upload support, and API mocking capabilities.

## ✨ Features

- 🎯 **Schema Builder**: Visual interface for creating complex data schemas
- 📁 **File Upload Support**: Complete file metadata management with validation
- 🔧 **Professional UI**: Modern, clean interface with responsive design
- 🚀 **High Performance**: Built with Bun for ultra-fast development
- 📊 **Real-time Generation**: Generate mock data on-demand with various data types
- 💾 **Import/Export**: Save and load schema configurations
- 🌐 **API Mocking**: Dynamic mock endpoints with CRUD operations

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mockel

# Install dependencies
bun install

# Copy environment configuration
cp .env.example .env

# Start development server
bun run dev
```

## ⚙️ Configuration

### Port Configuration

The application uses environment variables for configuration. You can change the port by modifying the `.env` file:

```env
# Server Configuration
PORT=5000
HOST=localhost
```

### Available Environment Variables

```env
# Server Configuration
PORT=3001                    # Server port
HOST=localhost              # Server host
NODE_ENV=development        # Environment (development/production)

# API Configuration
API_VERSION=1.0.0           # API version

# Upload Configuration
MAX_FILE_SIZE=52428800      # Max file size in bytes (50MB)
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
```

### Cara Mengganti Port

1. **Edit file .env** (Recommended):
   ```env
   PORT=8080
   ```

2. **Command line flag**:
   ```bash
   bun --port 8080 --hot src/index.tsx
   ```

3. **Environment variable**:
   ```bash
   PORT=8080 bun run dev
   ```

4. **Package.json scripts**:
   ```bash
   bun run dev:8080
   ```

## 📋 Fitur

- **Dynamic Schema Builder**: Buat schema data dengan field yang dapat dikonfigurasi
- **Multiple Data Types**: Dukungan berbagai tipe data (String, Number, Boolean, Object, Array)
- **LLM-Powered Types**: Tipe data khusus seperti Person Name, Product Name, Address, Email, dll
- **Real-time Data Generation**: Generate mock data secara real-time berdasarkan schema
- **RESTful Mock Endpoints**: Endpoint yang dapat diakses publik dengan operasi CRUD
- **Project Management**: Kelola multiple mock API projects
- **Data Constraints**: Atur constraints untuk setiap field (min/max, length, format, dll)
- **Nested Schema Support**: Support untuk object dan array dengan nested schema

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime terinstall

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mockel

# Install dependencies
bun install

# Start development server
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📖 Cara Penggunaan

### 1. Membuat Project Baru

1. Buka dashboard di `http://localhost:3000`
2. Klik "Create First Mock API" atau tombol "New Project"
3. Isi nama project dan base endpoint (misal: `/api/products`)
4. Klik "Save Project"

### 2. Mengkonfigurasi Schema

1. Di halaman project, gunakan Schema Builder untuk menambahkan fields
2. Klik "Add Field" untuk setiap field yang ingin ditambahkan
3. Pilih tipe data dan atur constraints:
   - **String**: min/max length
   - **Number**: min/max value, decimal places
   - **Date**: start/end date range
   - **Array**: min/max items
   - **Object/Array**: tambahkan nested fields

### 3. Generate Mock Data

1. Setelah schema selesai, scroll ke bagian "Generate Mock Data"
2. Atur jumlah record yang ingin digenerate
3. Pilih apakah ingin include null values
4. Klik "Generate X Records"

### 4. Mengakses Mock Endpoint

Setelah data digenerate, endpoint dapat diakses di:
```
GET http://localhost:3000/api/mock/{projectId}/{endpoint}
```

Contoh:
```
GET http://localhost:3000/api/mock/abc123/products
```

### 5. API Operations

Mock endpoint mendukung operasi HTTP standar:

- **GET**: Ambil semua data
- **POST**: Tambah data baru
- **PUT**: Update data existing
- **DELETE**: Hapus semua data

## 🎯 Tipe Data yang Didukung

### Basic Types
- `string`: Text umum dengan configurable length
- `number`: Angka dengan range dan decimal
- `boolean`: True/False values
- `object`: Object dengan nested schema
- `array`: Array dengan configurable item count

### LLM-Powered Types
- `person_name`: Nama orang realistis (John Smith, Jane Doe)
- `product_name`: Nama produk (iPhone 15, MacBook Pro)
- `address`: Alamat lengkap realistis
- `email`: Email addresses yang valid
- `image_url`: URL gambar dari placeholder service
- `paragraph`: Text paragraf yang bermakna
- `uuid`: UUID strings
- `date`: Tanggal dengan configurable range
- `price`: Harga dengan format mata uang

## 🏗️ Architecture

### Backend (Bun)
- **RESTful API**: Built with Bun's serve function
- **In-memory Storage**: Data disimpan di memory (untuk production dapat diganti dengan database)
- **Dynamic Routes**: Support untuk parameterized endpoints
- **Data Generation Service**: Local mock data generator dengan LLM integration capability

### Frontend (React + TypeScript)
- **React Hook Form**: Form handling dengan validation
- **Zod**: Schema validation
- **Tailwind CSS**: Styling
- **Radix UI**: Reusable components
- **Lucide React**: Icons

### Project Structure

```
src/
├── components/
│   ├── ui/                    # Base UI components
│   ├── dashboard/             # Dashboard components
│   └── schema-builder/        # Schema builder components
├── hooks/                     # Custom React hooks
├── services/                  # Business logic services
├── types/                     # TypeScript definitions
├── data/                      # Data storage utilities
├── index.tsx                  # Server entry point
├── App.tsx                    # Main React component
└── index.html                 # HTML template
```

## 🔧 API Endpoints

### Projects API
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Data Generation
- `POST /api/generate` - Generate mock data

### Mock Endpoints (Dynamic)
- `GET /api/mock/:projectId/*` - Get mock data
- `POST /api/mock/:projectId/*` - Add new record
- `PUT /api/mock/:projectId/*` - Update record
- `DELETE /api/mock/:projectId/*` - Clear all data

### Utilities
- `GET /api/health` - Health check

## 🔌 Contoh Penggunaan

### Membuat Product API

1. Create project dengan nama "E-commerce Products" dan endpoint `/api/products`
2. Tambahkan fields:
   - `id` (UUID)
   - `product_name` (Product Name)
   - `price` (Price, min: 10000, max: 5000000)
   - `description` (Paragraph, min words: 10, max words: 50)
   - `in_stock` (Boolean)
   - `categories` (Array, min items: 1, max items: 3, item type: String)
   - `created_at` (Date, start date: 2023-01-01)

3. Generate 100 records
4. Access endpoint: `http://localhost:3000/api/mock/{projectId}/products`

### Response Example:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "product_name": "iPhone 15 Pro",
      "price": 15999000,
      "description": "This innovative solution transforms the way businesses operate in the digital age. Our cutting-edge technology provides unparalleled performance and reliability...",
      "in_stock": true,
      "categories": ["electronics", "mobile", "premium"],
      "created_at": "2024-03-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "count": 100,
    "endpoint": "/api/products",
    "projectId": "abc123",
    "generatedAt": "2024-03-15T12:00:00.000Z"
  }
}
```

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
# Database connection (untuk production)
DATABASE_URL=your_database_url
# LLM API Key (untuk advanced generation)
LLM_API_KEY=your_llm_api_key
```

### Build & Deploy
```bash
# Build untuk production
bun run build

# Start production server
bun run start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Features

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real LLM integration (OpenAI, Anthropic)
- [ ] Data export (CSV, JSON, SQL)
- [ ] API authentication
- [ ] Request/response mocking
- [ ] Performance analytics
- [ ] Team collaboration
- [ ] Advanced data relationships
- [ ] Custom data generators# mockel
