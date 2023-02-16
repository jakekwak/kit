---
title: Form actions
---

`+page.server.js` 파일은 `<form>` 요소를 사용하여 서버에 `POST` 데이터를 허용하는 _actions_를 내보낼 수 있습니다.

`<form>`을 사용할 때 클라이언트 측 JavaScript는 선택 사항이지만 JavaScript와의 양식 상호 작용을 쉽게 _점진적으로 향상_하여 최상의 사용자 경험을 제공할 수 있습니다.

## Default actions

가장 간단한 경우, 페이지는 `default` 작업을 선언합니다.

```js
/// file: src/routes/login/+page.server.js
/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		// TODO log the user in
	}
};
```

`/login` 페이지에서 이 작업을 호출하려면 `<form>`을 추가하기만 하면 됩니다. JavaScript는 필요하지 않습니다.

```svelte
/// file: src/routes/login/+page.svelte
<form method="POST">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
</form>
```

누군가 버튼을 클릭하면 브라우저는 'POST' 요청을 통해 양식 데이터를 서버로 보내 기본 동작을 실행합니다.

> `GET` 요청에는 부작용이 없어야 하므로 액션은 항상 `POST` 요청을 사용합니다.

페이지를 가리키는 `action` 속성을 추가하여 다른 페이지에서 작업을 호출할 수도 있습니다(예: 루트 레이아웃의 탐색에 로그인 위젯이 있는 경우).

```html
/// file: src/routes/+layout.svelte
<form method="POST" action="/login">
	<!-- content -->
</form>
```

## Named actions

하나의 `기본` 작업 대신 페이지에 필요한 만큼 명명된 작업이 있을 수 있습니다.

```diff
/// file: src/routes/login/+page.server.js

/** @type {import('./$types').Actions} */
export const actions = {
-	default: async (event) => {
+	login: async (event) => {
		// TODO log the user in
	},
+	register: async (event) => {
+		// TODO register the user
+	}
};
```

명명된 작업을 호출하려면 `/` 문자가 접두사로 붙은 이름이 있는 쿼리 매개 변수를 추가합니다.

```svelte
/// file: src/routes/login/+page.svelte
<form method="POST" action="?/register">
```

```svelte
/// file: src/routes/+layout.svelte
<form method="POST" action="/login?/register">
```

`action` 속성뿐만 아니라 버튼의 `formaction` 속성을 사용하여 동일한 양식 데이터를 상위 `<form>`과 다른 작업에 `POST`할 수 있습니다.

```diff
/// file: src/routes/login/+page.svelte
-<form method="POST">
+<form method="POST" action="?/login">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
+	<button formaction="?/register">Register</button>
</form>
```

> 명명된 작업 옆에 기본 작업이 있을 수 없습니다. 리디렉션 없이 명명된 작업에 POST하면 쿼리 매개변수가 URL에 유지되기 때문입니다. 즉, 다음 기본 POST는 이전의 명명된 작업을 거치게 됩니다.

## Anatomy of an action

각 작업은 `RequestEvent` 객체를 수신하여 `request.formData()`로 데이터를 읽을 수 있습니다. 요청을 처리한 후(예를 들어, 쿠키를 설정하여 사용자를 로그인), 작업은 다음 업데이트까지 해당 페이지의 `form` 속성과 앱 전체의 `$page.form`을 통해 사용할 수 있는 데이터로 응답할 수 있습니다.

```js
// @errors: 2339 2304
/// file: src/routes/login/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const user = await db.getUserFromSession(cookies.get('sessionid'));
	return { user };
}

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await db.getUser(email);
		cookies.set('sessionid', await db.createSession(user));

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

```svelte
/// file: src/routes/login/+page.svelte
<script>
	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

