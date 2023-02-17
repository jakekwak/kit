---
title: Vercel
---

Vercel에 배포하려면 [`adapter-vercel`](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel)을 사용하세요.

이 어댑터는 [`adapter-auto`](adapter-auto)를 사용할 때 기본적으로 설치되지만 프로젝트에 추가하면 Vercel 관련 옵션을 지정할 수 있습니다.

## Usage

`npm i -D @sveltejs/adapter-vercel`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307 2345
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
	kit: {
		adapter: adapter({
			// see the 'Deployment configuration' section below
		})
	}
};
```

## Deployment configuration

경로가 기능으로 Vercel에 배포되는 방식을 제어하려면 위에 표시된 옵션을 통해 또는 `+server.js`, `+page(.server).js` 및 `+layout(.server).js` 파일내에서 [`export const config`](/docs/page-options#config)를 사용하여 배포 구성을 지정할 수 있습니다.

예를 들어 앱의 일부를 [Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)로 배포할 수 있습니다...

```js
/// file: about/+page.js
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'edge'
};
```

...및 기타 [서버리스 기능](https://vercel.com/docs/concepts/functions/serverless-functions)(레이아웃 내부에 `config`를 지정하면 모든 하위 페이지에 적용됨):

```js
/// file: admin/+layout.js
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'nodejs18.x'
};
```

다음 옵션은 모든 기능에 적용됩니다.

- `runtime`: `'edge'`, `'nodejs16.x'` 또는 `'nodejs18.x'`. 기본적으로 어댑터는 프로젝트가 Vercel 대시보드에서 사용하도록 구성된 노드 버전에 따라 `'nodejs16.x'` 또는 `'nodejs18.x'`를 선택합니다.
- `regions`: [에지 네트워크 영역](https://vercel.com/docs/concepts/edge-network/regions)의 배열(기본값은 서버리스 기능의 경우 `["iad1"]`) 또는 `runtime`이 `edge`(기본값)인 경우 `'all'`입니다. 서버리스 기능을 위한 여러 지역은 엔터프라이즈 플랜에서만 지원됩니다.
- `split`: `true`인 경우 경로가 개별 기능으로 배포됩니다. 어댑터 수준에서 `split`이 `true`로 설정되면 모든 경로가 개별 기능으로 배포됩니다.

또한 다음 옵션이 에지 함수에 적용됩니다.
- `envVarsInUse`: 에지 함수 내에서 액세스할 수 있어야 하는 환경 변수의 배열
- `external`: 함수를 묶을 때 esbuild가 외부로 취급해야 하는 종속성 배열입니다. 노드 외부에서 실행되지 않는 선택적 종속성을 제외하는 데에만 사용해야 합니다.

다음 옵션은 서버리스 기능에 적용됩니다.
- `memory`: 함수에 사용할 수 있는 메모리의 양입니다. 기본값은 `1024` Mb이며 Pro 또는 Enterprise 계정에서 `128` Mb로 줄이거나 64Mb 단위로 최대 `3008` Mb까지 [늘릴](https://vercel.com/docs/concepts/limits/overview#serverless-function-memory) 수 있습니다.
- `maxDuration`: 함수의 최대 실행 시간. Hobby 계정의 경우 `10`초, Pro의 경우 `60`, Enterprise의 경우 `900`으로 기본 설정됩니다.
- `isr`: 증분 정적 재생 구성, 아래 설명

함수가 특정 지역의 데이터에 액세스해야 하는 경우 최적의 성능을 위해 동일한 지역(또는 가까운 지역)에 배포하는 것이 좋습니다.

## Incremental Static Regeneration

Vercel은 [Incremental Static Regeneration](https://vercel.com/docs/concepts/incremental-static-regeneration/overview)(ISR)을 지원하여 동적으로 렌더링된 콘텐츠의 유연성과 함께 사전 렌더링된 콘텐츠의 성능 및 비용 이점을 제공합니다.

경로에 ISR을 추가하려면 `config` 개체에 `isr` 속성을 포함합니다.

```js
/// file: blog/[slug]/+page.server.js
// @filename: ambient.d.ts
declare module '$env/static/private' {
	export const BYPASS_TOKEN: string;
}

