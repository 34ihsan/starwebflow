# Starwebflow Project Guidelines

## CRITICAL: Database Safety in Production
**NEVER CAUSE DATA LOSS ON PRODUCTION.**

When generating instructions, deployment guides, or executing commands for deploying code to the live environment (Hostinger VPS / Production):
1. **DO NOT** suggest or run `npx prisma db push --accept-data-loss`.
2. **DO NOT** suggest or run `npx prisma migrate reset` or `npx prisma migrate dev` in production.
3. If running `npx prisma db push` on the server interactively and it warns about data loss, YOU MUST ABORT and instruct the user to ABORT.
4. To safely apply schema changes, always prioritize non-destructive schema additions. 
5. The user's live data (such as warmed up mailboxes, users, campaigns) is extremely precious. Always double-check Prisma migration commands before providing them to the user.
