# Prisma Setup

Run these commands after setting up your PostgreSQL database:

1. Set `DATABASE_URL` in `.env`
2. `pnpm prisma migrate dev --name add-employees-table`
3. `pnpm prisma db seed`
