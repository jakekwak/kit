---
title: Building your app
---

SvelteKit 앱 빌드는 두 단계로 이루어지며 둘 다 `vite build`를 실행할 때 발생합니다(일반적으로 `npm run build`를 통해).

먼저 Vite는 서버 코드, 브라우저 코드 및 서비스 작업자(있는 경우)의 최적화된 프로덕션 빌드를 생성합니다. [사전 렌더링](/docs/page-options#prerender)은 해당하는 경우 이 단계에서 실행됩니다.

둘째, _adapter_는 이 프로덕션 빌드를 가져와 대상 환경에 맞게 조정합니다. 자세한 내용은 다음 페이지에서 설명합니다.

## During the build

SvelteKit은 빌드 중에 분석을 위해 `+page/layout(.server).js` 파일(및 가져오는 모든 파일)을 로드합니다. 이 단계에서 실행되지 _않아야_ 하는 모든 코드는 [`$app/environment`](/docs/modules#$app-environment)의 `building`이 `false`인지 확인해야 합니다:

```diff
+import { building } from '$app/environment';
import { setupMyDatabase } from '$lib/server/database';
+if (!building) {
	setupMyDatabase();
+}
export function load() {
	// ...
}
```

## Preview your app

빌드 후 `vite preview`(`npm run preview`를 통해)를 사용하여 프로덕션 빌드를 로컬에서 볼 수 있습니다. 이것은 노드에서 앱을 실행하므로 배포된 앱을 완벽하게 재현하지 않습니다.