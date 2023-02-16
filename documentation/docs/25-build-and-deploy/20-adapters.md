---
title: Adapters
---

SvelteKit 앱을 배포하기 전에 배포 대상에 맞게 _적응_해야 합니다. 어댑터는 빌드된 앱을 입력으로 사용하고 배포를 위한 출력을 생성하는 작은 플러그인입니다.

다양한 플랫폼을 위한 공식 어댑터가 존재하며 다음 페이지에 문서화되어 있습니다.

- [`@sveltejs/adapter-cloudflare`](adapter-cloudflare) for Cloudflare Pages
- [`@sveltejs/adapter-cloudflare-workers`](adapter-cloudflare-workers) for Cloudflare Workers
- [`@sveltejs/adapter-netlify`](adapter-netlify) for Netlify
- [`@sveltejs/adapter-node`](adapter-node) for Node servers
- [`@sveltejs/adapter-static`](adapter-static) for static site generation (SSG)
- [`@sveltejs/adapter-vercel`](adapter-vercel) for Vercel

다른 플랫폼을 위한 추가 [커뮤니티 제공 어댑터](https://sveltesociety.dev/components#adapters)가 있습니다.

## Using adapters

어댑터는 `svelte.config.js`에 지정되어 있습니다.

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module 'svelte-adapter-foo' {
	const adapter: (opts: any) => import('@sveltejs/kit').Adapter;
	export default adapter;
}
// @filename: index.js
// ---cut---
import adapter from 'svelte-adapter-foo';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// adapter options go here
		})
	}
};
export default config;
```

## Platform-specific context

일부 어댑터는 요청에 대한 추가 정보에 액세스할 수 있습니다. 예를 들어 Cloudflare Workers는 KV 네임스페이스 등을 포함하는 `env` 개체에 액세스할 수 있습니다. 이는 [후크](/docs/hooks) 및 [서버 경로](/docs/routing#server)에서 `플랫폼` 속성으로 사용되는 `RequestEvent`에 전달할 수 있습니다. 자세한 내용은 각 어댑터의 설명서를 참조하세요. .