---
title: Loading data
---

[`+page.svelte`](/docs/routing#page-page-svelte) 구성 요소(및 포함하는 [`+layout.svelte`](/docs/routing#layout-layout-svelte) 구성 요소)를 렌더링하기 전에 종종 일부 데이터를 가져와야 합니다. 이는 `load` 함수를 정의하여 수행됩니다.

## Page data

`+page.svelte` 파일에는 `load` 함수를 내보내는 형제 `+page.js`(또는 `+page.ts`)가 있을 수 있으며 반환 값은 `data` prop을 통해 페이지에서 사용할 수 있습니다:

```js
/// file: src/routes/blog/[slug]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		post: {
			title: `Title for ${params.slug} goes here`,
			content: `Content for ${params.slug} goes here`
		}
	};
}
```

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

생성된 `$types` 모듈 덕분에 완전한 유형 안전성을 얻을 수 있습니다.

`+page.js` 파일의 `load` 기능은 서버와 브라우저 모두에서 실행됩니다. `load` 함수가 _항상_ 서버에서 실행되어야 하는 경우(예를 들어 개인 환경 변수를 사용하거나 데이터베이스에 액세스하기 때문에) 대신 `+page.server.js`로 이동합니다.

서버에서만 실행되고 데이터베이스에서 데이터를 가져오는 보다 현실적인 블로그 게시물의 `load` 기능은 다음과 같습니다.

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

서버 `load` 함수가 추가 인수에 액세스할 수 있기 때문에 유형이 `PageLoad`에서 `PageServerLoad`로 변경되었습니다. `+page.js`를 사용해야 하는 경우와 `+page.server.js`를 사용해야 하는 경우를 이해하려면 [Universal 대 서버](/docs/load#universal-vs-server)를 참조하세요.

## Layout data

`+layout.svelte` 파일은 `+layout.js` 또는 `+layout.server.js`를 통해 데이터를 로드할 수도 있습니다.

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

```svelte
/// file: src/routes/blog/[slug]/+layout.svelte
<script>
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<main>
	<slot>
		<!-- +page.svelte is rendered here -->
	</slot>
</main>

<aside>
	<h2>More posts</h2>
	<ul>
		{#each data.posts as post}
			<li>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</li>
		{/each}
	</ul>
</aside>
```

레이아웃 `load` 함수에서 반환된 데이터는 자식 `+layout.svelte` 구성 요소 및 `+page.svelte` 구성 요소와 '속해 있는' 레이아웃에서 사용할 수 있습니다.

```diff
/// file: src/routes/blog/[slug]/+page.svelte
<script>
+	import { page } from '$app/stores';

	/** @type {import('./$types').PageData} */
	export let data;

+	// we can access `data.posts` because it's returned from
+	// the parent layout `load` function
+	$: index = data.posts.findIndex(post => post.slug === $page.params.slug);
+	$: next = data.posts[index - 1];
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

+{#if next}
+	<p>Next post: <a href="/blog/{next.slug}">{next.title}</a></p>
+{/if}
```

> 여러 `load` 함수가 동일한 키로 데이터를 반환하는 경우 마지막 것이 '우선'합니다 — `{ a: 1, b: 2 }`를 반환하는 레이아웃 `load`와 `{ b: 3, c: 4 }`를 반환하는 페이지 `load`의 결과는 `{ a: 1, b: 3 , c: 4}`입니다.

## $page.data

`+page.svelte` 구성 요소와 그 위의 각 `+layout.svelte` 구성 요소는 자체 데이터와 부모의 모든 데이터에 액세스할 수 있습니다.

어떤 경우에는 그 반대가 필요할 수 있습니다. 상위 레이아웃이 페이지 데이터 또는 하위 레이아웃의 데이터에 액세스해야 할 수도 있습니다. 예를 들어 루트 레이아웃은 `+page.js` 또는 `+page.server.js`의 `load` 함수에서 반환된 `title` 속성에 액세스하려고 할 수 있습니다. 이는 `$page.data`로 수행할 수 있습니다.

```svelte
/// file: src/routes/+layout.svelte
<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{$page.data.title}</title>
</svelte:head>
```

`$page.data`에 대한 유형 정보는 `App.PageData`에서 제공됩니다.

## Universal vs server

살펴본 바와 같이 `load` 함수에는 두 가지 유형이 있습니다.

* `+page.js` 및 `+layout.js` 파일은 서버와 브라우저 모두에서 실행되는 _universal_ `load` 기능을 내보냅니다.
* `+page.server.js` 및 `+layout.server.js` 파일은 서버측에서만 실행되는 _server_ `load` 기능을 내보냅니다.

개념적으로는 동일하지만 알아야 할 몇 가지 중요한 차이점이 있습니다.

### Input

범용 및 서버 `load` 기능 모두 요청을 설명하는 속성(`params`, `route` 및 `url`)과 다양한 기능(`fetch`, `setHeaders`, `parent` 및 `depends`)에 액세스할 수 있습니다. 이에 대해서는 다음 섹션에서 설명합니다.

서버 `load` 함수는 `RequestEvent`에서 `clientAddress`, `cookies`, `locals`, `platform` 및 `request`를 상속하는 `ServerLoadEvent`로 호출됩니다.

범용 `load` 함수는 `data` 속성이 있는 `LoadEvent`로 호출됩니다. `+page.js` 및 `+page.server.js` (또는 `+layout.js` 및 `+layout.server.js`) 모두에 `load` 함수가 있는 경우 서버 `load` 함수의 반환 값은 범용 `load` 함수 인수의 `data` 속성입니다.

### Output

범용 `load` 함수는 사용자 지정 클래스 및 구성 요소 생성자와 같은 것을 포함하여 모든 값을 포함하는 개체를 반환할 수 있습니다.

서버 `load` 기능은 네트워크를 통해 전송될 수 있도록 [devalue](https://github.com/rich-harris/devalue) — JSON과 `BigInt`, `Date`, `Map`, `Set` 및 `RegExp` 또는 반복/순환 참조로 표현될 수 있는 모든 것 — 로 직렬화할 수 있는 데이터를 반환해야 합니다.

### When to use which

서버 `로드` 기능은 데이터베이스나 파일 시스템에서 직접 데이터에 액세스해야 하거나 사설 환경 변수를 사용해야 할 때 편리합니다.

SvelteKit은 서버를 통하지 않고 API에서 직접 데이터를 가져올 수 있으므로 외부 API에서 데이터를 '가져오기'해야 하고 개인 자격 증명이 필요하지 않은 경우 범용 '로드' 기능이 유용합니다. Svelte 구성 요소 생성자와 같이 직렬화할 수 없는 항목을 반환해야 하는 경우에도 유용합니다.

드물게 두 가지를 함께 사용해야 할 수도 있습니다. 예를 들어 서버의 데이터로 초기화된 사용자 지정 클래스의 인스턴스를 반환해야 할 수 있습니다.

## Using URL data

종종 `load` 함수는 어떤 식으로든 URL에 의존합니다. 이를 위해 `load` 함수는 `url`, `route` 및 `params`를 제공합니다.

### url

`origin`, `hostname`, `pathname` 및 `searchParams`와 같은 속성을 포함하는 [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)의 인스턴스(파싱된 쿼리 문자열을 [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) 개체로 포함)인 `url.hash`는 서버에서 사용할 수 없기 때문에 `load` 중에 액세스할 수 없습니다.
????

> 일부 환경에서는 서버 측 렌더링 중에 요청 헤더에서 파생됩니다. 예를 들어 [adapter-node](/docs/adapter-node)를 사용하는 경우 URL이 정확하도록 어댑터를 구성해야 할 수 있습니다.

### route

`src/routes`에 상대적인 현재 경로 디렉토리의 이름을 포함합니다:

```js
/// file: src/routes/a/[b]/[...c]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ route }) {
	console.log(route.id); // '/a/[b]/[...c]'
}
```

### params

`params`는 `url.pathname` 및 `route.id`에서 파생됩니다.

`/a/[b]/[...c]`의 `route.id`와 `/a/x/y/z`의 `url.pathname`이 주어지면 `params` 개체는 다음과 같습니다:

```json
{
	"b": "x",
	"c": "y/z"
}
```

## Making fetch requests

외부 API 또는 `+server.js` 핸들러에서 데이터를 가져오려면 제공된 `fetch` 함수를 사용할 수 있습니다. 이 함수는 [네이티브 `fetch` 웹 API](https://developer.mozilla.org/en-US/docs/Web/API/fetch)와 동일하게 작동하며 몇 가지 추가 기능이 있습니다.

- 페이지 요청에 대한 `cookie` 및 `authorization` 헤더를 상속하므로 서버에서 인증된 요청을 만드는 데 사용할 수 있습니다.
- 서버에서 상대적인 요청을 할 수 있습니다(일반적으로 `fetch`는 서버 컨텍스트에서 사용될 때 출처가 있는 URL이 필요함)
- 내부 요청(예: `+server.js` 경로)은 HTTP 호출의 오버헤드 없이 서버에서 실행될 때 핸들러 함수로 직접 이동합니다.
- 서버 측 렌더링 중에 응답이 캡처되어 렌더링된 HTML에 인라인됩니다. 헤더는 [`filterSerializedResponseHeaders`](/docs/hooks#server-hooks-handle)를 통해 명시적으로 포함되지 않는 한 직렬화되지 _않습니다_. 그런 다음 수화 중에 HTML에서 응답을 읽어 일관성을 보장하고 추가 네트워크 요청을 방지합니다. `load` `fetch` 대신 브라우저 `fetch`를 사용할 때 브라우저 콘솔에 경고가 표시되는 경우 이것이 그 이유입니다.

```js
/// file: src/routes/items/[id]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();

	return { item };
}
```

> 쿠키는 대상 호스트가 SvelteKit 애플리케이션 또는 보다 구체적인 하위 도메인과 동일한 경우에만 전달됩니다.

## Cookies and headers

서버 `로드` 기능은 [`쿠키`](/docs/types#public-types-cookies)를 가져오고 설정할 수 있습니다.

```js
/// file: src/routes/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getUser(sessionid: string | undefined): Promise<{ name: string, avatar: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
```

> 쿠키를 설정할 때 `path` 속성에 유의하십시오. 기본적으로 쿠키의 '경로'는 현재 경로 이름입니다. 예를 들어 `admin/user` 페이지에서 쿠키를 설정하면 쿠키는 기본적으로 `admin` 페이지 내에서만 사용할 수 있습니다. 대부분의 경우 앱 전체에서 쿠키를 사용할 수 있도록 `path`를 `'/'`로 설정하는 것이 좋습니다.

서버 및 범용 `load` 기능 모두 서버에서 실행될 때 응답에 대한 헤더를 설정할 수 있는 `setHeaders` 기능에 액세스할 수 있습니다. (브라우저에서 실행할 때 `setHeaders`는 효과가 없습니다.) 이것은 페이지를 캐시하려는 경우에 유용합니다. 예를 들면 다음과 같습니다.

```js
// @errors: 2322 1360
/// file: src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/products.json`;
	const response = await fetch(url);

	// cache the page for the same length of time
	// as the underlying data
	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

동일한 헤더를 여러 번 설정하는 것은(별도의 `load` 함수에서도) 오류입니다. 지정된 헤더는 한 번만 설정할 수 있습니다. `setHeaders`로 `set-cookie` 헤더를 추가할 수 없습니다. 대신 `cookies.set(name, value, options)`을 사용하세요.

## Using parent data

때때로 `load` 함수가 `await parent()`로 수행할 수 있는 상위 `load` 함수의 데이터에 액세스하는 것이 유용합니다.

```js
/// file: src/routes/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return { a: 1 };
}
```

```js
/// file: src/routes/abc/+layout.js
/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

```js
/// file: src/routes/abc/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { a, b } = await parent();
	return { c: a + b };
}
```

```svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<!-- renders `1 + 2 = 3` -->
<p>{data.a} + {data.b} = {data.c}</p>
```

> `+page.js`의 `load` 함수는 직계 부모뿐만 아니라 두 레이아웃 `load` 함수에서 병합된 데이터를 수신합니다.

`+page.server.js` 및 `+layout.server.js` 내에서 `parent`는 상위 `+layout.server.js` 파일의 데이터를 반환합니다.

`+page.js` 또는 `+layout.js`에서 상위 `+layout.js` 파일의 데이터를 반환합니다. 그러나 누락된 `+layout.js`는 `({ data }) => data` 함수로 처리되며, 이는 `+layout.js` 파일에 의해 '섀도잉'되지 않는 상위 `+layout.server.js` 파일의 데이터도 반환함을 의미합니다.

`await parent()`를 사용할 때 폭포를 도입하지 않도록 주의하세요. 여기서 예를 들어 `getData(params)`는 `parent()`를 호출한 결과에 의존하지 않으므로 지연 렌더링을 피하기 위해 먼저 호출해야 합니다.

```diff
/// file: +page.js
/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {
-	const parentData = await parent();
	const data = await getData(params);
+	const parentData = await parent();

	return {
		...data
		meta: { ...parentData.meta, ...data.meta }
	};
}
```

## Errors

`로드` 중에 오류가 발생하면 가장 가까운 [`+error.svelte`](/docs/routing#error)가 렌더링됩니다. _expected_ 오류의 경우 `@sveltejs/kit`의 `error` 도우미를 사용하여 HTTP 상태 코드와 선택적 메시지를 지정합니다.

```js
/// file: src/routes/admin/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
			isAdmin: boolean;
		}
	}
}

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		throw error(401, 'not logged in');
	}

	if (!locals.user.isAdmin) {
		throw error(403, 'not an admin');
	}
}
```

_예기치 않은_ 오류가 발생하면 SvelteKit은 [`handleError`](/docs/hooks#shared-hooks-handleerror)를 호출하고 이를 500 내부 오류로 처리합니다.

## Redirects

사용자를 리디렉션하려면 `@sveltejs/kit`의 `redirect` 도우미를 사용하여 `3xx` 상태 코드와 함께 리디렉션되어야 하는 위치를 지정하세요.

```js
/// file: src/routes/user/+layout.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user?: {
			name: string;
		}
	}
}

