---
title: Cloudflare Workers
---

[Cloudflare Workers](https://workers.cloudflare.com/)에 배포하려면 [`adapter-cloudflare-workers`](https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare-workers)를 사용하세요.

이 어댑터를 사용해야 하는 특별한 이유가 없다면 대신 [`adapter-cloudflare`](adapter-cloudflare)를 사용하는 것이 좋습니다.

> [Wrangler v2](https://developers.cloudflare.com/workers/wrangler/get-started/)가 필요합니다.

## Usage

`npm i -D @sveltejs/adapter-cloudflare-workers`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare-workers';
export default {
	kit: {
		adapter: adapter()
	}
};
```

## Basic Configuration

이 어댑터는 프로젝트 루트에서 [wrangler.toml](https://developers.cloudflare.com/workers/platform/sites/configuration) 파일을 찾을 것으로 예상합니다. 다음과 같아야 합니다.

```toml
/// file: wrangler.toml
name = "<your-service-name>"
account_id = "<your-account-id>"
main = "./.cloudflare/worker.js"
site.bucket = "./.cloudflare/public"
build.command = "npm run build"
compatibility_date = "2021-11-12"
workers_dev = true
```

`<your-service-name>`은 무엇이든 될 수 있습니다. `<your-account-id>`는 [Cloudflare dashboard](https://dash.cloudflare.com)에 로그인하고 URL 끝에서 가져오면 찾을 수 있습니다.

```
https://dash.cloudflare.com/<your-account-id>
```

> `.cloudflare` 디렉토리(또는 `main` 및 `site.bucket`에 대해 지정한 디렉토리)를 `.gitignore`에 추가해야 합니다.
아직 하지 않은 경우 [wrangler](https://developers.cloudflare.com/workers/wrangler/get-started/)를 설치하고 로그인해야 합니다.

```
npm i -g wrangler
wrangler login
```

그런 다음 앱을 빌드하고 배포할 수 있습니다.

```sh
wrangler publish
```

## Custom config

`wrangler.toml` 이외의 구성 파일을 사용하려면 다음과 같이 할 수 있습니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare-workers';
export default {
	kit: {
		adapter: adapter({ config: '<your-wrangler-name>.toml' })
	}
};
```

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

## Troubleshooting

### Accessing the file system

Serverless/Edge 환경에서는 `fs.readFileSync`와 같은 방법을 통해 파일 시스템에 액세스할 수 없습니다. 그런 방식으로 파일에 액세스해야 하는 경우 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)을 통해 앱을 빌드하는 동안 액세스해야 합니다. 예를 들어 블로그가 있고 CMS를 통해 콘텐츠를 관리하지 않으려면 콘텐츠를 사전 렌더링(또는 콘텐츠를 가져오는 엔드포인트를 사전 렌더링)하고 새 콘텐츠를 추가할 때마다 블로그를 다시 배포해야 합니다.