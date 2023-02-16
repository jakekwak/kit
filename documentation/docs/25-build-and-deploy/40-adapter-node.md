---
title: Node servers
---

독립 실행형 노드 서버를 생성하려면 [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node)를 사용하세요.

## Usage

`npm i -D @sveltejs/adapter-node`로 설치한 다음 `svelte.config.js`에 어댑터를 추가합니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';
export default {
	kit: {
		adapter: adapter()
	}
};
```

## Deploying

애플리케이션을 실행하려면 출력 디렉터리(기본적으로 `build`), 프로젝트의 `package.json` 및 `node_modules`의 프로덕션 종속성이 필요합니다. 프로덕션 종속성은 `npm ci --prod`로 생성할 수 있습니다(앱에 종속성이 없는 경우 이 단계를 건너뛸 수 있음). 그런 다음 다음 명령으로 앱을 시작할 수 있습니다.

```bash
node build
```

개발 종속성은 [Rollup](https://rollupjs.org)을 사용하여 앱에 번들로 제공됩니다. 지정된 패키지가 번들로 제공되는지 외부화되는지 제어하려면 패키지를 `package.json`의 `devDependencies` 또는 `dependencies`에 각각 배치하세요.

## Environment variables

`dev` 및 `preview`에서 SvelteKit은 `.env` 파일(또는 `.env.local` 또는 `.env.[mode]`, [Vite에서 결정](https://vitejs.dev/guide/env-and-mode.html#env-files).)에서 환경 변수를 읽습니다.

프로덕션에서 `.env` 파일은 자동으로 로드되지 _않습니다_. 그렇게 하려면 프로젝트에 `dotenv`를 설치하세요...

```bash
npm install dotenv
```

...빌드된 앱을 실행하기 전에 호출합니다:

```diff
-node build
+node -r dotenv/config build
```

### `PORT` and `HOST`

기본적으로 서버는 포트 3000을 사용하여 `0.0.0.0`에서 연결을 허용합니다. `PORT` 및 `HOST` 환경 변수로 사용자 정의할 수 있습니다.

```
HOST=127.0.0.1 PORT=4000 node build
```

### `ORIGIN`, `PROTOCOL_HEADER` and `HOST_HEADER`

HTTP는 SvelteKit에 현재 요청 중인 URL을 알 수 있는 신뢰할 수 있는 방법을 제공하지 않습니다. 앱이 제공되는 위치를 SvelteKit에 알리는 가장 간단한 방법은 `ORIGIN` 환경 변수를 설정하는 것입니다.

```
ORIGIN=https://my.site node build
```

이를 통해 `/stuff` 경로 이름에 대한 요청이 `https://my.site/stuff`로 올바르게 확인됩니다. 또는 원본 URL을 구성할 수 있는 요청 프로토콜 및 호스트에 대해 SvelteKit에 알려주는 헤더를 지정할 수 있습니다.

```
PROTOCOL_HEADER=x-forwarded-proto HOST_HEADER=x-forwarded-host node build
```

> [`x-forwarded-proto`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto) 및 [`x-forwarded-host`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host)는 리버스 프록시(로드 밸런서 및 CDN을 생각해 보십시오)를 사용하는 경우 원래 프로토콜과 호스트를 전달하는 사실상의 표준 헤더입니다. 서버가 신뢰할 수 있는 리버스 프록시 뒤에 있는 경우에만 이러한 변수를 설정해야 합니다. 그렇지 않으면 클라이언트가 이러한 헤더를 스푸핑할 수 있습니다.
`adapter-node`가 배포 URL을 올바르게 결정할 수 없는 경우 [양식 작업](/docs/form-actions)을 사용할 때 다음 오류가 발생할 수 있습니다.

> 교차 사이트 POST 양식 제출은 금지되어 있습니다.

### `ADDRESS_HEADER` and `XFF_DEPTH`