// @filename: index.js
// ---cut---
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		throw redirect(307, '/login');
	}
}
```

## Promise unwrapping

폭포수를 생성하지 않고 여러 Promise를 쉽게 반환할 수 있는 최상위 Promise가 대기됩니다.

```js
/// file: src/routes/+page.js
/** @type {import('./$types').PageServerLoad} */
export function load() {
	return {
		a: Promise.resolve('a'),
		b: Promise.resolve('b'),
		c: {
			value: Promise.resolve('c')
		}
	};
}
```

```svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;

	console.log(data.a); // 'a'
	console.log(data.b); // 'b'
	console.log(data.c.value); // `Promise {...}`
</script>
```

## Parallel loading

페이지를 렌더링(또는 탐색)할 때 SvelteKit은 모든 `load` 기능을 동시에 실행하여 요청 폭포를 방지합니다. 클라이언트 측 탐색 중에 여러 서버 `load` 함수를 호출한 결과는 단일 응답으로 그룹화됩니다. 모든 `load` 함수가 반환되면 페이지가 렌더링됩니다.

## Invalidation

SvelteKit은 탐색 중에 불필요하게 다시 실행하지 않도록 각 `load` 기능의 종속성을 추적합니다.

예를 들어, 다음과 같은 한 쌍의 `load` 함수가 주어지면...

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string }>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

```js
/// file: src/routes/blog/[slug]/+layout.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPostSummaries(): Promise<Array<{ title: string, slug: string }>>
}

