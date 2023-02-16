---
title: How do I fix the error I'm getting trying to include a package?
---

라이브러리 포함과 관련된 대부분의 문제는 잘못된 패키징으로 인해 발생합니다. 라이브러리의 패키징이 Node.js와 호환되는지는 [publint 웹사이트](https://publint.dev/)에 입력하면 확인할 수 있습니다.

다음은 라이브러리가 올바르게 패키징되었는지 확인할 때 염두에 두어야 할 몇 가지 사항입니다.

- `exports`는 `main` 및 `module`과 같은 다른 진입점 필드보다 우선합니다. 'exports' 필드를 추가하면 깊은 가져오기를 방지하므로 이전 버전과 호환되지 않을 수 있습니다.
- CommonJS 파일이 `.cjs`로 끝나야 하는 `"type": "module"`이 설정되지 않은 경우 ESM 파일은 `.mjs`로 끝나야 합니다.
- `exports`가 정의되지 않은 경우 `main`을 정의해야 합니다. CommonJS 또는 ESM 파일이어야 하며 이전 항목을 준수해야 합니다. `module` 필드가 정의된 경우 ESM 파일을 참조해야 합니다.
- Svelte 구성 요소는 ESM 전용으로 작성된 패키지의 모든 JS와 함께 컴파일되지 않은 `.svelte` 파일로 배포되어야 합니다. TypeScript 및 SCSS와 같은 사용자 정의 스크립트 및 스타일 언어는 각각 바닐라 JS 및 CSS로 사전 처리되어야 합니다. Svelte 라이브러리 패키징에 [`svelte-package`](/docs/packaging)를 사용하는 것이 좋습니다. 그러면 이 작업이 자동으로 수행됩니다.

라이브러리는 특히 Svelte 구성 요소 라이브러리의 종속 항목인 경우 ESM 버전을 배포할 때 Vite가 있는 브라우저에서 가장 잘 작동합니다. 라이브러리 작성자에게 ESM 버전을 제공하도록 제안할 수 있습니다. 그러나 CommonJS(CJS) 종속성도 작동해야 합니다. 기본적으로 [`vite-plugin-svelte`는 Vite에게 사전 번들링을 요청하므로](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md#what-is-going-on-with-vite-and-pre-bundling-dependencies) `esbuild`를 사용하여 ESM으로 변환합니다.

여전히 문제가 발생하는 경우 [Vite 문제 추적기](https://github.com/vitejs/vite/issues)와 해당 라이브러리의 문제 추적기를 모두 검색하는 것이 좋습니다. 때때로 문제는 [`optimizeDeps`](https://vitejs.dev/config/#dep-optimization-options) 또는 [`ssr`](https://vitejs.dev/config/#ssr-options) 구성 값을 조작하여 해결할 수 있지만 문제의 라이브러리를 수정하기 위한 단기 해결 방법으로만 권장합니다.
