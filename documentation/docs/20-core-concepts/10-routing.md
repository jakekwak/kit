---
title: Routing
---

SvelteKit의 중심에는 _파일 시스템 기반 라우터_가 있습니다. 앱의 경로(즉, 사용자가 액세스할 수 있는 URL 경로)는 코드베이스의 디렉터리에 의해 정의됩니다.

- `src/routes`는 루트 경로입니다.
- `src/routes/about`은 `/about` 경로를 생성합니다.
- `src/routes/blog/[slug]`는 사용자가 `/blog/hello-world`와 같은 페이지를 요청할 때 동적으로 데이터를 로드하는 데 사용할 수 있는 _parameter_, `slug`로 경로를 생성합니다.

> [프로젝트 구성](/docs/configuration)을 편집하여 `src/routes`를 다른 디렉토리로 변경할 수 있습니다.

각 경로 디렉토리에는 `+` 접두사로 식별할 수 있는 하나 이상의 _route 파일_이 포함되어 있습니다.

## +page

### +page.svelte

`+page.svelte` 컴포넌트는 앱의 페이지를 정의합니다. 기본적으로 페이지는 초기 요청을 위한 서버([SSR](/docs/glossary#ssr))와 후속 탐색을 위한 브라우저([CSR](/docs/glossary#csr)) 모두에서 렌더링됩니다.

```svelte
/// file: src/routes/+page.svelte
<h1>Hello and welcome to my site!</h1>
<a href="/about">About my site</a>
```

```svelte
/// file: src/routes/about/+page.svelte
<h1>About this site</h1>
<p>TODO...</p>
<a href="/">Home</a>
```

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>{data.title}</h1>
<div>{@html data.content}</div>
```

> SvelteKit는 프레임워크별 `<Link>` 구성 요소가 아닌 `<a>` 요소를 사용하여 경로 간을 탐색합니다.

### +page.js

종종 페이지는 렌더링되기 전에 일부 데이터를 로드해야 합니다. 이를 위해 `load` 함수를 내보내는 `+page.js`(또는 TypeScript에 익숙한 경우 `+page.ts`) 모듈을 추가합니다.

```js
/// file: src/routes/blog/[slug]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.slug === 'hello-world') {
		return {
			title: 'Hello world!',
			content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
		};
	}

	throw error(404, 'Not found');
}
```

이 기능은 `+page.svelte`와 함께 실행됩니다. 즉, 서버 측 렌더링 중에는 서버에서, 클라이언트 측 탐색 중에는 브라우저에서 실행됩니다. API에 대한 자세한 내용은 [`load`](/docs/load)를 참조하세요.

`load` 뿐만 아니라 `+page.js`는 페이지의 동작을 구성하는 값을 내보낼 수 있습니다.

- `export const prerender = true` 또는 `false` 또는 `'auto'`
- `export const ssr = true` 또는 `false`
- `export const csr = true` 또는 `false`

이에 대한 자세한 내용은 [페이지 옵션](/docs/page-options)에서 확인할 수 있습니다.

### +page.server.js

`load` 기능이 서버에서만 실행될 수 있는 경우 — 예를 들어 데이터베이스에서 데이터를 가져와야 하거나 API 키와 같은 비공개 [환경 변수]에 액세스해야 하는 경우 - `+page.js`의 이름을 `+page.server.js`로 바꾸고 `PageLoad` 유형을 `PageServerLoad`로 변경할 수 있습니다.

```js
/// file: src/routes/blog/[slug]/+page.server.js

// @filename: ambient.d.ts
declare global {
	const getPostFromDatabase: (slug: string) => {
		title: string;
		content: string;
	}
}

