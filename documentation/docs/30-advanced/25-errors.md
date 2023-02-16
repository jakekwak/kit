---
title: Errors
---

오류는 소프트웨어 개발의 불가피한 사실입니다. SvelteKit은 오류가 발생하는 위치, 오류 종류, 들어오는 요청의 특성에 따라 오류를 다르게 처리합니다.

## Error objects

SvelteKit은 예상된 오류와 예상치 못한 오류를 구분하며 둘 다 기본적으로 간단한 `{ message: string }` 개체로 표시됩니다.

아래와 같이 `code` 또는 추적 `id`와 같은 추가 속성을 추가할 수 있습니다.

## Expected errors

_expected_ 오류는 `@sveltejs/kit`에서 가져온 [`error`](/docs/modules#sveltejs-kit-error) 도우미로 생성된 오류입니다:

```js
/// file: src/routes/blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$lib/server/database' {
	export function getPost(slug: string): Promise<{ title: string, content: string } | undefined>
}

// @filename: index.js
// ---cut---
import { error } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await db.getPost(params.slug);

	if (!post) {
		throw error(404, {
			message: 'Not found'
		});
	}

	return { post };
}
```

이것은 응답 상태 코드를 404로 설정하고 [`+error.svelte`](/docs/routing#error) 구성 요소를 렌더링하도록 SvelteKit에 지시합니다. 여기서 `$page.error`는 `error(...)`에 대한 두 번째 인수로 제공된 개체입니다.

```svelte
/// file: src/routes/+error.svelte
<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.error.message}</h1>
```

필요한 경우 오류 개체에 추가 속성을 추가할 수 있습니다...

```diff
throw error(404, {
	message: 'Not found',
+	code: 'NOT_FOUND'
});
```

...그렇지 않으면 편의를 위해 문자열을 두 번째 인수로 전달할 수 있습니다:

```diff
-throw error(404, { message: 'Not found' });
+throw error(404, 'Not found');
```

## Unexpected errors

_예기치 않은_ 오류는 요청을 처리하는 동안 발생하는 다른 예외입니다. 여기에는 민감한 정보가 포함될 수 있으므로 예기치 않은 오류 메시지 및 스택 추적이 사용자에게 노출되지 않습니다.

기본적으로 예기치 않은 오류는 콘솔(또는 프로덕션에서는 서버 로그)에 인쇄되는 반면 사용자에게 표시되는 오류는 일반적인 모양을 갖습니다.

```json
{ "message": "Internal Error" }
```

예기치 않은 오류는 [`handleError`](/docs/hooks#shared-hooks-handleerror) 후크를 통과합니다. 여기에서 자체 오류 처리를 추가할 수 있습니다(예: 보고 서비스에 오류 전송 또는 사용자 지정 오류 개체 반환). .

```js
/// file: src/hooks.server.js
// @errors: 2322 1360 2571 2339
// @filename: ambient.d.ts
declare module '@sentry/node' {
	export const init: (opts: any) => void;
	export const captureException: (error: any, opts: any) => void;
}

// @filename: index.js
// ---cut---
import * as Sentry from '@sentry/node';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
	// example integration with https://sentry.io/
	Sentry.captureException(error, { event });

	return {
		message: 'Whoops!',
		code: error?.code ?? 'UNKNOWN'
	};
}
```

> `handleError`가 오류를 발생시키지 _않도록_ 합니다.

## Responses

`handle` 내부 또는 [`+server.js`](/docs/routing#server) 요청 처리기 내부에서 오류가 발생하면 SvelteKit은 요청의 `Accept` 헤더에 따라 폴백 오류 페이지 또는 오류 개체의 JSON 표현으로 응답합니다.

`src/error.html` 파일을 추가하여 폴백 오류 페이지를 사용자 정의할 수 있습니다.

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>%sveltekit.error.message%</title>
	</head>
	<body>
		<h1>My custom error page</h1>
		<p>Status: %sveltekit.status%</p>
		<p>Message: %sveltekit.error.message%</p>
	</body>
</html>
```

SvelteKit은 `%sveltekit.status%` 및 `%sveltekit.error.message%`를 해당 값으로 대체합니다.

대신 페이지를 렌더링하는 동안 `load` 함수 내에서 오류가 발생하면 SvelteKit은 오류가 발생한 위치에서 가장 가까운 [`+error.svelte`](/docs/routing#error) 구성 요소를 렌더링합니다. 오류가 `+layout(.server).js`의 `load` 함수 내에서 발생하는 경우 트리에서 가장 가까운 오류 경계는 레이아웃 _위_에 있는 `+error.svelte` 파일입니다(옆이 아님).

예외는 루트 `+layout.js` 또는 `+layout.server.js` 내부에서 오류가 발생하는 경우입니다. 루트 레이아웃은 일반적으로 `+error.svelte` 구성 요소를 _포함하기_ 때문입니다. 이 경우 SvelteKit은 폴백 오류 페이지를 사용합니다.

## Type safety

TypeScript를 사용 중이고 오류 모양을 사용자 지정해야 하는 경우 앱에서 `App.Error` 인터페이스를 선언하여 수행할 수 있습니다.(관습에 따라 `src/app.d.ts`에 있지만 TypeScript가 '볼' 수 있는 모든 위치에 있을 수 있습니다.)

```ts
/// file: src/app.d.ts
declare namespace App {
	interface Error {
		code: string;
		id: string;
	}
}
```

이 인터페이스는 항상 `message: string` 속성을 포함합니다.