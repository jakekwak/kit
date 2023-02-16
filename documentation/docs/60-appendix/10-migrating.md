---
title: Migrating from Sapper
rank: 1
---

SvelteKit은 Sapper의 후속 제품이며 디자인의 많은 요소를 공유합니다.

SvelteKit으로 마이그레이션하려는 기존 Sapper 앱이 있는 경우 몇 가지 변경해야 할 사항이 있습니다. 이전하는 동안 [몇 가지 예](/docs/additional-resources#examples)를 확인하면 도움이 될 수 있습니다.

## package.json

### type: "module"

`"type": "module"`을 `package.json`에 추가합니다. Sapper 0.29.3 이상을 사용하는 경우 증분 마이그레이션의 일부로 나머지 단계와 별도로 이 단계를 수행할 수 있습니다.

### dependencies

`polka` 또는 `express` 중 하나를 사용하는 경우 `sirv` 또는 `compression`과 같은 미들웨어를 제거하십시오.

### devDependencies

`devDependencies`에서 `sapper`를 제거하고 `@sveltejs/kit` 및 사용하려는 [어댑터](/docs/adapters)로 교체합니다([다음 섹션](/docs/migrating#project-files-configuration) 참조).

### scripts

`sapper`를 참조하는 모든 스크립트를 업데이트해야 합니다.

- `sapper build`는 Node [adapter](/docs/adapters)를 사용하여 `vite build`가 되어야 합니다.
- `sapper export`는 정적 [adapter](/docs/adapters)를 사용하여 `vite build`가 되어야 합니다.
- `sapper dev`는 `vite dev`가 되어야 합니다.
- `node __sapper__/build`는 `node build`가 되어야 합니다.

## Project files

앱의 대부분은 `src/routes`에 그대로 둘 수 있지만 여러 프로젝트 파일을 이동하거나 업데이트해야 합니다.

### Configuration

`webpack.config.js` 또는 `rollup.config.js`는 [여기](/docs/configuration)에 설명된 대로 `svelte.config.js`로 교체해야 합니다. Svelte 전처리기 옵션은 `config.preprocess`로 이동해야 합니다.

[어댑터](/docs/adapters)를 추가해야 합니다. `sapper build`는 [adapter-node](https://github.com/sveltejs/kit/tree/master/packages/adapter-node)와 대략적으로 동일하고 `sapper export`는 [adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)과 대략 동일하지만 배포하려는 플랫폼용으로 설계된 어댑터를 사용하는 것이 더 나을 수도 있습니다.

[Vite](https://vitejs.dev)에서 자동으로 처리되지 않는 파일 형식에 대한 플러그인을 사용하고 있었다면 Vite에 해당하는 항목을 찾아 [Vite config](/docs/project-structure#project-files-vite-config-js)에 추가해야 합니다.

### src/client.js

이 파일은 SvelteKit에 해당 파일이 없습니다. 모든 커스텀 로직(`sapper.start(...)` 이후)은 `onMount` 콜백 내부의 `+layout.svelte` 파일에 표현되어야 합니다.

### src/server.js

`adapter-node`를 사용할 때 이에 상응하는 것은 [커스텀 서버](https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server)입니다. 그렇지 않으면 SvelteKit 앱이 서버리스 환경에서 실행될 수 있으므로 이 파일에는 직접 해당하는 항목이 없습니다.

### src/service-worker.js

`@sapper/service-worker`에서 가져온 대부분의 항목은 [`$service-worker`](/docs/modules#$service-worker)에 해당 항목이 있습니다.

- `files`은 변경되지 않습니다.
- `routes`가 제거되었습니다.
- `shell`은 이제 `build`입니다.
- `timestamp`는 이제 `version`입니다.

### src/template.html

`src/template.html` 파일의 이름을 `src/app.html`로 변경해야 합니다.

`%sapper.base%`, `%sapper.scripts%` 및 `%sapper.styles%`를 제거합니다. `%sapper.head%`를 `%sveltekit.head%`로, `%sapper.html%`를 `%sveltekit.body%`로 바꿉니다. `<div id="sapper">`는 더 이상 필요하지 않습니다.

### src/node_modules

Sapper 앱의 일반적인 패턴은 내부 라이브러리를 `src/node_modules` 내부 디렉토리에 넣는 것입니다. 이것은 Vite에서 작동하지 않으므로 대신 [`src/lib`](/docs/modules#$lib)를 사용합니다.

## Pages and layouts

### Renamed files

경로는 이제 모호성을 제거하기 위해 독점적으로 폴더 이름으로 구성되며 `+page.svelte`로 이어지는 폴더 이름이 경로에 해당합니다. 개요는 [라우팅 문서](/docs/routing)를 참조하세요. 다음은 기존/신규 비교를 보여줍니다.

| Old                       | New                       |
| ------------------------- | ------------------------- |
| routes/about/index.svelte | routes/about/+page.svelte |
| routes/about.svelte       | routes/about/+page.svelte |

사용자 지정 오류 페이지 구성 요소의 이름을 `_error.svelte`에서 `+error.svelte`로 변경해야 합니다. `_layout.svelte` 파일도 마찬가지로 `+layout.svelte`로 이름을 바꿔야 합니다. [다른 파일은 무시됩니다](/docs/routing#other-files).

### Imports

`@sapper/app`에서 가져오는 `goto`, `prefetch` 및 `prefetchRoutes`는 각각 [`$app/navigation`](/docs/modules#$app-navigation)에서 가져오는 `goto`, `preloadData` 및 `preloadCode`로 교체해야 합니다.

`@sapper/app`에서 `stores` 가져오기를 교체해야 합니다. 아래 [Stores](/docs/migrating#pages-and-layouts-stores) 섹션을 참조하세요.

이전에 `src/node_modules`의 디렉토리에서 가져온 모든 파일을 [`$lib`](/docs/modules#$lib) 가져오기로 교체해야 합니다.

### Preload

이전과 마찬가지로 페이지와 레이아웃은 렌더링이 수행되기 전에 데이터를 로드할 수 있는 기능을 내보낼 수 있습니다.

이 함수는 `preload`에서 [`load`](/docs/load)로 이름이 바뀌었습니다. 이제 `+page.js`(또는 `+layout.js`)에서 `+page.svelte`(또는 `+layout.svelte`) 옆에 있습니다. API가 변경되었습니다. 두 개의 인수(`page` 및 `session`) 대신 하나의 `event` 인수가 있습니다.

더 이상 `this` 객체가 없으므로 `this.fetch`, `this.error` 또는 `this.redirect`도 없습니다. 대신 입력 방법에서 [`fetch`](/docs/load#making-fetch-requests)를 가져올 수 있으며 이제 [`error`](/docs/load#errors) 및 [`redirect`](/docs/load#redirects)가 모두 발생합니다.

### Stores

Sapper에서는 다음과 같이 제공된 상점에 대한 참조를 얻습니다.

```js
// @filename: ambient.d.ts
declare module '@sapper/app';

// @filename: index.js
// ---cut---
import { stores } from '@sapper/app';
const { preloading, page, session } = stores();
```

`page` 스토어는 여전히 존재합니다. `preloading`은 `from` 및 `to` 속성을 포함하는 `navigating` 저장소로 대체되었습니다. 이제 `page`에는 `url` 및 `params` 속성이 있지만 `path` 또는 `query`는 없습니다.

SvelteKit에서 다르게 액세스합니다. `stores`는 이제 `getStores`이지만 대부분의 경우 [`$app/stores`](/docs/modules#$app-stores)에서 직접 `navigating` 및 `page`를 가져올 수 있으므로 필요하지 않습니다.

### Routing

Regex 경로는 더 이상 지원되지 않습니다. 대신 [고급 경로 일치](/docs/advanced-routing#matching)를 사용하세요.

### Segments

이전에는 레이아웃 구성요소가 하위 세그먼트를 나타내는 'segment' prop을 받았습니다. 이것은 제거되었습니다. 보다 유연한 `$page.url.pathname` 값을 사용하여 관심 있는 세그먼트를 파생시켜야 합니다.

### URLs

Sapper에서 모든 상대 URL은 현재 페이지가 아닌 기본 URL(`basepath` 옵션이 사용되지 않는 한 일반적으로 `/`)에 대해 확인되었습니다.

이로 인해 문제가 발생했으며 SvelteKit에서는 더 이상 해당되지 않습니다. 대신 상대 URL이 현재 페이지(또는 `load` 기능의 `fetch` URL의 경우 대상 페이지)에 대해 확인됩니다. 대부분의 경우 의미가 컨텍스트에 따라 달라지지 않기 때문에 루트 관련(즉, `/`로 시작) URL을 사용하는 것이 더 쉽습니다.

### &lt;a&gt; attributes

- `sapper:prefetch`는 이제 `data-sveltekit-preload-data`입니다.
- `sapper:noscroll`은 이제 `data-sveltekit-noscroll`입니다.

## Endpoints

Sapper에서 [서버 경로](/docs/routing#server)는 Node의 `http` 모듈(또는 Polka 및 Express와 같은 프레임워크에서 제공하는 확장된 버전)에 의해 노출된 `req` 및 `res` 개체를 수신했습니다.

SvelteKit은 앱이 실행되는 위치에 대해 독립적으로 설계되었습니다. 즉, 노드 서버에서 실행될 수 있지만 서버리스 플랫폼이나 Cloudflare Worker에서 동일하게 실행될 수 있습니다. 따라서 더 이상 `req` 및 `res`와 직접 상호 작용하지 않습니다. 새 서명과 일치하도록 엔드포인트를 업데이트해야 합니다.

이러한 환경에 구애받지 않는 동작을 지원하기 위해 이제 `fetch`를 전역 컨텍스트에서 사용할 수 있으므로 이를 사용하기 위해 `node-fetch`, `cross-fetch`, 또는 유사한 서버 측 가져오기 구현을 가져올 필요가 없습니다.

## Integrations

통합에 대한 자세한 내용은 [FAQ](/faq#integrations)를 참조하세요.

### HTML minifier

Sapper에는 기본적으로 `html-minifier`가 포함되어 있습니다. SvelteKit에는 이 기능이 포함되어 있지 않지만 프로덕션 종속성으로 추가한 다음 [후크](/docs/hooks#server-hooks-handle)를 통해 사용할 수 있습니다.

```js
// @filename: ambient.d.ts
/// <reference types="@sveltejs/kit" />
declare module 'html-minifier';

// @filename: index.js
// ---cut---
import { minify } from 'html-minifier';
import { building } from '$app/environment';

const minification_options = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	conservativeCollapse: true,
	decodeEntities: true,
	html5: true,
	ignoreCustomComments: [/^#/],
	minifyCSS: true,
	minifyJS: false,
	removeAttributeQuotes: true,
	removeComments: false, // some hydration code needs comments, so leave them in
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	sortAttributes: true,
	sortClassName: true
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let page = '';

	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			html += page;
			if (done) {
				return building ? minify(page, minification_options) : page;
			}
		}
	});
}
```

사이트의 프로덕션 빌드를 테스트하기 위해 `vite preview`를 사용할 때 `사전 렌더링`은 `false`이므로 축소 결과를 확인하려면 빌드된 HTML 파일을 직접 검사해야 합니다.
