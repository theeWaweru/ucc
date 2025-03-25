# Project File Structure

Generated on: 2025-03-25T13:36:49.205Z

```
└── app
    ├── about
    │   ├── page.tsx
    ├── admin
    │   ├── analytics
    │   │   ├── page.tsx
    │   ├── blog
    │   │   ├── edit
    │   │   │   ├── [id]
    │   │   │   │   └── page.tsx
    │   │   ├── new
    │   │   │   ├── page.tsx
    │   │   ├── page.tsx
    │   ├── dashboard
    │   │   ├── page.tsx
    │   ├── events
    │   │   ├── edit
    │   │   │   ├── [id]
    │   │   │   │   └── page.tsx
    │   │   ├── new
    │   │   │   ├── page.tsx
    │   │   ├── page.tsx
    │   ├── payments
    │   │   ├── page.tsx
    │   ├── prayer
    │   │   ├── [id]
    │   │   │   ├── page.tsx
    │   │   ├── follow-up
    │   │   │   ├── page.tsx
    │   │   ├── statistics
    │   │   │   ├── page.tsx
    │   │   ├── page.tsx
    │   ├── reports
    │   │   ├── payments
    │   │   │   └── page.tsx
    │   ├── sermons
    │   │   ├── edit
    │   │   │   ├── [id]
    │   │   │   │   └── page.tsx
    │   │   ├── new
    │   │   │   ├── page.tsx
    │   │   ├── page.tsx
    │   ├── settings
    │   │   ├── page.tsx
    │   ├── testing
    │   │   ├── prayer
    │   │   │   └── page.tsx
    │   ├── users
    │   │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    ├── api
    │   ├── admin
    │   │   ├── analytics
    │   │   │   ├── events
    │   │   │   │   ├── route.ts
    │   │   │   ├── pageviews
    │   │   │   │   └── route.ts
    │   │   ├── blog
    │   │   │   ├── [id]
    │   │   │   │   ├── route.ts
    │   │   │   ├── route.ts
    │   │   ├── events
    │   │   │   ├── route.ts
    │   │   ├── payments
    │   │   │   ├── route.ts
    │   │   ├── reports
    │   │   │   ├── payments
    │   │   │   │   └── route.ts
    │   │   ├── sermons
    │   │   │   ├── route.ts
    │   │   ├── setup
    │   │   │   ├── route.ts
    │   │   ├── setup-helper
    │   │   │   ├── route.ts
    │   │   ├── users
    │   │   │   └── route.ts
    │   ├── analytics
    │   │   ├── track
    │   │   │   └── route.ts
    │   ├── auth
    │   │   ├── [...nextauth]
    │   │   │   └── auth.ts
    │   │   │   └── route.ts
    │   ├── blog
    │   │   ├── [slug]
    │   │   │   ├── route.ts
    │   │   ├── route.ts
    │   ├── cloudinary
    │   │   ├── signature
    │   │   │   └── route.ts
    │   ├── contact
    │   │   ├── route.ts
    │   ├── cron
    │   │   ├── sync-youtube
    │   │   │   └── route.ts
    │   ├── events
    │   │   ├── route.ts
    │   ├── livestream
    │   │   ├── route.ts
    │   ├── mpesa
    │   │   ├── callback
    │   │   │   ├── route.ts
    │   │   ├── stkpush
    │   │   │   └── route.ts
    │   ├── prayer
    │   │   ├── [id]
    │   │   │   ├── follow-up
    │   │   │   │   ├── route.ts
    │   │   │   ├── route.ts
    │   │   ├── follow-up
    │   │   │   ├── route.ts
    │   │   ├── statistics
    │   │   │   ├── route.ts
    │   │   ├── route.ts
    │   ├── sermons
    │   │   ├── [id]
    │   │   │   ├── feature
    │   │   │   │   ├── route.ts
    │   │   │   ├── route.ts
    │   │   ├── latest
    │   │   │   ├── route.ts
    │   │   ├── route.ts
    │   ├── youtube
    │   │   └── latest
    │   │       ├── route.ts
    │   │   └── live
    │   │       ├── route.js
    │   │   └── sync
    │   │       ├── route.ts
    │   │   └── video
    │   │       └── [id]
    │   │           └── route.ts
    ├── auth
    │   ├── sign-in
    │   │   └── page.tsx
    ├── blog
    │   ├── [slug]
    │   │   ├── metadata.ts
    │   │   ├── page.tsx
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── calendar
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── contact
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── events
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── give
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── prayer
    │   ├── page.tsx
    ├── sermons
    │   ├── [id]
    │   │   ├── metadata.ts
    │   │   ├── page.tsx
    │   ├── metadata.ts
    │   ├── page.tsx
    ├── auth.ts
    ├── favicon.ico
    ├── globals.css
    ├── layout.tsx
    ├── page.tsx
└── components
    ├── admin
    │   ├── PrayerFollowUpSystem.tsx
    │   ├── PrayerNavigation.tsx
    │   ├── PrayerStatsDashboard.tsx
    │   ├── PrayerSystemTester.tsx
    │   ├── YouTubeSync.tsx
    ├── analytics
    │   ├── PageViewTracker.tsx
    ├── context
    │   ├── AuthContext.tsx
    ├── forms
    │   ├── EnhancedPrayerRequestForm.tsx
    │   ├── EventForm.tsx
    │   ├── ImageUpload.tsx
    │   ├── PrayerRequestForm.tsx
    │   ├── RichTextEditor.tsx
    ├── layout
    │   ├── AdminLayout.tsx
    │   ├── Footer.tsx
    │   ├── Header.tsx
    │   ├── MainLayout.tsx
    ├── sermons
    │   ├── LatestSermons.tsx
    ├── shared
    │   ├── LivestreamBanner.tsx
    ├── ui
    │   ├── ShareButtons.tsx
    ├── youtube
    │   ├── EnhancedYouTubeEmbed.tsx
    │   ├── VideoEmbed.tsx
    │   ├── VideoGrid.tsx
    │   ├── YouTubeFallback.tsx
    ├── SEO.tsx
└── lib
    ├── analytics
    │   ├── index.ts
    ├── api
    │   ├── sheets
    │   │   ├── index.ts
    │   ├── api-utils.ts
    │   ├── mpesa.ts
    │   ├── youtube.ts
    ├── cloudinary
    │   ├── index.ts
    ├── db
    │   ├── connect.ts
    ├── email
    │   ├── index.ts
    │   ├── prayer-notifications.ts
    ├── api-helper.ts
    ├── metadata.ts
└── models
    ├── Admin.ts
    ├── Blog.ts
    ├── Event.ts
    ├── EventTracking.ts
    ├── index.ts
    ├── PageView.ts
    ├── Payment.ts
    ├── PrayerRequest.ts
    ├── Sermon.ts
└── public
└── scripts
    ├── directory-check.js
    ├── email-test.js
    ├── env-manager.js
    ├── error-tracker.js
    ├── setup-admin.js
    ├── sheets-test.js
    ├── simple-connect.js
└── styles
    ├── admin.module.css
└── .env
└── .env.local
└── .gitignore
└── Client-Components.md
└── error-report.md
└── middleware.ts
└── next-env.d.ts
└── next.config.mjs
└── package-lock.json
└── package.json
└── postcss.config.mjs
└── privacy-policy.txt
└── README.md
└── tsconfig.json
└── tsconfig.tsbuildinfo
```

## Statistics

- Total files: 149
- Total directories: 106
