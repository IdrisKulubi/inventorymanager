# Inventory Manager

A modern inventory management system built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 📦 Real-time inventory tracking
- 🔍 Advanced search and filtering
- 📊 Analytics dashboard
- 👥 User role management
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Database:** Neon
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IdrisKulubi/inventorymanager.git
cd inventorymanager
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
   
```bash
DATABASE_URL="your-database-url"
# Add other necessary environment variables which is just the dataabase url
```
I m using neon db  so just create an account on Neon and create a project then copy the database url.

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
inventorymanager/
├── app/
│   ├── (dashboard)/
│   ├── (inventory)/
│   ├── (reports)/
│   ├── (notifications)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── ui/
│   └── shared/
├── lib/
├── types/
└── public/
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [kulubidris@gmail.com](mailto:kulubiidris@gmail.com.com) or open an issue in the repository.
