---
title: Page options
---

기본적으로 SvelteKit은 서버에서 먼저 모든 구성 요소를 렌더링(또는 [prerender](/docs/glossary#prerendering))하여 클라이언트에 HTML로 보냅니다. 그런 다음 브라우저에서 구성 요소를 다시 렌더링하여 [**하이드레이션**](/docs/glossary#hydration)이라는 프로세스에서 상호 작용하도록 만듭니다. 이러한 이유로 구성 요소가 두 위치에서 모두 실행될 수 있는지 확인해야 합니다. 그런 다음 SvelteKit은 후속 탐색을 대신하는 [**router**](/docs/routing)를 초기화합니다.

[`+page.js`](/docs/routing#page-page-js) 또는 [`+page.server.js`](/docs/routing#page-page-server-js)에서 옵션을 내보내거나 공유 [`+layout.js`](/docs/routing#layout-layout-js) 또는 [`+layout.server.js`](/docs/routing#layout-layout-server-js)를 사용하는 페이지 그룹에 대해 페이지별로 이러한 각 항목을 제어할 수 있습니다. 전체 앱에 대한 옵션을 정의하려면 루트 레이아웃에서 내보냅니다. 하위 레이아웃 및 페이지는 상위 레이아웃에 설정된 값을 재정의하므로 예를 들어 전체 앱에 대해 사전 렌더링을 활성화한 다음 동적으로 렌더링해야 하는 페이지에 대해 비활성화할 수 있습니다.

앱의 다양한 영역에서 이러한 옵션을 혼합하고 일치시킬 수 있습니다. 예를 들어 최대 속도를 위해 마케팅 페이지를 사전 렌더링하고, SEO 및 접근성을 위해 동적 페이지를 서버에서 렌더링하고, 클라이언트에서만 렌더링하여 관리 섹션을 SPA로 전환할 수 있습니다. 이것은 SvelteKit을 매우 다재다능하게 만듭니다.

## prerender

적어도 앱의 일부 경로는 빌드 시 생성된 간단한 HTML 파일로 표시될 수 있습니다. 이러한 경로는 [_prerendered_](/docs/glossary#prerendering)일 수 있습니다.

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = true;
```

또는 루트 `+layout.js` 또는 `+layout.server.js`에서 `export const prerender = true`를 설정하고 명시적으로 사전 렌더링할 수 _없다_로 표시된 페이지를 제외한 모든 항목을 사전 렌더링할 수 있습니다.

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = false;
```

`prerender = true`인 경로는 동적 SSR에 사용되는 매니페스트에서 제외되어 서버(또는 서버리스/에지 기능)를 더 작게 만듭니다. 경우에 따라 경로를 미리 렌더링하고 매니페스트에 포함할 수도 있습니다.(예를 들어 `/blog/[slug]`와 같은 경로에서 가장 최근/인기 있는 콘텐츠를 사전 렌더링하지만 롱테일은 서버에서 렌더링하려는 경우) - 이러한 경우 세 번째 옵션인 'auto'가 있습니다.

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = 'auto';
```

> 전체 앱이 사전 렌더링에 적합한 경우 [`adapter-static`](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)을 사용할 수 있습니다. 그러면 모든 정적 웹 서버에서 사용하기에 적합한 파일이 출력됩니다.

사전 렌더러는 앱의 루트에서 시작하여 사전 렌더링 가능한 페이지 또는 발견한 `+server.js` 경로에 대한 파일을 생성합니다. 각 페이지는 사전 렌더링 후보인 다른 페이지를 가리키는 `<a>` 요소를 스캔합니다. 이 때문에 일반적으로 어떤 페이지에 액세스해야 하는지 지정할 필요가 없습니다. 프리렌더러가 액세스해야 하는 페이지를 지정해야_한다면_ [프리렌더 구성](/docs/configuration#prerender)의 `entries` 옵션을 사용하여 그렇게 할 수 있습니다.

미리 렌더링하는 동안 [`$app/environment`](/docs/modules#$app-environment)에서 가져온 `building` 값은 `true`입니다.

### Prerendering server routes

다른 페이지 옵션과 달리 `prerender`는 `+server.js` 파일에도 적용됩니다. 이러한 파일은 레이아웃의 영향을 받지 _않지만_ 데이터를 가져오는 페이지에서 기본값을 상속합니다. 예를 들어 `+page.js`에 이 `load` 함수가 포함된 경우...

```js
/// file: +page.js
export const prerender = true;

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const res = await fetch('/my-server-route.json');
	return await res.json();
}
```

...그러면 `src/routes/my-server-route.json/+server.js`는 자체 `export const prerender = false`를 포함하지 않는 경우 사전 렌더링 가능한 것으로 처리됩니다.

### When not to prerender

기본 규칙은 다음과 같습니다. 페이지를 사전 렌더링할 수 있으려면 직접 방문하는 두 명의 사용자가 서버에서 동일한 콘텐츠를 가져와야 합니다.

> 일부 페이지는 사전 렌더링에 적합하지 않습니다. 사전 렌더링된 모든 콘텐츠는 모든 사용자에게 표시됩니다. 물론 사전 렌더링된 페이지의 'onMount'에서 개인화된 데이터를 가져올 수 있지만 이렇게 하면 빈 초기 콘텐츠 또는 로드 표시기가 포함되므로 사용자 경험이 저하될 수 있습니다.

`src/routes/blog/[slug]/+page.svelte` 경로와 같은 페이지 매개변수를 기반으로 데이터를 로드하는 페이지를 계속 사전 렌더링할 수 있습니다.

사전 렌더링 중에 [`url.searchParams`](/docs/load#using-url-data-url)에 액세스하는 것은 금지되어 있습니다. 사용해야 하는 경우 브라우저에서만 사용해야 합니다(예: `onMount`).

서버가 작업 `POST` 요청을 처리할 수 있어야 하므로 [actions](/docs/form-actions)가 있는 페이지는 미리 렌더링할 수 없습니다.

### Prerender and ssr

[ssr 옵션](#ssr)을 `false`로 설정하면 각 요청은 동일한 빈 HTML 셸이 됩니다. 이로 인해 불필요한 작업이 발생하기 때문에 SvelteKit은 기본적으로 `prerender`가 명시적으로 `false`로 설정되지 않은 페이지를 사전 렌더링합니다.

### Route conflicts

사전 렌더링은 파일 시스템에 쓰기 때문에 디렉토리와 파일이 동일한 이름을 갖게 하는 두 개의 엔드포인트를 가질 수 없습니다. 예를 들어 `src/routes/foo/+server.js` 및 `src/routes/foo/bar/+server.js`는 `foo` 및 `foo/bar`를 생성하려고 시도하지만 이는 불가능합니다.

이러한 이유로 인해 항상 파일 확장명을 포함하는 것이 좋습니다. `foo.json` 및 `foo/bar.json` 파일이 나란히 조화롭게 공존합니다.

_pages_의 경우 `foo` 대신 `foo/index.html`을 작성하여 이 문제를 피합니다.

이렇게 하면 라우터가 이미 활성화되어 있는지 여부에 관계없이 이 페이지의 모든 탐색에 대해 클라이언트 측 라우팅이 비활성화됩니다.

### Troubleshooting

'다음 경로는 사전 렌더링 가능으로 표시되었지만 사전 렌더링되지 않았습니다.'와 같은 오류가 발생하는 경우 문제의 경로(또는 페이지인 경우 상위 레이아웃)에 `export const prerender = true`가 있지만 페이지는 ' 사전 렌더링 크롤러가 도달하지 않았기 때문에 실제로 사전 렌더링되었습니다.

이러한 경로는 서버에서 동적으로 렌더링할 수 없기 때문에 사람들이 문제의 경로에 액세스하려고 하면 오류가 발생합니다. 수정하는 방법에는 두 가지가 있습니다.

* SvelteKit이 [`config.kit.prerender.entries`](/docs/configuration#prerender)의 링크를 따라 경로를 찾을 수 있는지 확인하십시오. 다른 진입점을 크롤링하여 찾지 못한 경우 이 옵션에 동적 경로(즉, `[parameters]`가 있는 페이지)에 대한 링크를 추가하십시오. 그렇지 않으면 SvelteKit이 매개변수에 어떤 값이 있어야 하는지 모르기 때문에 미리 렌더링되지 않습니다. 사전 렌더링 가능으로 표시되지 않은 페이지는 무시되며 일부 페이지가 사전 렌더링 가능하더라도 다른 페이지에 대한 링크는 크롤링되지 않습니다.
* `export const prerender = true`를 `export const prerender = 'auto'`로 변경합니다. `'auto'`가 있는 경로는 동적으로 서버 렌더링될 수 있습니다.

## ssr

일반적으로 SvelteKit은 먼저 서버에서 페이지를 렌더링하고 해당 HTML을 [하이드레이트된](/docs/glossary#hydration) 클라이언트로 보냅니다. `ssr`을 `false`로 설정하면 빈 '쉘' 페이지가 대신 렌더링됩니다. 이는 페이지를 서버에서 렌더링할 수 없는 경우에 유용하지만(예를 들어 `document`와 같은 브라우저 전용 전역 변수를 사용하기 때문에) 대부분의 상황에서는 권장되지 않습니다([부록 참조](/docs/glossary#ssr) ).

```js
/// file: +page.js
export const ssr = false;
```

루트 `+layout.js`에 `export const ssr = false`를 추가하면 전체 앱이 클라이언트에서만 렌더링됩니다. 이는 기본적으로 앱을 SPA로 전환한다는 의미입니다.

## csr

일반적으로 SvelteKit은 서버에서 렌더링한 HTML을 대화형 클라이언트측 렌더링(CSR) 페이지로 [수화](/docs/glossary#hydration)합니다. 일부 페이지에는 JavaScript가 전혀 필요하지 않습니다. 많은 블로그 게시물과 '정보' 페이지가 이 범주에 속합니다. 이러한 경우 CSR을 비활성화할 수 있습니다.

```js
/// file: +page.js
export const csr = false;
```

> `ssr`과 `csr`이 모두 `false`이면 아무 것도 렌더링되지 않습니다!

## trailingSlash

기본적으로 SvelteKit은 URL에서 후행 슬래시를 제거합니다. `/about/`을 방문하면 `/about`으로 리디렉션하여 응답합니다. `never'`(기본값), `'always'` 또는 `'ignore'` 중 하나가 될 수 있는 `trailingSlash` 옵션을 사용하여 이 동작을 변경할 수 있습니다.

다른 페이지 옵션과 마찬가지로 `+layout.js` 또는 `+layout.server.js`에서 이 값을 내보낼 수 있으며 모든 하위 페이지에 적용됩니다. `+server.js` 파일에서 구성을 내보낼 수도 있습니다.

```js
/// file: src/routes/+layout.js
export const trailingSlash = 'always';
```

이 옵션은 [사전 렌더링](#prerender)에도 영향을 미칩니다. `trailingSlash`가 `always`인 경우 `/about`과 같은 경로는 `about/index.html` 파일을 생성하고, 그렇지 않으면 정적 웹 서버 규칙을 미러링하여 `about.html`을 생성합니다.

> 후행 슬래시를 무시하는 것은 권장되지 않습니다. 상대 경로의 의미는 두 경우(`/x`의 `./y`는 `/y`이지만 `/x/`의 `/x/y`는 `/x/y`임) 사이에 다르며 `/x` 및 `/x/`는 SEO에 유해한 별도의 URL로 취급됩니다.

## config

With the concept of [adapters](/docs/adapters), SvelteKit is able to run on a variety of platforms. Each of these might have specific configuration to further tweak the deployment — for example on Vercel you could choose to deploy some parts of your app on the edge and others on serverless environments.

`config` is an object with key-value pairs at the top level. Beyond that, the concrete shape is dependent on the adapter you're using. Every adapter should provide a `Config` interface to import for type safety. Consult the documentation of your adapter for more information.

```js
// @filename: ambient.d.ts
declare module 'some-adapter' {
	export interface Config { runtime: string }
}

// @filename: index.js
// ---cut---
/// file: src/routes/+page.js
/** @type {import('some-adapter').Config} */
export const config = {
	runtime: 'edge'
};
```

`config` objects are merged at the top level (but _not_ deeper levels). This means you don't need to repeat all the values in a `+page.js` if you want to only override some of the values in the upper `+layout.js`. For example this layout configuration...

```js
/// file: src/routes/+layout.js
export const config = {
	runtime: 'edge',
	regions: 'all',
	foo: {
		bar: true
	}
}
```

...is overridden by this page configuration...

```js
/// file: src/routes/+page.js
export const config = {
	regions: ['us1', 'us2'],
	foo: {
		baz: true
	}
}
```

...which results in the config value `{ runtime: 'edge', regions: ['us1', 'us2'], foo: { baz: true } }` for that page.