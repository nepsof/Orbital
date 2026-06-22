frontend/
│
├── app/                     (Next.js App Router)
│   ├── layout.tsx
│   ├── page.tsx            (Dashboard Home)
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── dashboard.module.css
│   │
│   ├── files/
│   │   ├── page.tsx        (File Explorer UI)
│   │   ├── files.module.css
│   │
│   ├── analytics/
│   │   ├── page.tsx
│   │   ├── analytics.module.css
│   │
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── settings.module.css
│   │
│   └── logs/
│       ├── page.tsx
│       ├── logs.module.css
│
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── Navbar.tsx
│   │   ├── layout.module.css
│   │
│   ├── files/
│   │   ├── FileCard.tsx
│   │   ├── FileList.tsx
│   │   ├── FileActions.tsx
│   │   ├── file-components.module.css
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── StorageChart.tsx
│   │   ├── dashboard-components.module.css
│   │
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Loader.tsx
│   │   ├── Toast.tsx
│   │   ├── common.module.css
│
│
├── services/
│   ├── api.ts              (Axios / Fetch wrapper)
│   ├── fileService.ts
│   ├── analyticsService.ts
│   ├── settingsService.ts
│
├── hooks/
│   ├── useFiles.ts
│   ├── useAnalytics.ts
│   ├── useSettings.ts
│
├── store/                  (state management if needed)
│   ├── fileStore.ts
│   ├── uiStore.ts
│
├── styles/
│   ├── brandkit.css        ⭐ GLOBAL DESIGN SYSTEM
│   ├── globals.css
│   ├── variables.css
│   ├── reset.css
│
├── assets/
│   ├── icons/
│   ├── images/
│   ├── logos/
│
├── types/
│   ├── file.types.ts
│   ├── user.types.ts
│   ├── api.types.ts
│
├── config/
│   ├── app.config.ts
│   ├── constants.ts
│
├── utils/
│   ├── formatDate.ts
│   ├── fileHelpers.ts
│   ├── storageUtils.ts
│
├── middleware.ts
├── next.config.js
└── package.json


server/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│
│
├── config/
│   ├── db.config.ts
│   ├── env.config.ts
│   ├── storage.config.ts
│
│
├── modules/
│   ├── files/
│   │   ├── file.controller.ts
│   │   ├── file.service.ts
│   │   ├── file.routes.ts
│   │   ├── file.model.ts
│   │
│   ├── organizer/
│   │   ├── organizer.service.ts   (core logic)
│   │   ├── classifier.ts          (AI/rules engine)
│   │   ├── watcher.ts             (file system watcher)
│   │
│   ├── analytics/
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │
│   ├── reports/
│   │   ├── report.service.ts
│   │   ├── report.generator.ts
│
│
├── services/
│   ├── compression.service.ts
│   ├── duplicate.service.ts
│   ├── fileSystem.service.ts
│   ├── logging.service.ts
│
├── jobs/
│   ├── dailyReport.job.ts
│   ├── cleanup.job.ts
│
├── middleware/
│   ├── error.middleware.ts
│   ├── auth.middleware.ts
│
├── utils/
│   ├── fileTypeDetector.ts
│   ├── logger.ts
│   ├── pathResolver.ts
│
├── database/
│   ├── connection.ts
│   ├── models/
│
├── logs/
│
├── tests/
│
├── scripts/
│   ├── setupFolders.ts
│
├── package.json
└── tsconfig.json


shared/
│
├── types/
│   ├── file.ts
│   ├── analytics.ts
│   ├── settings.ts
│
├── constants/
│   ├── fileTypes.ts
│   ├── routes.ts
│
└── utils/
    ├── validators.ts



docs/
│
├── proposal/
│   ├── proposal.pdf
│
├── diagrams/
│   ├── usecase.png
│   ├── class-diagram.png
│   ├── sequence-diagram.png
│
├── report/
│   ├── final-report.docx
│
├── screenshots/
│
└── architecture.md