// @filename: index.js
// ---cut---
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

...`params.slug`가 변경되었기 때문에 `/blog/trying-the-raw-meat-diet`에서 `/blog/i-regret-my-choices`로 이동하면 `+page.server.js`에 있는 항목이 다시 실행됩니다. 데이터가 여전히 유효하기 때문에 `+layout.server.js`에 있는 항목은 그렇지 않습니다. 즉, `db.getPostSummaries()`를 두 번 호출하지 않습니다.

부모 `load` 함수가 다시 실행되면 `await parent()`를 호출하는 `load` 함수도 다시 실행됩니다.

### Manual invalidation

`url`에 의존하는 모든 `load` 기능을 다시 실행하는 [`invalidate(url)`](/docs/modules#$app-navigation-invalidate)과 모든 `load` 함수를 다시 실행하는 [`invalidateAll()`](/docs/modules#$app-navigation-invalidateall) 을 사용하여 현재 페이지에 적용되는 `load` 기능을 다시 실행할 수도 있습니다.

`load` 함수는 `fetch(url)` 또는 `depends(url)`을 호출하는 경우 `url`에 종속됩니다. `url`은 `[a-z]:`로 시작하는 사용자 지정 식별자일 수 있습니다.

```js
/// file: src/routes/random-number/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, depends }) {
	// load reruns when `invalidate('https://api.example.com/random-number')` is called...
	const response = await fetch('https://api.example.com/random-number');

	// ...or when `invalidate('app:random')` is called
	depends('app:random');

	return {
		number: await response.json()
	};
}
```

```svelte
/// file: src/routes/random-number/+page.svelte
<script>
	import { invalidate, invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	export let data;

	function rerunLoadFunction() {
		// any of these will cause the `load` function to re-run
		invalidate('app:random');
		invalidate('https://api.example.com/random-number');
		invalidate(url => url.href.includes('random-number'));
		invalidateAll();
	}
</script>

<p>random number: {data.number}</p>
<button on:click={rerunLoadFunction}>Update random number</button>
```

요약하면 다음과 같은 상황에서 `load` 함수가 다시 실행됩니다.

- 값이 변경된 `params`의 속성을 참조합니다.
- 값이 변경된 `url` 속성(예: `url.pathname` 또는 `url.search`)을 참조합니다.
- `await parent()`를 호출하고 부모 `load` 함수를 다시 실행합니다.
- [`fetch`](#making-fetch-requests) 또는 [`depends`](/docs/types#public-types-loadevent)를 통해 특정 URL에 대한 종속성을 선언했으며 해당 URL은 [`invalidate(url)`](/docs/modules#$app-navigation-invalidateall)로 유효하지 않은 것으로 표시되었습니다.
- 모든 활성 `load` 함수가 [`invalidateAll()`](/docs/modules#$app-navigation-invalidateall)로 강제로 다시 실행되었습니다.

`load` 함수를 다시 실행하면 해당 `+layout.svelte` 또는 `+page.svelte` 내부의 `data` 소품이 업데이트됩니다. 구성 요소가 재생성되지 _않습니다_. 결과적으로 내부 상태가 보존됩니다. 이것이 원하는 것이 아닌 경우 [`afterNavigate`](/docs/modules#$app-navigation-afternavigate) 콜백 내에서 재설정하는 데 필요한 모든 것을 재설정하거나 구성 요소를 [`{#key ...}`](https://svelte.dev/docs#template-syntax-key) 블록으로 래핑할 수 있습니다.

## Shared state

많은 서버 환경에서 앱의 단일 인스턴스가 여러 사용자에게 서비스를 제공합니다. 이러한 이유로 요청당 또는 사용자당 상태는 `load` 함수 외부의 공유 변수에 저장하면 안 되며 대신 `event.locals`에 저장해야 합니다.
