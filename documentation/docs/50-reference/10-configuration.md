---
title: Configuration
---

프로젝트의 구성은 프로젝트의 루트에 있는 `svelte.config.js` 파일에 있습니다. SvelteKit뿐만 아니라 이 구성 개체는 편집기 확장과 같이 Svelte와 통합되는 다른 도구에서 사용됩니다.

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module '@sveltejs/adapter-auto' {
	const plugin: () => import('@sveltejs/kit').Adapter;
	export default plugin;
}

// @filename: index.js
// ---cut---
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

> TYPES: @sveltejs/kit#Config

`kit` 속성은 SvelteKit을 구성하며 다음 속성을 가질 수 있습니다.

> EXPANDED_TYPES: @sveltejs/kit#KitConfig