{#if form?.success}
	<!-- this message is ephemeral; it exists because the page was rendered in
	       response to a form submission. it will vanish if the user reloads -->
	<p>Successfully logged in! Welcome back, {data.user.name}</p>
{/if}
```

### Validation errors

잘못된 데이터로 인해 요청을 처리할 수 없는 경우 사용자가 다시 시도할 수 있도록 이전에 제출한 양식 값과 함께 유효성 검사 오류를 반환할 수 있습니다. `fail` 함수를 사용하면 데이터와 함께 HTTP 상태 코드(일반적으로 유효성 검사 오류의 경우 400 또는 422)를 반환할 수 있습니다. 상태 코드는 `$page.status`를 통해, 데이터는 `form`을 통해 확인할 수 있습니다.

```diff
// @errors: 2339 2304
/// file: src/routes/login/+page.server.js
+import { fail } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

+		if (!email) {
+			return fail(400, { email, missing: true });
+		}

		const user = await db.getUser(email);

+		if (!user || user.password !== hash(password)) {
+			return fail(400, { email, incorrect: true });
+		}

		cookies.set('sessionid', await db.createSession(user));

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

> 예방 조치로 비밀번호가 아닌 이메일만 페이지로 돌려드립니다.

```diff
/// file: src/routes/login/+page.svelte
<form method="POST" action="?/login">
+	{#if form?.missing}<p class="error">The email field is required</p>{/if}
+	{#if form?.incorrect}<p class="error">Invalid credentials!</p>{/if}
	<label>
		Email
-		<input name="email" type="email">
+		<input name="email" type="email" value={form?.email ?? ''}>
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
	<button formaction="?/register">Register</button>
</form>
```

반환된 데이터는 JSON으로 직렬화 가능해야 합니다. 그 외에도 구조는 전적으로 귀하에게 달려 있습니다. 예를 들어 페이지에 여러 양식이 있는 경우 반환된 `form` 데이터가 `id` 속성 또는 이와 유사한 항목을 참조하는 `<form>`을 구분할 수 있습니다.

### Redirects

리디렉션(및 오류)은 [`load`](/docs/load#redirects)와 정확히 동일하게 작동합니다.

```diff
// @errors: 2339 2304
/// file: src/routes/login/+page.server.js
+import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
+	login: async ({ cookies, request, url }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await db.getUser(email);
		if (!user) {
			return fail(400, { email, missing: true });
		}

		if (user.password !== hash(password)) {
			return fail(400, { email, incorrect: true });
		}

		cookies.set('sessionid', await db.createSession(user));

+		if (url.searchParams.has('redirectTo')) {
+			throw redirect(303, url.searchParams.get('redirectTo'));
+		}

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

## Loading data

작업이 실행된 후 페이지는 다시 렌더링되며(리디렉션이나 예기치 않은 오류가 발생하지 않는 한) 페이지에서 'form' 소품으로 사용할 수 있는 작업의 반환 값을 사용합니다. 이는 작업이 완료된 후 페이지의 `load` 기능이 실행됨을 의미합니다.

작업이 호출되기 전에 `handle`이 실행되고 `load` 함수 전에는 다시 실행되지 않습니다. 즉, 예를 들어 `handle`을 사용하여 쿠키를 기반으로 `event.locals`를 채우는 경우 작업에서 쿠키를 설정하거나 삭제할 때 `event.locals`를 업데이트해야 합니다.

```js
/// file: src/hooks.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user: {
			name: string;
		} | null
	}
}

// @filename: global.d.ts
declare global {
	function getUser(sessionid: string | undefined): {
		name: string;
	};
}

export {};

// @filename: index.js
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await getUser(event.cookies.get('sessionid'));
	return resolve(event);
}
```

```js
/// file: src/routes/account/+page.server.js
// @filename: ambient.d.ts
declare namespace App {
	interface Locals {
		user: {
			name: string;
		} | null
	}
}

// @filename: index.js
// ---cut---
/** @type {import('./$types').PageServerLoad} */
export function load(event) {
	return {
		user: event.locals.user
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	logout: async (event) => {
		event.cookies.delete('sessionid');
		event.locals.user = null;
	}
};
```

## Progressive enhancement

이전 섹션에서 우리는 'fetch'가 아닌 [클라이언트 측 JavaScript 없이 작동하는](https://kryogenix.org/code/browser/everyonehasjs.html) `/login` 작업을 만들었습니다. 훌륭하지만 JavaScript가 _is_ 사용 가능한 경우 양식 상호 작용을 점진적으로 개선하여 더 나은 사용자 경험을 제공할 수 있습니다.

### use:enhance

양식을 점진적으로 향상시키는 가장 쉬운 방법은 `use:enhance` 작업을 추가하는 것입니다.

```diff
/// file: src/routes/login/+page.svelte
<script>
+	import { enhance } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

+<form method="POST" use:enhance>
```

> 네, `enhance` 액션과 `<form action>` 둘 다 '액션'이라고 부르는 것이 약간 혼란스럽습니다. 이 문서는 액션으로 가득 차 있습니다. 죄송합니다.

인수가 없으면 `use:enhance`는 전체 페이지를 다시 로드하지 않고 브라우저 고유의 동작을 에뮬레이트합니다. 그것은:

- 응답이 성공하거나 유효하지 않은 경우 `form` 속성, `$page.form` 및 `$page.status`를 업데이트합니다. 단, 작업이 제출하려는 동일한 페이지에 있는 경우에만 가능합니다. 예를 들어 양식이 `<form action="/somewhere/else" ..>`와 같은 경우 `form` 및 `$page`는 업데이트되지 _않습니다_. 이는 기본 양식 제출 사례에서 작업이 진행 중인 페이지로 리디렉션되기 때문입니다.
- 성공적인 응답에서 `<form>` 요소를 재설정하고 `invalidateAll`을 사용하여 모든 데이터를 무효화합니다.
- 리디렉션 응답에서 `goto` 호출
- 오류가 발생하면 가장 가까운 `+error` 경계를 렌더링합니다.
- 적절한 요소로 [포커스 재설정](/docs/accessibility#focus-management)

동작을 사용자 지정하려면 양식이 제출되기 직전에 실행되는 `SubmitFunction`을 제공하고 (선택 사항) `ActionResult`와 함께 실행되는 콜백을 반환할 수 있습니다. 콜백을 반환하면 위에서 언급한 기본 동작이 트리거되지 않습니다. 다시 가져오려면 `update`를 호출하십시오.

```svelte
<form
	method="POST"
	use:enhance={({ form, data, action, cancel }) => {
		// `form` is the `<form>` element
		// `data` is its `FormData` object
		// `action` is the URL to which the form is posted
		// `cancel()` will prevent the submission

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the logic that would be triggered if this callback wasn't set
		};
	}}
