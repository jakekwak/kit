---
title: Netlify
---

Netlify에 배포하려면 [`adapter-netlify`](https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify)를 사용하세요.

이 어댑터는 [`adapter-auto`](/docs/adapter-auto)를 사용할 때 기본적으로 설치되지만 프로젝트에 추가하면 Netlify 관련 옵션을 지정할 수 있습니다.

## Usage

`npm i -D @sveltejs/adapter-netlify`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
export default {
	kit: {
		// default options are shown
		adapter: adapter({
			// if true, will create a Netlify Edge Function rather
			// than using standard Node-based functions
			edge: false,
			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app.
			// if `edge` is true, this option cannot be used
			split: false
		})
	}
};
```

그런 다음 프로젝트 루트에 [netlify.toml](https://docs.netlify.com/configure-builds/file-based-configuration) 파일이 있는지 확인합니다. 이것은 이 샘플 구성에 따라 `build.publish` 설정을 기반으로 정적 자산을 작성할 위치를 결정합니다.

```toml
[build]
	command = "npm run build"
	publish = "build"
```

`netlify.toml` 파일 또는 `build.publish` 값이 누락된 경우 `"build"`의 기본값이 사용됩니다. Netlify UI에서 게시 디렉토리를 다른 것으로 설정한 경우 `netlify.toml`에서도 설정하거나 `"build"`의 기본값을 사용해야 합니다.

### Node version

새 프로젝트는 기본적으로 노드 16을 사용합니다. 그러나 얼마 전에 만든 프로젝트를 업그레이드하는 경우 이전 버전에서 멈출 수 있습니다. Node 16 이상을 수동으로 지정하는 방법에 대한 자세한 내용은 [Netlify 문서](https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript)를 참조하세요.

## Netlify Edge Functions (beta)

SvelteKit은 [Netlify Edge Functions](https://docs.netlify.com/netlify-labs/experimental-features/edge-functions/)의 베타 릴리스를 지원합니다. `adapter` 함수에 `edge: true` 옵션을 전달하면 사이트 방문자 가까이에 배포되는 Deno 기반 에지 함수에서 서버 측 렌더링이 발생합니다. 'false'(기본값)로 설정하면 사이트는 표준 노드 기반 Netlify 기능에 배포됩니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
export default {
	kit: {
		adapter: adapter({
			// will create a Netlify Edge Function using Deno-based
			// rather than using standard Node-based functions
			edge: true
		})
	}
};
```

## Netlify alternatives to SvelteKit functionality

Netlify 기능에 의존하지 않고 SvelteKit에서 직접 제공하는 기능을 사용하여 앱을 빌드할 수 있습니다. 이러한 기능의 SvelteKit 버전을 사용하면 개발 모드에서 사용하고 통합 테스트로 테스트하고 Netlify에서 전환하기로 결정한 경우 다른 어댑터와 함께 작동할 수 있습니다. 그러나 일부 시나리오에서는 이러한 기능의 Netlify 버전을 사용하는 것이 유익할 수 있습니다. 한 가지 예는 Netlify에서 이미 호스팅된 앱을 SvelteKit으로 마이그레이션하는 경우입니다.

### Redirect rules

컴파일하는 동안 리디렉션 규칙이 `_redirects` 파일에 자동으로 추가됩니다. (아직 존재하지 않으면 생성됩니다.) 즉, 다음을 의미합니다.

- `netlify.toml`의 `[[redirects]]`는 `_redirects`가 [더 높은 우선순위](https://docs.netlify.com/routing/redirects/#rule-processing-order)를 가지므로 일치하지 않습니다. 따라서 항상 규칙을 [`_redirects` 파일](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file)에 넣으십시오.
- `_redirects`에는 `/* /foobar/:splat`과 같은 사용자 정의 "catch all" 규칙이 없어야 합니다. 그렇지 않으면 Netlify가 [첫 번째로 일치하는 규칙](https://docs.netlify.com/routing/redirects/#rule-processing-order)만 처리하므로 자동으로 추가된 규칙이 적용되지 않습니다.

### Netlify Forms

1. [여기](https://docs.netlify.com/forms/setup/#html-forms)에 설명된 대로 Netlify HTML 양식을 만듭니다. `/routes/contact/+page.svelte`로. (숨겨진 `form-name` 입력 요소를 추가하는 것을 잊지 마세요!)
2. Netlify의 빌드 봇은 배포 시 HTML 파일을 구문 분석하므로 양식을 HTML로 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)해야 합니다. `contact.svelte`에 `export const prerender = true`를 추가하여 해당 페이지만 사전 렌더링하거나 `kit.prerender.force: true` 옵션을 설정하여 모든 페이지를 사전 렌더링할 수 있습니다.
3. Netlify 양식에 `<form netlify ... action="/success">`와 같은 [맞춤형 성공 메시지](https://docs.netlify.com/forms/setup/#success-messages)가 있는 경우 해당 `/routes/success/+page.svelte`가 존재하고 사전 렌더링되었는지 확인하십시오.

### Netlify Functions

이 어댑터를 사용하면 SvelteKit 엔드포인트가 [Netlify Functions](https://docs.netlify.com/functions/overview/)로 호스팅됩니다. Netlify 함수 핸들러에는 [Netlify Identity](https://docs.netlify.com/visitor-access/identity/) 정보를 비롯한 추가 컨텍스트가 있습니다. 후크 내부의 `event.platform.context` 필드와 `+page.server` 또는 `+layout.server` 엔드포인트를 통해 이 컨텍스트에 액세스할 수 있습니다. 어댑터 구성에서 `edge` 속성이 `false`인 경우 [서버리스 기능](https://docs.netlify.com/functions/overview/) 또는 `true`인 경우 [edge functions](https://docs.netlify.com/edge-functions/overview/#app)입니다.

```js
// @errors: 2705 7006
/// file: +page.server.js
export const load = async (event) => {
	const context = event.platform.context;
	console.log(context); // shows up in your functions log in the Netlify app
};
```

또한 디렉토리를 생성하고 `netlify.toml` 파일에 구성을 추가하여 고유한 Netlify 함수를 추가할 수 있습니다. 예를 들어:

```toml
[build]
	command = "npm run build"
	publish = "build"
[functions]
	directory = "functions"
```

## Troubleshooting

### Accessing the file system

Serverless/Edge 환경에서는 `fs.readFileSync`와 같은 방법을 통해 파일 시스템에 액세스할 수 없습니다. 그런 방식으로 파일에 액세스해야 하는 경우 [사전 렌더링](https://kit.svelte.dev/docs/page-options#prerender)을 통해 앱을 빌드하는 동안 액세스해야 합니다. 예를 들어 블로그가 있고 CMS를 통해 콘텐츠를 관리하지 않으려면 콘텐츠를 사전 렌더링(또는 콘텐츠를 가져오는 엔드포인트를 사전 렌더링)하고 새 콘텐츠를 추가할 때마다 블로그를 다시 배포해야 합니다.