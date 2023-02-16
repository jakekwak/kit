---
title: Writing adapters
---

선호하는 환경에 대한 어댑터가 아직 존재하지 않는 경우 직접 구축할 수 있습니다. [어댑터 소스를 확인](https://github.com/sveltejs/kit/tree/master/packages)하고 귀하와 유사한 플랫폼을 시작점으로 복사하는 것이 좋습니다.

어댑터 패키지는 `Adapter`를 생성하는 다음 API를 구현해야 합니다.

```js
// @filename: ambient.d.ts
type AdapterSpecificOptions = any;
// @filename: index.js
// ---cut---
/** @param {AdapterSpecificOptions} options */
export default function (options) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'adapter-package-name',
		async adapt(builder) {
			// adapter implementation
		}
	};
	return adapter;
}
```

`Adapter`의 유형과 해당 매개변수는 [types/index.d.ts](https://github.com/sveltejs/kit/blob/master/packages/kit/types/index.d.ts)에서 사용할 수 있습니다. .

`adapt` 메서드 내에는 어댑터가 수행해야 하는 여러 가지 작업이 있습니다.

- 빌드 디렉토리 지우기
- `builder.writeClient`, `builder.writeServer` 및 `builder.writePrerendered`로 SvelteKit 출력 작성
- 출력 코드:
	- `${builder.getServerDirectory()}/index.js`에서 `Server`를 가져옵니다.
	- `builder.generateManifest({ relativePath })`로 생성된 매니페스트로 앱을 인스턴스화합니다.
	- 플랫폼의 요청을 수신하고, 필요한 경우 표준 [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)으로 변환하고, `server.respond(request, { getClientAddress })` 함수를 호출하여 [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)를 생성하고 이에 응답합니다.
	- `server.respond`에 전달된 `platform` 옵션을 통해 플랫폼별 정보를 SvelteKit에 노출
	- 필요한 경우 대상 플랫폼에서 작동하도록 '가져오기'를 전역적으로 shim합니다. SvelteKit은 `node-fetch`를 사용할 수 있는 플랫폼에 `@sveltejs/kit/install-fetch` 도우미를 제공합니다.
- 필요한 경우 대상 플랫폼에 종속성을 설치할 필요가 없도록 출력을 번들로 묶습니다.
- 사용자의 정적 파일과 생성된 JS/CSS를 대상 플랫폼의 올바른 위치에 넣습니다.

가능한 경우 `.svelte-kit/[adapter-name]` 아래에 있는 중간 출력과 함께 어댑터 출력을 `build/` 디렉토리에 두는 것이 좋습니다.