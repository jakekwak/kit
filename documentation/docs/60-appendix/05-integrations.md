---
title: Integrations
---

## Preprocessors

전처리기는 `.svelte` 파일을 컴파일러에 전달하기 전에 변환합니다. 예를 들어 `.svelte` 파일이 TypeScript 및 PostCSS를 사용하는 경우 Svelte 컴파일러가 처리할 수 있도록 먼저 JavaScript 및 CSS로 변환해야 합니다. [사용 가능한 전처리기](https://sveltesociety.dev/tools#preprocessors)가 많이 있습니다. Svelte 팀은 아래에 설명된 두 가지 공식 팀을 유지합니다.

### `vitePreprocess`

`vite-plugin-svelte`는 전처리에 Vite를 활용하는 [`vitePreprocess`](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md) 기능을 제공합니다. TypeScript, PostCSS, SCSS, Less, Stylus 및 SugarSS와 같은 언어 특성 Vite 핸들을 처리할 수 있습니다. 편의상 `@sveltejs/kit/vite` 패키지에서 다시 내보냅니다. TypeScript로 프로젝트를 설정하면 기본적으로 포함됩니다.

```js
// svelte.config.js
import { vitePreprocess } from '@sveltejs/kit/vite';

export default {
  preprocess: [vitePreprocess()]
};
```

### `svelte-preprocess`

`svelte-preprocess`에는 Pug, Babel 및 전역 스타일 지원과 같이 `vitePreprocess`에는 없는 몇 가지 추가 기능이 있습니다. 그러나 `vitePreprocess`는 더 빠르고 구성이 덜 필요할 수 있으므로 기본적으로 사용됩니다. CoffeeScript는 SvelteKit에서 [지원되지 않음](https://github.com/sveltejs/kit/issues/2920#issuecomment-996469815)입니다.

`npm install --save-dev svelte-preprocess`를 사용하여 `svelte-preprocess`를 설치하고 [`svelte.config.js`에 추가](https://github.com/sveltejs/svelte-preprocess/blob/main/docs/usage.md#with-svelte-config)해야 합니다. 이후에는 `npm install -D sass` 또는 `npm install -D less`와 같은 [해당 라이브러리를 설치](https://github.com/sveltejs/svelte-preprocess/blob/main/docs/getting-started.md)해야 하는 경우가 많습니다.

## Adders

[Svelte Adders](https://sveltesociety.dev/templates#adders)를 사용하면 단일 명령으로 Tailwind, PostCSS, Storybook, Firebase, GraphQL, mdsvex 등과 같은 다양하고 복잡한 통합을 설정할 수 있습니다. Svelte 및 SvelteKit에서 사용할 수 있는 템플릿, 구성 요소 및 도구의 전체 목록은 [sveltesociety.dev](https://sveltesociety.dev/)를 참조하십시오.

## Integration FAQs

SvelteKit FAQ에는 [통합 섹션](/faq#integrations)이 있어 질문이 있는 경우 도움이 될 수 있습니다.
