# Video Player Monorepo

Proyek monorepo yang terdiri dari aplikasi frontend (Next.js) dengan video player canggih dan backend (NestJS) untuk streaming video.

## Struktur Proyek

```
/
├── apps/
│   ├── frontend/    # Next.js + TypeScript
│   └── backend/     # NestJS + TypeScript
├── packages/        # Shared modules dan types
├── .gitignore
├── README.md
└── turbo.json
```

## Fitur Utama

### Frontend
- Video player dengan kontrol play/pause, seek bar, mute/unmute, dan fullscreen
- Rendering video menggunakan Canvas API
- Watermark dan timestamp overlay
- Tampilan loading dan error state

### Backend
- Endpoint streaming video dengan dukungan byte-range request
- Penanganan file video lokal

### Packages
- `@repo/eslint-config`: Konfigurasi ESLint untuk semua aplikasi
- `@repo/typescript-config`: Konfigurasi TypeScript yang digunakan di seluruh monorepo

## Persyaratan

- Node.js (versi 18 atau lebih baru)
- npm

## Instalasi

1. Clone repositori:
```bash
git clone <repository-url>
cd video-player-monorepo
```

2. Install dependensi:
```bash
npm install
```

## Pengembangan

Menjalankan semua aplikasi dalam mode development:
```bash
npm run dev
```

Menjalankan aplikasi secara terpisah:
```bash
# Frontend
cd apps/frontend
npm run dev

# Backend
cd apps/backend
npm run start:dev
```

## Build

Membangun semua aplikasi:
```bash
npm run build
```

## Konfigurasi

Buat file `.env` di masing-masing direktori aplikasi berdasarkan contoh `.env.example`.

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=3000
VIDEO_PATH=assets/video.mp4
```

## Lisensi

MIT

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