후크 및 엔드포인트에 전달된 [RequestEvent](/docs/types#public-types-requestevent) 개체에는 클라이언트의 IP 주소를 반환하는 `event.getClientAddress()` 함수가 포함되어 있습니다. 기본적으로 이것은 연결하는 `remoteAddress`입니다. 서버가 하나 이상의 프록시(예: 로드 밸런서) 뒤에 있는 경우 이 값에는 클라이언트가 아닌 가장 안쪽 프록시의 IP 주소가 포함되므로 주소를 읽으려면 `ADDRESS_HEADER`를 지정해야 합니다.

```
ADDRESS_HEADER=True-Client-IP node build
```

> 헤더는 쉽게 속일 수 있습니다. `PROTOCOL_HEADER` 및 `HOST_HEADER`와 마찬가지로 설정하기 전에 [무엇을 하고 있는지 알아야 합니다](https://adam-p.ca/blog/2022/03/x-forwarded-for/).
`ADDRESS_HEADER`가 `X-Forwarded-For`인 경우 헤더 값에는 쉼표로 구분된 IP 주소 목록이 포함됩니다. `XFF_DEPTH` 환경 변수는 서버 앞에 얼마나 많은 신뢰할 수 있는 프록시가 있는지 지정해야 합니다. 예를 들어 세 개의 신뢰할 수 있는 프록시가 있는 경우 프록시 3은 원래 연결의 주소와 처음 두 프록시를 전달합니다.

```
<client address>, <proxy 1 address>, <proxy 2 address>
```

일부 가이드는 맨 왼쪽 주소를 읽으라고 말하지만 이렇게 하면 [스푸핑에 취약](https://adam-p.ca/blog/2022/03/x-forwarded-for/)합니다.

```
<spoofed address>, <client address>, <proxy 1 address>, <proxy 2 address>
```

대신 신뢰할 수 있는 프록시의 수를 고려하여 _오른쪽_에서 읽습니다. 이 경우 `XFF_DEPTH=3`을 사용합니다.

> 대신 맨 왼쪽 주소를 읽어야 하는 경우(스푸핑에 대해 신경쓰지 않는 경우) — 예를 들어 IP 주소가 _신뢰할 수 있는 것_보다 _실제적인 것_이 더 중요한 위치 정보 서비스를 제공하려면 앱 내에서 `x-forwarded-for` 헤더를 검사하면 됩니다.

### `BODY_SIZE_LIMIT`

스트리밍하는 동안을 포함하여 수락할 최대 요청 본문 크기(바이트)입니다. 기본값은 512kb입니다. 고급 기능이 필요한 경우 값 0으로 이 옵션을 비활성화하고 [`handle`](/docs/hooks#server-hooks-handle)에서 사용자 지정 검사를 구현할 수 있습니다.

## Options

어댑터는 다양한 옵션으로 구성할 수 있습니다.

```js
// @errors: 2307
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-node';
export default {
	kit: {
		adapter: adapter({
			// default options are shown
			out: 'build',
			precompress: false,
			envPrefix: ''
		})
	}
};
```

### out

서버를 빌드할 디렉터리입니다. 기본값은 `build`입니다. 즉 `node build`는 서버가 생성된 후 로컬에서 서버를 시작합니다.

### precompress

자산 및 사전 렌더링된 페이지에 대해 gzip 및 brotli를 사용하여 사전 압축을 활성화합니다. 기본값은 `false`입니다.

### envPrefix

배포를 구성하는 데 사용되는 환경 변수의 이름을 변경해야 하는 경우(예: 제어하지 않는 환경 변수와의 충돌을 해결하기 위해) 접두사를 지정할 수 있습니다.

```js
envPrefix: 'MY_CUSTOM_';
```

```
MY_CUSTOM_HOST=127.0.0.1 \
MY_CUSTOM_PORT=4000 \
MY_CUSTOM_ORIGIN=https://my.site \
node build
```

## Custom server

어댑터는 빌드 디렉토리에 `index.js` 및 `handler.js`라는 두 개의 파일을 생성합니다. `index.js` 실행 — 예: 기본 빌드 디렉토리를 사용하는 경우 `node build`는 구성된 포트에서 서버를 시작합니다.

또는 [Express](https://github.com/expressjs/expressjs.com), [Connect](https://github.com/senchalabs/connect) 또는 [Polka](https://github.com/lukeed/polka)(또는 그냥 내장된 [`http.createServer`](https://nodejs.org/dist/latest/docs/api/http.html#httpcreateserveroptions-requestlistener))와 함께 사용하기에 적합한 핸들러를 내보내는 `handler.js` 파일을 가져와 자신의 서버를 설정할 수 있습니다.

```js
// @errors: 2307 7006
/// file: my-server.js
import { handler } from './build/handler.js';
import express from 'express';
const app = express();
// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
	res.end('ok');
});
// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);
app.listen(3000, () => {
	console.log('listening on port 3000');
});
```

## Troubleshooting

### Is there a hook for cleaning up before the server exits?

이를 위해 SvelteKit에 기본 제공되는 것은 없습니다. 이러한 정리 후크는 현재 실행 환경에 크게 의존하기 때문입니다. Node의 경우 내장 `process.on(..)`을 사용하여 서버가 종료되기 전에 실행되는 콜백을 구현할 수 있습니다.

```js
// @errors: 2304 2580
function shutdownGracefully() {
	// anything you need to clean up manually goes in here
	db.shutdown();
}
process.on('SIGINT', shutdownGracefully);
process.on('SIGTERM', shutdownGracefully);
```