export {};

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await getPostFromDatabase(params.slug);

	if (post) {
		return post;
	}

	throw error(404, 'Not found');
}
```

클라이언트 측 탐색 중에 SvelteKit은 서버에서 이 데이터를 로드합니다. 즉, 반환된 값은 [devalue](https://github.com/rich-harris/devalue)를 사용하여 직렬화할 수 있어야 합니다. API에 대한 자세한 내용은 [`load`](/docs/load)를 참조하세요.

`+page.js`와 마찬가지로 `+page.server.js`는 [페이지 옵션](/docs/page-options) — `prerender`, `ssr` 및 `csr`을 내보낼 수 있습니다.

`+page.server.js` 파일은 _actions_도 내보낼 수 있습니다. `load`를 통해 서버에서 데이터를 읽을 수 있다면 `actions`를 통해 `<form>` 요소를 사용하여 서버에 _to_ 데이터를 쓸 수 있습니다. 사용 방법을 알아보려면 [양식 작업](/docs/form-actions) 섹션을 참조하세요.

## +error

로드 중에 오류가 발생하면 SvelteKit은 기본 오류 페이지를 렌더링합니다. `+error.svelte` 파일을 추가하여 경로별로 이 오류 페이지를 사용자 정의할 수 있습니다.

```svelte
/// file: src/routes/blog/[slug]/+error.svelte
<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
```

SvelteKit은 가장 가까운 오류 경계를 찾기 위해 '트리를 따라 올라갑니다' — 위의 파일이 존재하지 않으면 기본 오류 페이지를 렌더링하기 전에 `src/routes/blog/+error.svelte`를 시도한 다음 `src/routes/+error.svelte`를 시도합니다. _이것_이 실패하면 (또는 루트 `+error` '위'에 있는 루트 `+layout`의 `load` 함수에서 오류가 발생한 경우) SvelteKit은 `src/error.html` 파일을 생성하여 사용자 정의할 수 있는 정적 폴백 오류 페이지를 구제하고 렌더링합니다.

오류가 `+layout(.server).js`의 `load` 함수 내에서 발생하는 경우 트리에서 가장 가까운 오류 경계는 레이아웃 _위_에 있는 `+error.svelte` 파일입니다(옆이 아님).

경로를 찾을 수 없으면(404) `src/routes/+error.svelte`(또는 해당 파일이 없으면 기본 오류 페이지)가 사용됩니다.

> `+error.svelte`는 [`handle`](/docs/hooks#server-hooks-handle) 또는 [+server.js](#server) 요청 핸들러 내에서 오류가 발생할 때 사용되지 _않습니다_.

오류 처리에 대한 자세한 내용은 [여기](/docs/errors)에서 확인할 수 있습니다.

## +layout

지금까지 우리는 페이지를 완전히 독립형 구성 요소로 취급했습니다. 탐색 시 기존 `+page.svelte` 구성 요소가 파괴되고 새 구성 요소가 그 자리를 차지합니다.

그러나 많은 앱에는 최상위 탐색이나 바닥글과 같이 _모든_ 페이지에 표시되어야 하는 요소가 있습니다. 모든 `+page.svelte`에서 반복하는 대신 _layouts_에 넣을 수 있습니다.

### +layout.svelte

모든 페이지에 적용되는 레이아웃을 생성하려면 `src/routes/+layout.svelte`라는 파일을 만드십시오. 기본 레이아웃(직접 가져오지 않은 경우 SvelteKit에서 사용하는 레이아웃)은 다음과 같습니다.

```html
<slot></slot>
```

...하지만 원하는 마크업, 스타일 및 동작을 추가할 수 있습니다. 유일한 요구 사항은 구성 요소가 페이지 콘텐츠에 대한 `<slot>`을 포함한다는 것입니다. 예를 들어 탐색 모음을 추가해 보겠습니다.

```html
/// file: src/routes/+layout.svelte
<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/settings">Settings</a>
</nav>

