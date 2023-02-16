---
title: Cloudflare Pages
---

[Cloudflare Pages](https://developers.cloudflare.com/pages/)에 배포하려면 [`adapter-cloudflare`](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare)를 사용하세요.

이 어댑터는 [`adapter-auto`](/docs/adapter-auto)를 사용할 때 기본적으로 설치되지만 `event.platform`이 자동으로 입력되도록 프로젝트에 추가하는 것이 좋습니다.

## Comparisons

- `adapter-cloudflare` – 모든 SvelteKit 기능을 지원합니다. [Cloudflare Pages](https://blog.cloudflare.com/cloudflare-pages-goes-full-stack/)용 빌드
- `adapter-cloudflare-workers` – 모든 SvelteKit 기능을 지원합니다. Cloudflare 작업자용 빌드
- `adapter-static` – 클라이언트 측 정적 자산만 생성합니다. Cloudflare 페이지와 호환

> `adapter-cloudflare-workers`를 사용해야 하는 특별한 이유가 없다면 이 어댑터를 대신 사용하는 것이 좋습니다. 두 어댑터 모두 동등한 기능을 가지고 있지만 Cloudflare Pages는 자동 빌드 및 배포, 미리 보기 배포, 즉각적인 롤백 등과의 GitHub 통합과 같은 기능을 제공합니다.

## Usage

`npm i -D @sveltejs/adapter-cloudflare`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';
export default {
	kit: {
		adapter: adapter()
	}
};
```

## Deployment

Cloudflare Pages를 시작하려면 [시작 안내서](https://developers.cloudflare.com/pages/get-started)를 따르세요.

프로젝트 설정을 구성할 때 다음 설정을 사용해야 합니다.

- **Framework preset** – 없음
- **Build command** – `npm run build` 또는 `svelte-kit build`
- **Build output directory** – `.svelte-kit/cloudflare`
- **Environment variables**
	- `NODE_VERSION`: `16`

> "프로덕션" 및 "미리 보기" 환경 모두에 `NODE_VERSION` 환경 변수를 추가해야 합니다. 프로젝트 설정 중에 또는 나중에 Pages 프로젝트 설정에서 추가할 수 있습니다. SvelteKit에는 노드 `16.14` 이상이 필요하므로 `NODE_VERSION` 값으로 `16`을 사용해야 합니다.

## Environment variables

KV/DO 네임스페이스 등을 포함하는 [`env`](https://developers.cloudflare.com/workers/runtime-apis/fetch-event#parameters) 개체는 다음과 함께 `platform` 속성을 통해 SvelteKit에 전달됩니다. `context` 및 `caches`: 후크 및 엔드포인트에서 액세스할 수 있음을 의미합니다.

```js
// @errors: 7031
export async function POST({ request, platform }) {
	const x = platform.env.YOUR_DURABLE_OBJECT_NAMESPACE.idFromName('x');
}
```

이러한 유형을 앱에서 사용할 수 있도록 하려면 `src/app.d.ts`에서 참조하세요.

```diff
/// file: src/app.d.ts
declare namespace App {
	interface Platform {
+		env?: {
+			YOUR_KV_NAMESPACE: KVNamespace;
+			YOUR_DURABLE_OBJECT_NAMESPACE: DurableObjectNamespace;
+		};
	}
}
```

> `platform.env`는 프로덕션 빌드에서만 사용할 수 있습니다. [wrangler](https://developers.cloudflare.com/workers/cli-wrangler)를 사용하여 로컬에서 테스트

## Notes

프로젝트 루트의 `/functions` 디렉토리에 포함된 함수는 [단일 `_worker.js` 파일](https://developers.cloudflare.com/pages/platform/functions/#advanced-mode)로 컴파일되는 배포에 포함되지 _않습니다_. 함수는 SvelteKit 앱에서 [서버 엔드포인트](https://kit.svelte.dev/docs/routing#server)로 구현되어야 합니다.

Cloudflare Pages에 특정한 `_headers` 및 `_redirects` 파일은 `/static` 폴더에 넣어 정적 자산 응답(예: 이미지)에 사용할 수 있습니다.

그러나 SvelteKit에 의해 동적으로 렌더링된 응답에는 영향을 미치지 않으며, 사용자 지정 헤더를 반환하거나 [서버 엔드포인트](https://kit.svelte.dev/docs/routing#server) 또는 [`handle`](https://kit.svelte.dev/docs/hooks#server-hooks-handle) 후크에서 응답을 리디렉션해야 합니다.

## Troubleshooting

### Accessing the file system

Serverless/Edge 환경에서는 `fs.readFileSync`와 같은 방법을 통해 파일 시스템에 액세스할 수 없습니다. 그런 방식으로 파일에 액세스해야 하는 경우 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)을 통해 앱을 빌드하는 동안 액세스해야 합니다. 예를 들어 블로그가 있고 CMS를 통해 콘텐츠를 관리하지 않으려면 콘텐츠를 사전 렌더링(또는 콘텐츠를 가져오는 엔드포인트를 사전 렌더링)하고 새 콘텐츠를 추가할 때마다 블로그를 다시 배포해야 합니다.