.
├── .DS_Store
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── bootstrap.sh
├── docs
│   ├── advanced-concepts.md
│   ├── compiler-api.md
│   ├── mini-projects.md
│   ├── patterns-guide.md
│   ├── setup-guide.md
│   └── ts-cheatsheet.md
├── package.json
├── postcss.config.js
├── PROJECT_STRUCTURE.md
├── public
│   ├── favicon.ico
│   ├── images
│   │   ├── .DS_Store
│   │   ├── banners
│   │   │   ├── advanced-banner.png
│   │   │   ├── basics-banner.png
│   │   │   └── oop-banner.png
│   │   ├── icons
│   │   │   ├── .DS_Store
│   │   │   ├── dashboard.png
│   │   │   ├── playground.png
│   │   │   └── typescript.png
│   │   └── logo.png
│   ├── index.html
│   └── manifest.json
├── README.md
├── scripts
│   ├── build-playground.ts
│   ├── export-pdf.ts
│   ├── generate-cheatsheets.ts
│   └── sync-readme-badges.ts
├── setup_tsversehub.sh
├── src
│   ├── App.tsx
│   ├── assets
│   │   ├── fonts
│   │   │   ├── inter.css
│   │   │   ├── inter.woff2
│   │   │   ├── space-grotesk.css
│   │   │   └── space-grotesk.woff2
│   │   ├── sounds
│   │   │   ├── click.wav
│   │   │   ├── index.ts
│   │   │   └── success.mp3
│   │   └── styles
│   │       ├── animations.css
│   │       └── variables.css
│   ├── components
│   │   ├── charts
│   │   │   ├── ConceptProgressChart.tsx
│   │   │   └── TypeRelationsGraph.tsx
│   │   ├── common
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── dashboards
│   │   │   ├── BadgeDisplay.tsx
│   │   │   ├── ConceptCard.tsx
│   │   │   ├── DemoPanel.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   └── QuizWidget.tsx
│   │   ├── editors
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── EditorConfig.ts
│   │   │   └── Playground.tsx
│   │   ├── loaders
│   │   │   ├── Skeleton.tsx
│   │   │   └── Spinner.tsx
│   │   └── ui
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Tabs.tsx
│   │       └── Tooltip.tsx
│   ├── concepts
│   │   ├── advanced-types
│   │   │   ├── conditional-types.ts
│   │   │   ├── demo.tsx
│   │   │   ├── exercises.ts
│   │   │   ├── index.ts
│   │   │   ├── infer-keyword.ts
│   │   │   ├── mapped-types.ts
│   │   │   ├── template-literals.ts
│   │   │   ├── type-guards.ts
│   │   │   └── union-intersection.ts
│   │   ├── basics
│   │   │   ├── demo.tsx
│   │   │   ├── enums.ts
│   │   │   ├── exercises.ts
│   │   │   ├── functions.ts
│   │   │   ├── index.ts
│   │   │   ├── interfaces-vs-types.ts
│   │   │   ├── symbols.ts
│   │   │   ├── type-aliases.ts
│   │   │   └── variables.ts
│   │   ├── compiler-api
│   │   │   ├── ast-explorer.ts
│   │   │   ├── demo.tsx
│   │   │   ├── diagnostics.ts
│   │   │   ├── exercises.ts
│   │   │   ├── index.ts
│   │   │   └── transpiler.ts
│   │   ├── decorators
│   │   │   ├── class-decorators.ts
│   │   │   ├── demo.tsx
│   │   │   ├── exercises.ts
│   │   │   ├── index.ts
│   │   │   ├── method-decorators.ts
│   │   │   ├── parameter-decorators.ts
│   │   │   └── property-decorators.ts
│   │   ├── generics
│   │   │   ├── advanced-utility-types.ts
│   │   │   ├── constraints.ts
│   │   │   ├── demo.tsx
│   │   │   ├── exercises.ts
│   │   │   ├── generic-classes.ts
│   │   │   ├── generic-functions.ts
│   │   │   ├── index.ts
│   │   │   └── utility-types.ts
│   │   ├── namespaces-modules
│   │   │   ├── declaration-merging.ts
│   │   │   ├── demo.tsx
│   │   │   ├── esmodules.ts
│   │   │   ├── exercises.ts
│   │   │   ├── index.ts
│   │   │   ├── module-augmentation.ts
│   │   │   └── namespaces.ts
│   │   ├── patterns
│   │   │   ├── abstract-classes.ts
│   │   │   ├── demo.tsx
│   │   │   ├── exercises.ts
│   │   │   ├── factory.ts
│   │   │   ├── index.ts
│   │   │   ├── mixins.ts
│   │   │   ├── observer.ts
│   │   │   ├── singleton.ts
│   │   │   └── strategy.ts
│   │   └── tsconfig
│   │       ├── basics.ts
│   │       ├── demo.tsx
│   │       ├── exercises.ts
│   │       ├── index.ts
│   │       ├── module-resolution.ts
│   │       ├── path-aliases.ts
│   │       ├── project-references.ts
│   │       └── strict-mode.ts
│   ├── contexts
│   │   ├── ProgressContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks
│   │   ├── useDarkMode.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePlaygroundCompiler.ts
│   ├── index.css
│   ├── main.tsx
│   ├── mini-projects
│   │   ├── compiler-playground
│   │   │   ├── ASTViewer.tsx
│   │   │   ├── Compiler.tsx
│   │   │   └── transformer.ts
│   │   ├── decorator-driven-di
│   │   │   ├── Container.ts
│   │   │   ├── demo.tsx
│   │   │   └── Inject.ts
│   │   ├── drag-drop-dashboard
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DraggableCard.tsx
│   │   │   └── hooks.ts
│   │   ├── event-bus
│   │   │   ├── EventBus.ts
│   │   │   ├── Publisher.ts
│   │   │   └── Subscriber.ts
│   │   └── form-validation
│   │       ├── Form.tsx
│   │       ├── useForm.ts
│   │       └── validation.ts
│   ├── pages
│   │   ├── About.tsx
│   │   ├── Concepts.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── MiniProjects.tsx
│   │   └── Playground.tsx
│   ├── registerSW.ts
│   ├── styles
│   │   ├── dashboard.css
│   │   ├── globals.css
│   │   ├── playground.css
│   │   └── typography.css
│   └── utils
│       ├── badge-system.ts
│       ├── compiler-utils.ts
│       ├── logger.ts
│       ├── quiz-generator.ts
│       └── type-graph.ts
├── tailwind.config.js
├── tests
│   ├── concepts
│   │   ├── advanced-types.test.ts
│   │   ├── basics.test.ts
│   │   ├── compiler-api.test.ts
│   │   ├── decorators.test.ts
│   │   ├── generics.test.ts
│   │   ├── namespaces-modules.test.ts
│   │   └── patterns.test.ts
│   ├── mini-projects
│   │   ├── drag-drop-dashboard.test.ts
│   │   ├── event-bus.test.ts
│   │   └── form-validation.test.ts
│   └── utils
│       └── quiz-generator.test.ts
├── tsconfig.json
└── vite.config.ts

43 directories, 180 files