<slot></slot>
```

`/`, `/about` 및 `/settings`에 대한 페이지를 만들면...

```html
/// file: src/routes/+page.svelte
<h1>Home</h1>
```

```html
/// file: src/routes/about/+page.svelte
<h1>About</h1>
```

```html
/// file: src/routes/settings/+page.svelte
<h1>Settings</h1>
```

...nva는 항상 표시되며 세 페이지 사이를 클릭하면 `<h1>`만 교체됩니다.

레이아웃은 _중첩_될 수 있습니다. 단일 `/settings` 페이지가 아니라 공유 하위 메뉴가 있는 `/settings/profile` 및 `/settings/notifications`와 같은 중첩된 페이지가 있다고 가정합니다.(실제 예는 [github.com/settings](https://github.com/settings) 참조).

`/settings` 아래의 페이지에만 적용되는 레이아웃을 만들 수 있습니다(최상위 탐색(nav)으로 루트 레이아웃을 상속하는 동안).

```svelte
/// file: src/routes/settings/+layout.svelte
<script>
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<h1>Settings</h1>

<div class="submenu">
	{#each data.sections as section}
		<a href="/settings/{section.slug}">{section.title}</a>
	{/each}
</div>

<slot></slot>
```

기본적으로 각 레이아웃은 그 위에 있는 레이아웃을 상속합니다. 때로는 원하는 것이 아닐 수도 있습니다. 이 경우 [고급 레이아웃](/docs/advanced-routing#advanced-layouts)이 도움이 될 수 있습니다.

### +layout.js

`+page.js`에서 `+page.svelte`가 데이터를 로드하는 것처럼 `+layout.svelte` 구성 요소는 `+layout.js`의 [`load`](/docs/load) 함수에서 데이터를 가져올 수 있습니다. .

```js
/// file: src/routes/settings/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		sections: [
			{ slug: 'profile', title: 'Profile' },
			{ slug: 'notifications', title: 'Notifications' }
		]
	};
}
```

`+layout.js`가 [페이지 옵션](/docs/page-options) — `prerender`, `ssr` 및 `csr`을 내보내는 경우 하위 페이지의 기본값으로 사용됩니다.

레이아웃의 `load` 함수에서 반환된 데이터는 모든 하위 페이지에서도 사용할 수 있습니다.

```svelte
/// file: src/routes/settings/profile/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;

	console.log(data.sections); // [{ slug: 'profile', title: 'Profile' }, ...]
</script>
```

> 종종 페이지 사이를 탐색할 때 레이아웃 데이터가 변경되지 않습니다. SvelteKit은 필요할 때 지능적으로 [`load`](/docs/load) 기능을 다시 실행합니다.

### +layout.server.js

레이아웃의 `load` 기능을 서버에서 실행하려면 `+layout.server.js`로 이동하고 `LayoutLoad` 유형을 `LayoutServerLoad`로 변경합니다.

`+layout.js`와 마찬가지로 `+layout.server.js`는 [페이지 옵션](/docs/page-options) — `prerender`, `ssr` 및 `csr`을 내보낼 수 있습니다.

## +server

페이지뿐만 아니라 `+server.js` 파일(`API 경로` 또는 `엔드포인트`라고도 함)로 경로를 정의할 수 있으며 응답을 완전히 제어할 수 있습니다. `+server.js` 파일(또는 `+server.ts`)은 `RequestEvent` 인수를 취하고 [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) 객체를 반환하는 `GET`, `POST`, `PATCH`, `PUT` 및 `DELETE`와 같은 HTTP 동사에 해당하는 함수를 내보냅니다.

예를 들어 `GET` 처리기로 `/api/random-number` 경로를 만들 수 있습니다.

```js
/// file: src/routes/api/random-number/+server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		throw error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
```

`Response`의 첫 번째 인수는 [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)이 될 수 있으며, 이를 통해 대량의 데이터를 스트리밍하거나 생성할 수 있습니다. 서버 전송 이벤트(AWS Lambda와 같이 응답을 버퍼링하는 플랫폼에 배포하지 않는 한).

편의를 위해 `@sveltejs/kit`에서 [`error`](/docs/modules#sveltejs-kit-error), [`redirect`](/docs/modules#sveltejs-kit-redirect) 및 [`json`](/docs/modules#sveltejs-kit-json) 메서드를 사용할 수 있습니다(하지만 반드시 그럴 필요는 없습니다).

오류가 발생하면(`throw error(...)` 또는 예기치 않은 오류) 응답은 오류의 JSON 표현 또는 폴백 오류 페이지가 됩니다. 이는 `src/error.html`을 통해 사용자 정의할 수 있습니다. — `Accept` 헤더에 따라 다릅니다. 이 경우 [`+error.svelte`](#error) 구성 요소는 렌더링되지 _않습니다_. 오류 처리에 대한 자세한 내용은 [여기](/docs/errors)에서 확인할 수 있습니다.

### Receiving data

`POST`/`PUT`/`PATCH`/`DELETE` 처리기를 내보내면 `+server.js` 파일을 사용하여 완전한 API를 만들 수 있습니다.

```svelte
/// file: src/routes/add/+page.svelte
<script>
	let a = 0;
	let b = 0;
	let total = 0;

	async function add() {
		const response = await fetch('/api/add', {
			method: 'POST',
			body: JSON.stringify({ a, b }),
			headers: {
				'content-type': 'application/json'
			}
		});

		total = await response.json();
	}
