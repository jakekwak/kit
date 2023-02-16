---
title: How do I include details from package.json in my application?
---

SvelteKit은 [`svelte.config.js`](/docs/configuration)가 ES 모듈이 될 것으로 예상하므로 JSON 파일을 직접 요구할 수 없습니다. 애플리케이션의 버전 번호 또는 `package.json`의 기타 정보를 애플리케이션에 포함하려면 다음과 같이 JSON을 로드할 수 있습니다.

```js
/// file: svelte.config.js
// @filename: index.js
/// <reference types="@types/node" />
import { URL } from 'url';
// ---cut---
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);
```
