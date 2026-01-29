# Airtable Product API - Cloudflare Worker

A serverless API built with Cloudflare Workers to interact with your Airtable Products and Variants tables.

## Airtable Configuration

- **Base ID:** `appR3SXKcn3s0DI3A`
- **Products Table ID:** `tbltxupoBniwctuov`
- **Variants Table ID:** `tblokW8iyXD1smKx6`

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Airtable API Key Secret

```bash
wrangler secret put AIRTABLE_API_KEY
```

### 4. Deploy

```bash
wrangler deploy
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product(s) |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

### Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/variants` | List all variants |
| GET | `/variants/:id` | Get single variant |
| POST | `/variants` | Create variant(s) |
| PATCH | `/variants/:id` | Update variant |
| DELETE | `/variants/:id` | Delete variant |

## Query Parameters

- `filter` - Airtable formula to filter records
- `maxRecords` - Maximum number of records to return
- `sort` - Field name to sort by
- `direction` - Sort direction (asc or desc)
- `pageSize` - Records per page (max 100)
- `offset` - Pagination offset

## Examples

### List all active products

```bash
curl "https://your-worker.workers.dev/products?filter={Status}='Active'"
```

### Create a new product

```bash
curl -X POST "https://your-worker.workers.dev/products" \
  -H "Content-Type: application/json" \
  -d '{
    "Product Name": "New Product",
    "SKU": "SKU-001",
    "Price": 29.99,
    "Category": "Electronics",
    "Status": "Draft"
  }'
```

### Create a variant

```bash
curl -X POST "https://your-worker.workers.dev/variants" \
  -H "Content-Type: application/json" \
  -d '{
    "Variant Name": "Small - Blue",
    "Product ID": "rec123456",
    "Size": "S",
    "Color": "Blue",
    "Variant SKU": "SKU-001-S-BLU",
    "Stock Quantity": 100,
    "In Stock": true
  }'
```

### Update a product

```bash
curl -X PATCH "https://your-worker.workers.dev/products/recXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"Status": "Active"}'
```

### Delete a product

```bash
curl -X DELETE "https://your-worker.workers.dev/products/recXXXXXX"
```

## Product Fields

| Field | Type | Description |
|-------|------|-------------|
| Product Name | Text | Name of the product |
| Description | Long Text | Product description |
| SKU | Text | Stock keeping unit |
| Price | Currency | Product price |
| Category | Select | Electronics, Clothing, Home & Garden, Sports, Other |
| Status | Select | Active, Draft, Archived |
| Image URL | URL | Product image link |

## Variant Fields

| Field | Type | Description |
|-------|------|-------------|
| Variant Name | Text | Name of the variant |
| Product ID | Text | Reference to parent product |
| Size | Select | XS, S, M, L, XL, XXL |
| Color | Text | Color name |
| Variant SKU | Text | Variant-specific SKU |
| Price Modifier | Currency | Price adjustment from base |
| Stock Quantity | Number | Available inventory |
| In Stock | Checkbox | Stock availability flag |

## License

MIT