</script>

<input type="number" bind:value={a}> +
<input type="number" bind:value={b}> =
{total}

<button on:click={add}>Calculate</button>
```

```js
/// file: src/routes/api/add/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { a, b } = await request.json();
	return json(a + b);
}
```

> 일반적으로 [form actions](/docs/form-actions)은 브라우저에서 서버로 데이터를 제출하는 더 좋은 방법입니다.

### Content negotiation

`+server.js` 파일은 `+page` 파일과 동일한 디렉터리에 배치될 수 있으므로 동일한 경로가 페이지 또는 API 엔드포인트가 될 수 있습니다. 어느 것을 결정하기 위해 SvelteKit은 다음 규칙을 적용합니다.

- `PUT`/`PATCH`/`DELETE` 요청은 페이지에 적용되지 않기 때문에 항상 `+server.js`에 의해 처리됩니다.
- `GET`/`POST` 요청은 `accept` 헤더가 `text/html`(즉, 브라우저 페이지 요청)에 우선순위를 두는 경우 페이지 요청으로 처리되고 그렇지 않으면 `+server.js`에 의해 처리됩니다.

## $types

위의 예제 전체에서 `$types.d.ts` 파일에서 유형을 가져왔습니다. 이것은 루트 파일로 작업할 때 유형 안전성을 제공하기 위해 TypeScript(또는 JSDoc 유형 주석이 있는 JavaScript)를 사용하는 경우 숨겨진 디렉토리에 SvelteKit이 생성하는 파일입니다.

예를 들어 `PageData`(또는 `+layout.svelte` 파일의 경우 `LayoutData`)로 `export let data`에 주석을 달면 TypeScript에 `data` 유형이 `load`에서 반환된 것이 무엇이든 알 수 있습니다.

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>
```

차례로 `PageLoad`, `PageServerLoad`, `LayoutLoad` 또는 `LayoutServerLoad`(각각 `+page.js`, `+page.server.js`, `+layout.js` 및 `+layout.server.js`용)로 `load` 함수에 주석을 추가하면 `params` 및 반환 값이 올바르게 입력되었는지 확인할 수 있습니다.

## Other files

경로 디렉터리 내의 다른 모든 파일은 SvelteKit에서 무시됩니다. 이는 구성 요소와 유틸리티 모듈을 필요한 경로와 함께 배치할 수 있음을 의미합니다.

구성 요소와 모듈이 여러 경로에 필요한 경우 [`$lib`](/docs/modules#$lib)에 두는 것이 좋습니다.
