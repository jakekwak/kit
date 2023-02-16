---
title: SEO
---

SEO의 가장 중요한 측면은 웹에서 광범위하게 연결되는 고품질 콘텐츠를 만드는 것입니다. 그러나 순위가 높은 사이트를 구축하기 위한 몇 가지 기술적 고려 사항이 있습니다.

## Out of the box

### SSR

최근 몇 년 동안 검색 엔진이 클라이언트측 JavaScript로 렌더링된 콘텐츠를 인덱싱하는 능력이 향상되었지만 서버측 렌더링된 콘텐츠는 보다 자주 안정적으로 인덱싱됩니다. SvelteKit은 기본적으로 SSR을 사용하며 [`handle`](/docs/hooks#server-hooks-handle)에서 비활성화할 수 있지만 특별한 이유가 없는 한 켜두어야 합니다.

> SvelteKit의 렌더링은 고도로 구성 가능하며 필요한 경우 [동적 렌더링](https://developers.google.com/search/docs/advanced/javascript/dynamic-rendering)을 구현할 수 있습니다. SSR에는 SEO 외에 다른 이점이 있으므로 일반적으로 권장되지 않습니다.

### Performance

[Core Web Vitals](https://web.dev/vitals/#core-web-vitals)와 같은 신호는 검색 엔진 순위에 영향을 미칩니다. Svelte 및 SvelteKit은 오버헤드를 최소화하므로 고성능 사이트를 구축하기가 더 쉽습니다. Google의 [PageSpeed Insights](https://pagespeed.web.dev/) 또는 [Lighthouse](https://developers.google.com/web/tools/lighthouse)를 사용하여 사이트 성능을 테스트할 수 있습니다.

### Normalized URLs

SvelteKit은 뒤에 슬래시가 있는 경로 이름을 없는 경로 이름으로 리디렉션합니다(또는 [구성](/docs/page-options#trailingslash)에 따라 그 반대). 중복 URL은 SEO에 좋지 않습니다.

## Manual setup

### &lt;title&gt; and &lt;meta&gt;

모든 페이지에는 [`<svelte:head>`](https://svelte.dev/docs#template-syntax-svelte-head) 안에 잘 작성된 고유한 `<title>` 및 `<meta name="description">` 요소가 있어야 합니다. 검색 엔진에서 콘텐츠를 이해할 수 있도록 만드는 다른 제안과 함께 설명적인 제목 및 설명을 작성하는 방법에 대한 지침은 Google의 [Lighthouse SEO 감사](https://web.dev/lighthouse-seo/) 문서에서 찾을 수 있습니다.

> 일반적인 패턴은 페이지 [`load`](/docs/load) 함수에서 SEO 관련 `data`를 반환한 다음 사용하는 것입니다.([`$page.data`](/docs/modules#$app-stores)와 같이) 루트 [레이아웃](/docs/routing#layout)의 `<svelte:head>`에 있습니다.

### Structured data

[구조화된 데이터](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data)는 검색 엔진이 페이지의 콘텐츠를 이해하는 데 도움이 됩니다. 구조화된 데이터를 [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess)와 함께 사용하는 경우 `ld+json` 데이터를 명시적으로 보존해야 합니다.(이것은 [향후 변경될 수 있음](https://github.com/sveltejs/svelte-preprocess/issues/305)):

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module 'svelte-preprocess';

// @filename: index.js
// ---cut---
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		preserve: ['ld+json']
		// ...
	})
};

export default config;
```

### Sitemaps

[사이트맵](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap)은 특히 콘텐츠가 많은 경우 검색 엔진이 사이트 내 페이지의 우선순위를 지정하도록 도와줍니다. 끝점을 사용하여 동적으로 사이트맵을 만들 수 있습니다.

```js
/// file: src/routes/sitemap.xml/+server.js
export async function GET() {
	return new Response(
		`
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			<!-- <url> elements go here -->
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}
```

### AMP

현대 웹 개발의 불행한 현실은 때때로 사이트의 [AMP(Accelerated Mobile Pages)](https://amp.dev/) 버전을 만들어야 한다는 것입니다. SvelteKit에서는 [`inlineStyleThreshold`](/docs/configuration#inlinestylethreshold) 옵션을 설정하여 이 작업을 수행할 수 있습니다...

```js
/// file: svelte.config.js
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// since <link rel="stylesheet"> isn't
		// allowed, inline all styles
		inlineStyleThreshold: Infinity
	}
};

export default config;
```

...루트 `+layout.js`/`+layout.server.js`에서 `csr` 비활성화...

```js
/// file: src/routes/+layout.server.js
export const csr = false;
```

...`@sveltejs/amp`에서 가져온 `transform`과 함께 `transformPageChunk`를 사용하여 HTML을 변환합니다:

```js
import * as amp from '@sveltejs/amp';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let buffer = '';
	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			buffer += html;
			if (done) return amp.transform(html);
		}
	});
}
```

> `handle` 후크를 사용하여 `amphtml-validator`를 사용하여 변환된 HTML의 유효성을 검사하는 것이 좋지만 매우 느리기 때문에 페이지를 사전 렌더링하는 경우에만 해당됩니다.
