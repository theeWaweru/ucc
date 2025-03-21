# Project Error Report

Generated on: 2025-03-19T14:45:35.829Z

## Build Status

❌ Build failed

```
Failed to compile.

./components/ui/ShareButtons.tsx
Error:   [31mx[0m Unexpected token `div`. Expected jsx identifier
    ,-[[36;1;4mC:\Users\User\Work\uhai_center\components\ui\ShareButtons.tsx[0m:65:1]
 [2m62[0m |   };
 [2m63[0m |   
 [2m64[0m |   return (
 [2m65[0m |     <div className={`flex flex-wrap gap-2 items-center ${className}`}>
    : [35;1m     ^^^[0m
 [2m66[0m |       <span className="text-gray-600 mr-1">Share:</span>
 [2m67[0m |       
 [2m67[0m |       {shareLinks.map(link => (
    `----

Caused by:
    Syntax Error

Import trace for requested module:
./components/ui/ShareButtons.tsx
./app/blog/[slug]/page.tsx

./app/api/admin/events/route.ts
Module not found: Can't resolve '@/models/Event'

https://nextjs.org/docs/messages/module-not-found

./app/api/admin/payments/route.ts
Module not found: Can't resolve '@/models/Payment'

https://nextjs.org/docs/messages/module-not-found

./app/api/admin/reports/payments/route.ts
Module not found: Can't resolve '@/models/Payment'

https://nextjs.org/docs/messages/module-not-found

./app/api/admin/sermons/route.ts
Module not found: Can't resolve '@/models/Sermon'

https://nextjs.org/docs/messages/module-not-found

uncaughtException [Error: EPERM: operation not permitted, open 'C:\Users\User\Work\uhai_center\.next\trace'] {
  errno: -4048,
  code: 'EPERM',
  syscall: 'open',
  path: 'C:\\Users\\User\\Work\\uhai_center\\.next\\trace'
}

```

## TypeScript Status

❌ Found 0 TypeScript errors

## Linting Status

❌ Linting failed

```
 ⚠ If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config

```

## Dependency Status

✅ No dependency issues found

### Outdated Packages

| Package | Current | Wanted | Latest |
|---------|---------|--------|--------|
| @types/node | 20.17.24 | 20.17.24 | 22.13.10 |
| googleapis | 108.0.1 | 108.0.1 | 146.0.0 |

