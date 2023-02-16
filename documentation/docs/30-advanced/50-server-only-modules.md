---
title: Server-only modules
---

좋은 친구처럼 SvelteKit은 당신의 비밀을 지켜줍니다. 동일한 리포지토리에서 백엔드와 프런트엔드를 작성할 때 실수로 민감한 데이터를 프런트엔드 코드(예: API 키를 포함하는 환경 변수)로 쉽게 가져올 수 있습니다. SvelteKit은 이를 완전히 방지하는 방법인 서버 전용 모듈을 제공합니다.

## Private environment variables

[modules](/docs/modules) 섹션에서 다루는 `$env/static/private` 및 `$env/dynamic/private` 모듈은 [`hooks.server.js`](/docs/hooks#server-hooks) 또는 [`+page.server.js`](/docs/routing#page-page-server-js)와 같이 서버에서만 실행되는 모듈로만 가져올 수 있습니다.

## Your modules

두 가지 방법으로 자체 모듈을 서버 전용으로 만들 수 있습니다.

- 파일 이름에 `.server` 추가, 예: `secrets.server.js`
- `$lib/server`에 배치합니다. 예: `$lib/server/secrets.js`

## How it works

서버 전용 코드(직접이든 간접적이든)를 가져오는 공개 코드가 있는 경우...

```js
// @errors: 7005
/// file: $lib/server/secrets.js
export const atlantisCoordinates = [/* redacted */];
```

```js
// @errors: 2307 7006 7005
/// file: src/routes/utils.js
export { atlantisCoordinates } from '$lib/server/secrets.js';

export const add = (a, b) => a + b;
```

```html
/// file: src/routes/+page.svelte
<script>
	import { add } from './utils.js';
</script>
```

...SvelteKit에서 오류가 발생합니다:

```
Cannot import $lib/server/secrets.js into public-facing code:
- src/routes/+page.svelte
	- src/routes/utils.js
		- $lib/server/secrets.js
```

공개 코드가  — `src/routes/+page.svelte` — `add` 내보내기만 사용하고 비밀 `atlantisCoordinates` 내보내기는 사용하지 않더라도 비밀 코드는 브라우저가 다운로드하는 JavaScript로 끝날 수 있으므로 가져오기 체인이 안전하지 않은 것으로 간주됩니다.

이 기능은 또한 ``await import(`./${foo}.js`)``와 같은 보간된 가져오기와 같은 동적 가져오기에서도 작동하지만 한 가지 작은 주의 사항이 있습니다. - 대면 코드 및 서버 전용 모듈, 코드가 처음 로드될 때 불법 가져오기가 감지되지 않습니다.