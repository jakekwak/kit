---
title: Project structure
---

일반적인 SvelteKit 프로젝트는 다음과 같습니다.

```bash
my-project/
├ src/
│ ├ lib/
│ │ ├ server/
│ │ │ └ [your server-only lib files]
│ │ └ [your lib files]
│ ├ params/
│ │ └ [your param matchers]
│ ├ routes/
│ │ └ [your routes]
│ ├ app.html
│ ├ error.html
│ └ hooks.js
├ static/
│ └ [your static assets]
├ tests/
│ └ [your tests]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

또한 `.gitignore` 및 `.npmrc`(및 `npm create svelte@latest`를 실행할 때 해당 옵션을 선택한 경우 `.prettierrc` 및 `.eslintrc.cjs` 등)와 같은 일반적인 파일도 찾을 수 있습니다.

## Project files

### src

`src` 디렉토리에는 프로젝트의 핵심이 포함되어 있습니다.

- `lib`에는 [`$lib`](/docs/modules#$lib) 별칭을 통해 가져오거나 [`svelte-package`](/docs/packaging)을 사용하여 배포용으로 패키지화할 수 있는 라이브러리 코드(유틸리티 및 구성 요소)가 포함되어 있습니다.
  - `server`에는 서버 전용 라이브러리 코드가 포함되어 있습니다. [`$lib/server`](/docs/server-only-modules) 별칭을 사용하여 가져올 수 있습니다. SvelteKit은 클라이언트 코드에서 이러한 항목을 가져오는 것을 방지합니다.
- `params`에는 앱에 필요한 모든 [매개변수 매처](/docs/advanced-routing#matching)가 포함됩니다.
- `routes`에는 애플리케이션의 [routes](/docs/routing)가 포함됩니다. 여기에서 단일 경로 내에서만 사용되는 다른 구성 요소를 함께 배치할 수도 있습니다.
- `app.html`은 페이지 템플릿 — 다음 자리 표시자를 포함하는 HTML 문서입니다.
  - `%sveltekit.head%` — 앱에 필요한 `<link>` 및 `<script>` 요소와 모든 `<svelte:head>` 콘텐츠
  - `%sveltekit.body%` — 렌더링된 페이지에 대한 마크업입니다. 요소를 주입한 다음 수화 프로세스에 의해 파괴되는 브라우저 확장으로 인한 버그를 방지하기 위해 `<body>` 내부가 아니라 `<div>` 또는 기타 요소 내부에 있어야 합니다. SvelteKit은 그렇지 않은 경우 개발 중에 경고합니다.
  - `%sveltekit.assets%` — 지정된 경우 [`paths.assets`](/docs/configuration#paths) 또는 [`paths.base`](/docs/configuration#paths)에 대한 상대 경로
  - `%sveltekit.nonce%` — 사용되는 경우, 수동으로 포함된 링크 및 스크립트에 대한 [CSP](/docs/configuration#csp) nonce
- `error.html`(선택 사항)은 다른 모든 것이 실패할 때 렌더링되는 페이지입니다. 다음 자리 표시자를 포함할 수 있습니다.
  - `%sveltekit.status%` — HTTP 상태
  - `%sveltekit.error.message%` — 오류 메시지
- `hooks.js` (선택사항) 애플리케이션의 [후크](/docs/hooks)를 포함합니다.
- `service-worker.js` (선택사항) [서비스 워커](/docs/service-workers)를 포함합니다.

TypeScript를 사용하는 경우 `.js` 파일 대신 `.ts` 파일을 사용할 수 있습니다.

프로젝트를 설정할 때 [Vitest](https://vitest.dev)를 추가한 경우 단위 테스트는 `.test.js`(또는 `.test.ts`) 확장자와 함께 `src` 디렉토리에 있습니다.

### static

`robots.txt` 또는 `favicon.png`와 같이 있는 그대로 제공되어야 하는 정적 자산은 여기로 이동합니다.

### tests

프로젝트를 설정할 때 브라우저 테스트를 위해 [Playwright](https://playwright.dev/)를 추가한 경우 테스트가 이 디렉터리에 있습니다.

### package.json

`package.json` 파일에는 `@sveltejs/kit`, `svelte` 및 `vite`가 `devDependencies`로 포함되어야 합니다.

`npm create svelte@latest`로 프로젝트를 생성하면 `package.json`에 `"type": "module"`이 포함되어 있음을 알 수 있습니다. 즉, `.js` 파일은 `import` 및 `export` 키워드가 있는 기본 JavaScript 모듈로 해석됩니다. 레거시 CommonJS 파일에는 `.cjs` 파일 확장자가 필요합니다.

### svelte.config.js

이 파일에는 Svelte 및 SvelteKit [구성](/docs/configuration)이 포함되어 있습니다.

### tsconfig.json

이 파일(또는 `.ts` 파일보다 유형 검사 `.js` 파일을 선호하는 경우 `jsconfig.json`)은 `npm create svelte@latest` 중에 유형 검사를 추가한 경우 TypeScript를 구성합니다. SvelteKit은 특정 방식으로 설정되는 특정 구성에 의존하기 때문에 자체 구성이 `확장`되는 자체 `.svelte-kit/tsconfig.json` 파일을 생성합니다.

### vite.config.js

SvelteKit 프로젝트는 실제로 [`@sveltejs/kit/vite`](/docs/modules#sveltejs-kit-vite) 플러그인을 사용하는 [Vite](https://vitejs.dev) 프로젝트입니다. 기타 [Vite 구성](https://vitejs.dev/config/).

## Other files

### .svelte-kit

프로젝트를 개발하고 빌드할 때 SvelteKit은 `.svelte-kit` 디렉토리([`outDir`](/docs/configuration#outdir)로 구성 가능)에 파일을 생성합니다. 내용을 무시하고 언제든지 삭제할 수 있습니다(다음에 `dev` 또는 `build`를 수행할 때 다시 생성됨).
