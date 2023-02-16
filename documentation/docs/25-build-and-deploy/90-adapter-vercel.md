---
title: Vercel
---

Vercel에 배포하려면 [`adapter-vercel`](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel)을 사용하세요.

이 어댑터는 [`adapter-auto`](/docs/adapter-auto)를 사용할 때 기본적으로 설치되지만 프로젝트에 추가하면 Vercel 관련 옵션을 지정할 수 있습니다.

## Usage

`npm i -D @sveltejs/adapter-vercel`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-vercel';
export default {
	kit: {
		// default options are shown
		adapter: adapter({
			// if true, will deploy the app using edge functions
			// (https://vercel.com/docs/concepts/functions/edge-functions)
			// rather than serverless functions
			edge: false,
			// an array of dependencies that esbuild should treat
			// as external when bundling functions
			external: [],
			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app
			split: false
		})
	}
};
```

## Environment Variables

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

이러한 모든 변수는 Vercel에서 빌드할 때 빌드 시간과 런타임 사이에 변경되지 않으므로 `$env/dynamic/private`보다는 — 변수를 정적으로 교체하여 데드 코드 제거와 같은 최적화를 가능하게 합니다 — `$env/static/private`를 사용하는 것이 좋습니다. `edge: true`로 배포하는 경우 `$env/dynamic/private` 및 `$env/dynamic/public`이 현재 Vercel의 에지 기능에 채워져 있지 않으므로 `$env/static/private`를 _반드시_ 사용해야 합니다.

## Notes

### Vercel functions

프로젝트 루트의 `/api` 디렉토리에 포함된 Vercel 기능은 배포에 포함되지 _않습니다_ — 이러한 기능은 [서버 엔드포인트](https://kit.svelte.dev/docs/routing#server)로 구현되어야 합니다. SvelteKit 앱.

### Node version

특정 날짜 이전에 생성된 프로젝트는 기본적으로 노드 14를 사용하는 반면 SvelteKit에는 노드 16 이상이 필요합니다. [프로젝트 설정에서 노드 버전을 변경](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js#node.js-version)할 수 있습니다.

## Troubleshooting

### Accessing the file system

Serverless/Edge 환경에서는 `fs.readFileSync`와 같은 방법을 통해 파일 시스템에 액세스할 수 없습니다. 그런 방식으로 파일에 액세스해야 하는 경우 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)을 통해 앱을 빌드하는 동안 액세스해야 합니다. 예를 들어 블로그가 있고 CMS를 통해 콘텐츠를 관리하지 않으려면 콘텐츠를 사전 렌더링(또는 콘텐츠를 가져오는 엔드포인트를 사전 렌더링)하고 새 콘텐츠를 추가할 때마다 블로그를 다시 배포해야 합니다.