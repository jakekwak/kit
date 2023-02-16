---
title: Packaging
---

> `svelte-package`는 현재 실험적입니다. 이전 버전과 호환되지 않는 변경 사항은 향후 릴리스에서 발생할 수 있습니다.

SvelteKit을 사용하여 `@sveltejs/package` 패키지(`npm create svelte`에는 이를 설정하는 옵션이 있음)를 사용하여 구성 요소 라이브러리뿐만 아니라 앱을 빌드할 수 있습니다.

앱을 만들 때 `src/routes`의 내용은 공개 대상입니다. [`src/lib`](/docs/modules#$lib)에는 앱의 내부 라이브러리가 포함되어 있습니다.

구성 요소 라이브러리는 `src/lib`가 공용 비트라는 점을 제외하면 SvelteKit 앱과 정확히 동일한 구조를 가집니다. `src/routes`는 라이브러리와 함께 제공되는 문서 또는 데모 사이트이거나 개발 중에 사용하는 샌드박스일 수 있습니다.

`@sveltejs/package`에서 `svelte-package` 명령을 실행하면 `src/lib`의 내용을 가져오고 다음을 포함하는 `package` 디렉토리([구성](/docs/configuration) 가능)를 생성합니다.

- 사용자 지정 `include`/`exclude` 옵션을 [구성](/docs/configuration)하지 않는 한 `src/lib`의 모든 파일. Svelte 구성 요소는 사전 처리되고 TypeScript 파일은 JavaScript로 변환됩니다.
- Svelte, JavaScript 및 TypeScript 파일에 대해 생성되는 유형 정의(`d.ts` 파일). 이를 위해서는 `typescript >= 4.0.0`을 설치해야 합니다. 유형 정의는 구현 옆에 배치되며 손으로 작성한 `d.ts` 파일은 그대로 복사됩니다. [생성을 비활성화](/docs/configuration)할 수 있지만 권장하지 않습니다. — 라이브러리를 사용하는 사람들은 이러한 유형 정의 파일이 필요한 TypeScript를 사용할 수 있습니다.
- `"scripts"`, `"publishConfig.directory"` 및 `"publishConfig.linkDirectory"`를 제외한 모든 필드가 있는 프로젝트 루트에서 복사된 `package.json`. `"dependencies"` 필드가 포함되어 있으며, 이는 문서 또는 데모 사이트에만 필요한 패키지를 `"devDependencies"`에 추가해야 함을 의미합니다. 원본 파일에 정의되지 않은 경우 `"type": "module"` 및 `"exports"` 필드가 추가됩니다.

`"exports"` 필드에는 패키지의 진입점이 포함됩니다. 기본적으로 `src/lib`의 모든 파일은 밑줄로 시작하지 않는 한(또는 밑줄로 시작하는 디렉토리에 있지 않는 한) 진입점으로 취급되지만 이 동작을 [구성](/docs/configuration)할 수 있습니다. `src/lib/index.js` 또는 `src/lib/index.svelte` 파일이 있는 경우 패키지 루트로 취급됩니다.

예를 들어 `src/lib/Foo.svelte` 구성 요소와 이를 다시 내보낸 `src/lib/index.js` 모듈이 있는 경우 라이브러리 소비자는 다음 중 하나를 수행할 수 있습니다.

```js
// @filename: ambient.d.ts
declare module 'your-library';

// @filename: index.js
// ---cut---
import { Foo } from 'your-library';
```

```js
// @filename: ambient.d.ts
declare module 'your-library/Foo.svelte';

// @filename: index.js
// ---cut---
import Foo from 'your-library/Foo.svelte';
```

> 다른 SvelteKit 프로젝트에서만 사용할 수 있도록 의도하지 않는 한 패키지에서 `$app`과 같은 [SvelteKit 관련 모듈](/docs/modules)을 사용하지 않아야 합니다. 예를 들어 `import { browser } from '$app/environment'`를 사용하는 대신 [`import.meta.env.SSR`](https://vitejs.dev/guide/env-and-mode.html#env-variables)을 사용하여 모든 Vite 기반 프로젝트에서 라이브러리를 사용할 수 있도록 하거나 노드 조건부 내보내기를 사용하여 모든 번들러에서 작동하도록 할 수 있습니다. `$app/stores`, `$app/navigation` 등에 직접 의존하지 않고 현재 URL이나 탐색 작업과 같은 항목을 소품으로 전달할 수도 있습니다. 이렇게 보다 일반적인 방식으로 앱을 작성하면 테스트, UI 데모 등을 위한 도구를 더 쉽게 설정할 수 있습니다.

## Options

`svelte-package`는 다음 옵션을 허용합니다.

- `-w`/`--watch` — `src/lib`의 파일에서 변경 사항을 확인하고 패키지를 다시 빌드합니다.

## Publishing

생성된 패키지를 게시하려면:

```sh
npm publish ./package
```

위의 `./package`는 생성된 디렉토리 이름을 참조하며 사용자 정의 [`package.dir`](/docs/configuration)을 구성하는 경우 그에 따라 변경하십시오.

## Caveats

모든 상대 파일 가져오기는 Node의 ESM 알고리즘을 준수하여 완전히 지정되어야 합니다. 즉, `./something`에서 `import { something }`과 같이 `src/lib/something/index.js` 파일을 가져올 수 없으며 대신 다음과 같이 가져와야 합니다: `import { something } from './something/index.js`
TypeScript를 사용하는 경우 동일한 방식으로 `.ts` 파일을 가져와야 하지만 `.ts` 파일로 끝나는 파일이(이것은 우리가 통제할 수 없으며 TypeScript 팀이 결정을 내렸습니다) _아닌_ `.js` 파일로 끝나는 파일을 사용해야 합니다. `tsconfig.json` 또는 `jsconfig.json`에서 `"moduleResolution": "NodeNext"`를 설정하면 도움이 됩니다.

이것은 상대적으로 실험적인 기능이며 아직 완전히 구현되지 않았습니다. Svelte 파일(전처리됨) 및 TypeScript 파일(JavaScript로 트랜스파일됨)을 제외한 모든 파일은 있는 그대로 복사됩니다.