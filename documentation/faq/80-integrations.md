---
title: How do I use X with SvelteKit?
---

[통합 문서 섹션](/docs/integrations)을 읽어보세요. 여전히 문제가 있는 경우 일반적인 문제에 대한 해결 방법이 아래에 나열되어 있습니다.

### How do I setup a database?

[서버 경로](/docs/routing#server)에 데이터베이스를 쿼리하는 코드를 넣습니다. .svelte 파일에서 데이터베이스를 쿼리하지 마세요. 즉시 연결을 설정하고 클라이언트가 앱 전체에서 단일 항목으로 액세스할 수 있도록 하는 `db.js` 또는 유사 항목을 만들 수 있습니다. `hooks.js`에서 일회성 설정 코드를 실행하고 데이터베이스 헬퍼를 필요로 하는 엔드포인트로 가져올 수 있습니다.

### How do I use a client-side only library that depends on `document` or `window`?

`document` 또는 `window` 변수에 액세스해야 하거나 클라이언트 측에서만 실행되는 코드가 필요한 경우 `browser` 검사에서 래핑할 수 있습니다.

```js
/// <reference types="@sveltejs/kit" />
// ---cut---
import { browser } from '$app/environment';

if (browser) {
	// client-only code here
}
```

구성 요소가 DOM에 처음 렌더링된 후 코드를 실행하려는 경우 `onMount`에서 코드를 실행할 수도 있습니다.

```js
// @filename: ambient.d.ts
// @lib: ES2015
declare module 'some-browser-only-library';

// @filename: index.js
// ---cut---
import { onMount } from 'svelte';

onMount(async () => {
	const { method } = await import('some-browser-only-library');
	method('hello world');
});
```

사용하려는 라이브러리가 부작용이 없는 경우 정적으로 가져올 수도 있으며 서버 측 빌드에서 'onMount'가 자동으로 no-op으로 대체됩니다.

```js
// @filename: ambient.d.ts
// @lib: ES2015
declare module 'some-browser-only-library';

// @filename: index.js
// ---cut---
import { onMount } from 'svelte';
import { method } from 'some-browser-only-library';

onMount(() => {
	method('hello world');
});
```

그렇지 않으면 라이브러리에 부작용이 있고 여전히 정적 가져오기를 사용하려는 경우 [vite-plugin-iso-import](https://github.com/bluwy/vite-plugin-iso-import)를 확인하여 `?client` 가져오기 접미사를 지원하십시오. 가져오기는 SSR 빌드에서 제거됩니다. 그러나 이 방법을 사용하면 VS Code Intellisense를 사용할 수 없게 됩니다.

```js
// @filename: ambient.d.ts
// @lib: ES2015
declare module 'some-browser-only-library?client';

// @filename: index.js
// ---cut---
import { onMount } from 'svelte';
import { method } from 'some-browser-only-library?client';

onMount(() => {
	method('hello world');
});
```

### How do I use a different backend API server?

[`event.fetch`](/docs/load#making-fetch-requests)를 사용하여 외부 API 서버에서 데이터를 요청할 수 있지만 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)를 처리해야 하므로 복잡해집니다. 예를 들어 일반적으로 요청을 미리 실행해야 대기 시간이 길어집니다. 별도의 하위 도메인에 대한 요청은 추가 DNS 조회, TLS 설정 등으로 인해 대기 시간이 증가할 수도 있습니다. 이 방법을 사용하려면 [`handleFetch`](/docs/hooks#server-hooks-handlefetch)가 유용할 수 있습니다. .

또 다른 접근 방식은 CORS 문제를 우회하도록 프록시를 설정하는 것입니다. 프로덕션에서는 `/api`와 같은 경로를 API 서버에 다시 씁니다. 로컬 개발의 경우 Vite의 [`server.proxy`](https://vitejs.dev/config/server-options.html#server-proxy) 옵션을 사용하세요.

프로덕션에서 재작성을 설정하는 방법은 배포 플랫폼에 따라 다릅니다. 다시 쓰기가 옵션이 아닌 경우 대신 [API 경로](https://kit.svelte.dev/docs/routing#server)를 추가할 수 있습니다.

```js
/// file: src/routes/api/[...path]/+server.js
/** @type {import('./$types').RequestHandler} */
export function GET({ params, url }) {
	return fetch(`https://my-api-server.com/${params.path + url.search}`);
}
```

(필요에 따라 `POST`/`PATCH` 등의 요청을 프록시하고 `request.headers`를 전달해야 할 수도 있습니다.)

### How do I use middleware?

`adapter-node`는 프로덕션 모드를 위해 자체 서버에서 사용할 수 있는 미들웨어를 빌드합니다. dev에서는 Vite 플러그인을 사용하여 Vite에 미들웨어를 추가할 수 있습니다. 예를 들어:

```js
// @filename: ambient.d.ts
declare module '@sveltejs/kit/vite'; // TODO this feels unnecessary, why can't it 'see' the declarations?

// @filename: index.js
// ---cut---
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').Plugin} */
const myPlugin = {
	name: 'log-request-middleware',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			console.log(`Got request ${req.url}`);
			next();
		});
	}
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		// myPlugin, sveltekit()  //이 문장에서 에러가 남. 우선 코멘트 처림함.
		]
};

export default config;
```

순서 제어 방법을 포함한 자세한 내용은 [Vite의 `configureServer` 문서](https://vitejs.dev/guide/api-plugin.html#configureserver)를 참조하세요.

### Does it work with Yarn 2?

일종의. 'pnp'라고도 하는 Plug'n'Play 기능이 작동하지 않습니다(노드 모듈 해상도 알고리즘에서 벗어나 SvelteKit이 — [패키지 수 증가](https://blog.sindresorhus.com/get-ready-for-esm-aa53530b3f77)와 함께 -  사용하는 [기본 JavaScript 모듈에서는 아직 작동하지 않음](https://github.com/yarnpkg/berry/issues/638)).
yarnrcyml 파일에서 `nodeLinker: 'node-modules'`를 사용하여 pnp를 비활성화할 수 있지만 npm 또는 [pnpm]을 사용하는 것이 더 쉬울 것입니다. 이는 유사하게 빠르고 효율적이지만 호환성 문제가 없습니다.

### How do I use with Yarn 3?

현재 최신 Yarn(버전 3) 내의 ESM 지원은 [실험](https://github.com/yarnpkg/berry/pull/2161)으로 간주됩니다.

결과는 다를 수 있지만 아래는 작동하는 것 같습니다.

먼저 새 애플리케이션을 만듭니다.

```sh
yarn create svelte myapp
cd myapp
```

그리고 Yarn Berry를 활성화합니다.

```sh
yarn set version berry
yarn install
```

**Yarn 3 global cache**

Yarn Berry의 더 흥미로운 기능 중 하나는 디스크의 각 프로젝트에 대해 여러 복사본을 갖는 대신 패키지에 대한 단일 글로벌 캐시를 갖는 기능입니다. 그러나 `enableGlobalCache`를 true로 설정하면 빌드가 실패하므로 `.yarnrc.yml` 파일에 다음을 추가하는 것이 좋습니다.

```
nodeLinker: node-modules
```

이렇게 하면 패키지가 로컬 node_modules 디렉토리에 다운로드되지만 위의 문제를 피할 수 있으며 현재 Yarn 버전 3을 사용하는 것이 가장 좋습니다.
