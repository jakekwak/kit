---
title: Web standards
---

이 문서 전체에서 SvelteKit이 기반으로 하는 표준 [웹 API](https://developer.mozilla.org/en-US/docs/Web/API)에 대한 참조를 볼 수 있습니다. 우리는 바퀴를 재발명하는 대신 _플랫폼을 사용_합니다. 즉, 기존 웹 개발 기술을 SvelteKit에 적용할 수 있습니다. 반대로 SvelteKit을 배우는 시간은 다른 곳에서 더 나은 웹 개발자가 되는 데 도움이 됩니다.

이러한 API는 모든 최신 브라우저와 Cloudflare Workers, Deno 및 Vercel Edge Functions와 같은 많은 비브라우저 환경에서 사용할 수 있습니다. 개발 중에 노드 기반 환경(AWS Lambda 포함)의 [adapters](/docs/adapters)에서 필요한 경우 폴리필을 통해 사용할 수 있습니다(현재로서는 Node가 더 많은 웹 표준에 대한 지원을 빠르게 추가하고 있음) ).

특히 다음 사항에 익숙해질 것입니다.

## Fetch APIs

SvelteKit은 [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch)를 사용하여 네트워크에서 데이터를 가져옵니다. [후크](/docs/hooks) 및 [서버 경로](/docs/routing#server) 및 브라우저에서 사용할 수 있습니다.

> [`load`](/docs/load) 함수에서 'fetch'의 특수 버전을 사용할 수 있습니다. 이 기능은 자격 증명을 보존하면서 HTTP 호출을 하지 않고 서버 측 렌더링 중에 엔드포인트를 직접 호출합니다.(`load` 외부의 서버 측 코드에서 자격 증명을 가져오려면 `cookie` 및/또는 `authorization` 헤더를 명시적으로 전달해야 합니다.) 또한 상대적인 요청을 할 수 있는 반면 서버 측 `가져오기`에는 일반적으로 정규화된 URL이 필요합니다.

`fetch` 자체 외에도 [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)에는 다음 인터페이스가 포함되어 있습니다.

### Request

[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) 인스턴스는 [hooks](/docs/hooks) 및 [server route](/docs/routing#server)에서 `event.request`로 액세스할 수 있습니다. 여기에는 엔드포인트에 게시된 데이터를 가져오기 위한 `request.json()` 및 `request.formData()`와 같은 유용한 메서드가 포함되어 있습니다.

### Response

[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) 인스턴스는 `await fetch(...)` 및 `+server.js` 파일의 핸들러에서 반환됩니다. 기본적으로 SvelteKit 앱은 `Request`을 `Response`으로 바꾸는 기계입니다.

### Headers

[`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) 인터페이스를 사용하면 들어오는 `request.headers`를 읽고 나가는 `response.headers`를 설정할 수 있습니다.

```js
// @errors: 2461
/// file: src/routes/what-is-my-user-agent/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET(event) {
	// log all headers
	console.log(...event.request.headers);

	return json({
		// retrieve a specific header
		userAgent: event.request.headers.get('user-agent')
	});
}
```

## FormData

HTML 기본 양식 제출을 처리할 때 [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) 객체로 작업하게 됩니다.

```js
// @errors: 2461
/// file: src/routes/hello/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const body = await event.request.formData();

	// log all fields
	console.log([...body]);

	return json({
		// get a specific field's value
		name: body.get('name') ?? 'world'
	});
}
```

## Stream APIs

대부분의 경우 엔드포인트는 위의 'userAgent' 예에서와 같이 완전한 데이터를 반환합니다. 때로는 한 번에 메모리에 담기에는 너무 크거나 청크로 전달되는 응답을 반환해야 할 수 있습니다. 이를 위해 플랫폼은 [streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) — [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), [WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) 및 [TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)을 제공합니다.

## URL APIs

URL은 `origin` 및 `pathname` 과 같은 유용한 속성을 포함하는 [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) 인터페이스로 표시됩니다. 이 인터페이스는 [후크](/docs/hooks) 및 [서버 경로](/docs/routing#server)의 `event.url`, [페이지](/docs/routing#page)의 [`$page.url`](/docs/modules#$app-stores), [`beforeNavigate` 및 `afterNavigate`](/docs/modules#$app-navigation) 등등의 `from` 및 `to` 등 다양한 위치에 표시됩니다.

### URLSearchParams

URL이 나타날 때마다 [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams의 인스턴스인 `url.searchParams`를 통해 쿼리 매개변수에 액세스할 수 있습니다. ):

```js
// @filename: ambient.d.ts
declare global {
	const url: URL;
}

export {};

// @filename: index.js
// ---cut---
const foo = url.searchParams.get('foo');
```

## Web Crypto

[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)는 `crypto` global을 통해 사용할 수 있습니다. [콘텐츠 보안 정책](/docs/configuration#csp) 헤더에 내부적으로 사용되지만 UUID 생성과 같은 용도로도 사용할 수 있습니다.

```js
const uuid = crypto.randomUUID();
```