// @filename: index.js
// ---cut---
import { BYPASS_TOKEN } from '$env/static/private';

export const config = {
	isr: {
		// 서버리스 기능을 호출하여 캐시된 자산이 다시 생성되기 전의 만료 시간(초)입니다.
		// 값을 'false'로 설정하면 만료되지 않습니다.
		expiration: 60,

		// 자산의 옵션 그룹 번호입니다. 동일한 그룹 번호를 가진 자산은 모두 동시에 재검증됩니다.
		group: 1,

		// 자산을 요청하여 자산의 캐시된 버전을 우회하기 위해 URL에 제공할 수 있는 임의 토큰
		// with a __prerender_bypass=<token> cookie.
		//
		// `x-prerender-revalidate: <token>`으로 `GET` 또는 `HEAD` 요청을 하면 자산이 강제로 재검증됩니다.
		bypassToken: BYPASS_TOKEN,

		// 독립적으로 캐시될 쿼리 문자열 매개변수 이름 목록입니다.
		// 빈 배열인 경우 쿼리 값은 캐싱에 고려되지 않습니다.
		// `undefined` 경우 각각의 고유한 쿼리 값이 독립적으로 캐시됩니다.
		allowQuery: ['search']
	}
};
```

`expiration` 속성이 필요합니다. 다른 모든 것은 선택 사항입니다.

## Environment variables

Vercel은 사용 가능한 [배포 관련 환경 변수](https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables) 세트를 만듭니다. 다른 환경 변수와 마찬가지로 이러한 변수는 `$env/static/private` 및 `$env/dynamic/private`(때때로 — 나중에 자세히 설명)에서 액세스할 수 있으며 공개 대상에서는 액세스할 수 없습니다. 클라이언트에서 이러한 변수 중 하나에 액세스하려면:

```js
// @errors: 2305
/// file: +layout.server.js
import { VERCEL_COMMIT_REF } from '$env/static/private';

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	return {
		deploymentGitBranch: VERCEL_COMMIT_REF
	};
}
```

```svelte
/// file: +layout.svelte
<script>
	/** @type {import('./$types').LayoutServerData} */
	export let data;
</script>

<p>This staging environment was deployed from {data.deploymentGitBranch}.</p>
```

이러한 모든 변수는 Vercel에서 빌드할 때 빌드 시간과 런타임 사이에 변경되지 않으므로 `$env/static/private`를 사용하는 것이 좋습니다. 이는 `$env/dynamic/private`보다 변수를 정적으로 대체하여 데드 코드 제거와 같은 최적화를 가능하게 합니다. . `edge: true`로 배포하는 경우 `$env/static/private`를 사용하거나 `envVarsInUse` 구성을 채워야 합니다.

## Notes

### Vercel functions

프로젝트 루트의 `api` 디렉토리에 포함된 Vercel 함수가 있는 경우 `/api/*`에 대한 요청은 SvelteKit에서 처리하지 _않습니다_. SvelteKit에 `/api/*` 경로가 없는지 확인해야 하는 경우 자바스크립트가 아닌 언어를 사용해야 하는 경우가 아니면 SvelteKit 앱에서 [API 경로](https://kit.svelte.dev/docs/routing#server)로 대신 구현해야 합니다.

### Node version

특정 날짜 이전에 생성된 프로젝트는 기본적으로 노드 14를 사용하는 반면 SvelteKit에는 노드 16 이상이 필요합니다. [프로젝트 설정에서 노드 버전을 변경](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js#node.js-version)할 수 있습니다.

## Troubleshooting

### Accessing the file system

Serverless/Edge 환경에서는 `fs.readFileSync`와 같은 방법을 통해 파일 시스템에 액세스할 수 없습니다. 그런 방식으로 파일에 액세스해야 하는 경우 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)을 통해 앱을 빌드하는 동안 액세스해야 합니다. 예를 들어 블로그가 있고 CMS를 통해 콘텐츠를 관리하지 않으려면 콘텐츠를 사전 렌더링(또는 콘텐츠를 가져오는 엔드포인트를 사전 렌더링)하고 새 콘텐츠를 추가할 때마다 블로그를 다시 배포해야 합니다.