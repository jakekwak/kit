---
title: Hooks
---

'후크'는 SvelteKit이 특정 이벤트에 대한 응답으로 호출하도록 선언한 앱 전체 기능으로, 프레임워크의 동작을 세밀하게 제어할 수 있습니다.

선택 사항인 두 개의 후크 파일이 있습니다.

- `src/hooks.server.js` — your app's server hooks
- `src/hooks.client.js` — your app's client hooks

이러한 모듈의 코드는 응용 프로그램이 시작될 때 실행되므로 데이터베이스 클라이언트 초기화 등에 유용합니다.

> [`config.kit.files.hooks`](/docs/configuration#files)를 사용하여 이러한 파일의 위치를 구성할 수 있습니다.

## Server hooks

다음 후크를 `src/hooks.server.js`에 추가할 수 있습니다.

### handle

이 함수는 SvelteKit 서버가 [request](/docs/web-standards#fetch-apis-request)을 — 앱이 실행되는 동안 또는 [사전 렌더링](/docs/page-options#prerender) 중에 발생하는지 여부 — 수신하고 [response](/docs/web-standards#fetch-apis-response)을 결정할 때마다 실행됩니다. 요청을 나타내는 `event` 개체와 경로를 렌더링하고 `Response`를 생성하는 `resolve`라는 함수를 받습니다. 이를 통해 응답 헤더 또는 본문을 수정하거나 SvelteKit을 완전히 우회할 수 있습니다(예: 프로그래밍 방식으로 경로 구현).



```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
}
```

> 이미 사전 렌더링된 페이지를 포함하는 정적 자산에 대한 요청은 SvelteKit에서 처리하지 _않습니다_.

구현되지 않은 경우 기본값은 `({ event, resolve }) => resolve(event)`입니다. `+server.js` 및 서버 `load` 함수의 핸들러로 전달되는 요청에 사용자 지정 데이터를 추가하려면 아래와 같이 `event.locals` 개체를 채웁니다.

```js
/// file: src/hooks.server.js
// @filename: ambient.d.ts
type User = {
	name: string;
}

declare namespace App {
	interface Locals {
		user: User;
	}
}

const getUserInformation: (cookie: string | void) => Promise<User>;

// @filename: index.js
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await getUserInformation(event.cookies.get('sessionid'));

	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}
```

여러 `handle` 함수를 정의하고 [`sequence` 도우미 함수](/docs/modules#sveltejs-kit-hooks)를 사용하여 실행할 수 있습니다.

`resolve`는 또한 응답이 렌더링되는 방법을 더 잘 제어할 수 있는 두 번째 선택적 매개변수를 지원합니다. 해당 매개변수는 다음 필드를 가질 수 있는 객체입니다.

- `transformPageChunk(opts: { html: string, done: boolean }): MaybePromise<string | undefined>` — 사용자 정의 변환을 HTML에 적용합니다. `done`이 참이면 최종 청크입니다. 청크가 올바른 형식의 HTML이라고 보장되지는 않지만(예를 들어 요소의 여는 태그는 포함할 수 있지만 닫는 태그는 포함하지 않을 수 있음) `%sveltekit.head%` 또는 레이아웃/페이지 구성 요소와 같은 적절한 경계에서 항상 분할됩니다.
- `filterSerializedResponseHeaders(name: string, value: string): boolean` — `load` 함수가 `fetch`로 리소스를 로드할 때 직렬화된 응답에 포함되어야 하는 헤더를 결정합니다. 기본적으로 아무 것도 포함되지 않습니다.
- `preload(input: { type: 'js' | 'css' | 'font' | 'asset', path: string }): boolean` — 미리 로드하기 위해 `<head>` 태그에 추가해야 하는 파일을 결정합니다. 이 메서드는 코드 청크를 구성하는 동안 빌드 시 발견된 각 파일과 함께 호출됩니다. — 예를 들어 `+page.svelte`에 `import './styles.css`가 있는 경우 해당 페이지를 방문할 때 해당 CSS 파일에 대한 확인된 경로와 함께 `preload`가 호출됩니다. 개발 모드에서 `preload`는 빌드 시간에 발생하는 분석에 의존하기 때문에 호출되지 _않습니다_. 미리 로드하면 에셋을 더 빨리 다운로드하여 성능을 향상시킬 수 있지만 불필요하게 너무 많이 다운로드하면 문제가 될 수도 있습니다. 기본적으로 `js` 및 `css` 파일이 미리 로드됩니다. `asset` 파일은 현재 전혀 사전 로드되지 않지만 피드백을 평가한 후 나중에 추가할 수 있습니다.

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('old', 'new'),
		filterSerializedResponseHeaders: (name) => name.startsWith('x-'),
		preload: ({ type, path }) => type === 'js' || path.includes('/important/')
	});

	return response;
}
```

`resolve(...)`는 오류를 발생시키지 않으며 항상 적절한 상태 코드와 함께 `Promise<Response>`를 반환합니다. `handle` 중에 다른 곳에서 오류가 발생하면 치명적인 것으로 처리되며 SvelteKit은 오류의 JSON 표현 또는 폴백 오류 페이지로 응답합니다. 이는 `src/error.html`을 통해 사용자 정의할 수 있습니다. — `Accept` 헤더에 따라 다릅니다. 오류 처리에 대한 자세한 내용은 [여기](/docs/errors)에서 확인할 수 있습니다.

### handleFetch

이 기능을 사용하면 서버에서 실행되는(또는 사전 렌더링 중에) `load` 함수 내에서 발생하는 `fetch` 요청을 수정(또는 교체)할 수 있습니다.

또는 사용자가 각 페이지에 대한 클라이언트 측 탐색을 수행할 때 `load` 기능이 `https://api.yourapp.com`와 같은 공개 URL에 요청을 할 수 있지만 SSR 중에 API를 직접 누르는 것이 합리적일 수 있습니다.(프록시와 로드 밸런서가 프록시와 공용 인터넷 사이에 있으면 우회).

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleFetch} */
export function handleFetch({ request, fetch }) {
	if (request.url.startsWith('https://api.yourapp.com/')) {
		// clone the original request, but change the URL
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request
		);
	}

	return fetch(request);
}
```

**Credentials**

동일 출처 요청의 경우 SvelteKit의 `fetch` 구현은 `credentials` 옵션이 `"omit"`로 설정되지 않은 한 `cookie` 및 `authorization` 헤더를 전달합니다.

교차 출처 요청의 경우 요청 URL이 앱의 하위 도메인에 속하는 경우 '쿠키'가 포함됩니다. — 예를 들어 앱이 `my-domain.com`에 있고 API가 `api.my-domain.com`에 있는 경우 요청에 쿠키가 포함됩니다.

앱과 API가 형제 하위 도메인에 — 예를 들어 `www.my-domain.com` 및 `api.my-domain.com` — 있는 경우 `my-domain.com`과 같은 공통 상위 도메인에 속하는 쿠키는 포함되지 _않습니다_. SvelteKit은 쿠키가 속한 도메인을 알 방법이 없기 때문입니다. 이러한 경우 `handleFetch`를 사용하여 쿠키를 수동으로 포함해야 합니다.



```js
/// file: src/hooks.server.js
// @errors: 2345
/** @type {import('@sveltejs/kit').HandleFetch} */
export function handleFetch({ event, request, fetch }) {
	if (request.url.startsWith('https://api.my-domain.com/')) {
		request.headers.set('cookie', event.request.headers.get('cookie'));
	}

	return fetch(request);
}
```

## Shared hooks

다음을 `src/hooks.server.js` _and_ `src/hooks.client.js`에 추가할 수 있습니다.

### handleError

로드 또는 렌더링 중에 예기치 않은 오류가 발생하면 `error` 및 `event`와 함께 이 함수가 호출됩니다. 이렇게 하면 다음 두 가지가 가능합니다.

- 오류를 기록할 수 있습니다.
- 메시지 및 스택 추적과 같은 민감한 세부 정보를 생략하고 사용자에게 표시해도 안전한 오류의 사용자 정의 표현을 생성할 수 있습니다. 반환된 값은 `$page.error`의 값이 됩니다. 기본값은 404 (`event.route.id`가 `null`임을 통해 감지할 수 있음)의 경우 `{ message: 'Not Found' }`이고 나머지는 `{ message: 'Internal Error' }`입니다. 이 유형을 안전하게 만들기 위해 `App.Error` 인터페이스(합리적인 폴백 동작을 보장하기 위해 `message: string`을 포함해야 함)를 선언하여 예상되는 모양을 사용자 정의할 수 있습니다.

다음 코드는 오류 모양을 `{ message: string; errorId: string }`로 입력하고 이에 따라 `handleError` 함수에서 반환하는 예를 보여줍니다.

```ts
/// file: src/app.d.ts
declare namespace App {
	interface Error {
		message: string;
		errorId: string;
	}
}
```

```js
/// file: src/hooks.server.js
// @errors: 2322
// @filename: ambient.d.ts
declare module '@sentry/node' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/node';
import crypto from 'crypto';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	Sentry.captureException(error, { event, errorId });

	return {
		message: 'Whoops!',
		errorId
	};
}
```

```js
/// file: src/hooks.client.js
// @errors: 2322
// @filename: ambient.d.ts
declare module '@sentry/svelte' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/svelte';
Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleClientError} */
export function handleError({ error, event }) {
	const errorId = crypto.randomUUID();
	// example integration with https://sentry.io/
	Sentry.captureException(error, { event, errorId });

	return {
		message: 'Whoops!',
		errorId
	};
}
```

> `src/hooks.client.js`에서 `handleError`의 유형은 `HandleServerError`가 아닌 `HandleClientError`이고 `event`는 `RequestEvent`가 아닌 `NavigationEvent`입니다.

이 함수는 _expected_ 오류(`@sveltejs/kit`에서 가져온 [`error`](/docs/modules#sveltejs-kit-error) 함수로 발생한 오류)에 대해 호출되지 않습니다.

개발 중에 Svelte 코드의 구문 오류로 인해 오류가 발생하면 전달된 오류에 'frame' 속성이 추가되어 오류 위치를 강조 표시합니다.

> `handleError` _never_에서 오류가 발생하는지 확인하세요.