>
```

이러한 기능을 사용하여 로딩 UI 등을 표시하거나 숨길 수 있습니다.

### applyAction

자체 콜백을 제공하는 경우 가장 가까운 `+error` 경계 표시와 같은 기본 `use:enhance` 동작의 일부를 재현해야 할 수 있습니다. 대부분의 경우 콜백에 전달된 `update`를 호출하는 것으로 충분합니다. 더 많은 사용자 지정이 필요한 경우 `applyAction`을 사용하여 수행할 수 있습니다.

```diff
<script>
+	import { enhance, applyAction } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<form
	method="POST"
	use:enhance={({ form, data, action, cancel }) => {
		// `form` is the `<form>` element
		// `data` is its `FormData` object
		// `action` is the URL to which the form is posted
		// `cancel()` will prevent the submission

		return async ({ result }) => {
			// `result` is an `ActionResult` object
+			if (result.type === 'error') {
+				await applyAction(result);
+			}
		};
	}}
>
```

`applyAction(result)`의 동작은 `result.type`에 따라 다릅니다.

- `success`, `failure` — `$page.status`를 `result.status`로 설정하고 `form` 및 `$page.form`을 `result.data`로 업데이트합니다.('enhance'의 'update'와 달리 제출 위치에 관계없이)
- `redirect` — `goto(result.location)` 호출
- `error` — `result.error`로 가장 가까운 `+error` 경계를 렌더링합니다.

모든 경우에 [포커스가 재설정됩니다](/docs/accessibility#focus-management).

### Custom event listener

또한 `<form>`에서 일반 이벤트 리스너를 사용하여 `use:enhance` 없이 점진적 향상을 직접 구현할 수도 있습니다.

```svelte
/// file: src/routes/login/+page.svelte
<script>
	import { invalidateAll, goto } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;

	/** @type {any} */
	let error;

	async function handleSubmit(event) {
		const data = new FormData(this);

		const response = await fetch(this.action, {
			method: 'POST',
			body: data
		});

		/** @type {import('@sveltejs/kit').ActionResult} */
		const result = deserialize(await response.text());

		if (result.type === 'success') {
			// re-run all `load` functions, following the successful update
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<form method="POST" on:submit|preventDefault={handleSubmit}>
	<!-- content -->
</form>
```

`$app/forms`의 해당 메서드를 사용하여 응답을 추가로 처리하기 전에 응답을 `역직렬화`해야 합니다. `JSON.parse()`는 `load` 함수와 같은 양식 작업이 `Date` 또는 `BigInt` 객체 반환도 지원하기 때문에 충분하지 않습니다.

`+page.server.js` 옆에 `+server.js`가 있는 경우 `fetch` 요청은 기본적으로 해당 위치로 라우팅됩니다. 대신 `+page.server.js`의 작업에 `POST`하려면 사용자 정의 `x-sveltekit-action` 헤더를 사용하십시오.

```diff
const response = await fetch(this.action, {
	method: 'POST',
	body: data,
+	headers: {
+		'x-sveltekit-action': 'true'
+	}
});
```

## Alternatives

양식 작업은 점진적으로 향상될 수 있으므로 서버에 데이터를 보내는 데 선호되는 방법이지만 [`+server.js`](/docs/routing#server) 파일을 사용하여(예를 들어) JSON API를 노출할 수도 있습니다.

## GET vs POST

본 것처럼 양식 작업을 호출하려면 `method="POST"`를 사용해야 합니다.

일부 양식은 예를 들어 검색 입력과 같이 서버에 데이터를 'POST'할 필요가 없습니다. 이를 위해 `method="GET"`(또는 `method`가 전혀 없음)을 사용할 수 있으며 SvelteKit은 전체 페이지 탐색 대신 클라이언트 측 라우터를 사용하여 `<a>` 요소처럼 처리합니다. :

```html
<form action="/search">
	<label>
		Search
		<input name="q">
	</label>
</form>
```

`<a>` 요소와 마찬가지로 [`data-sveltekit-reload`](/docs/link-options#data-sveltekit-reload) 및 [`data-sveltekit-noscroll`](/docs/link-options#data-sveltekit-noscroll) 속성을 `<form>`에 지정하여 라우터의 동작을 제어합니다.
