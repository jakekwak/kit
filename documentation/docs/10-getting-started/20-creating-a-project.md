---
title: Creating a project
---

SvelteKit 앱 빌드를 시작하는 가장 쉬운 방법은 `npm create`를 실행하는 것입니다.

```bash
npm create svelte@latest my-app
cd my-app
npm install
npm run dev
```

첫 번째 명령은 TypeScript와 같은 기본 도구를 설정할지 묻는 `my-app` 디렉토리의 새 프로젝트를 스캐폴딩합니다. [추가 도구 설정에 대한 지침](/faq#integrations)에 대한 FAQ를 참조하세요. 후속 명령은 종속 항목을 설치하고 [localhost:5173](http://localhost:5173)에서 서버를 시작합니다.

두 가지 기본 개념이 있습니다.

- 앱의 각 페이지는 [Svelte](https://svelte.dev) 구성 요소입니다.
- 프로젝트의 `src/routes` 디렉토리에 파일을 추가하여 페이지를 만듭니다. 이는 서버에서 렌더링되어 사용자가 앱을 처음 방문할 때 최대한 빠르게 수행한 다음 클라이언트 측 앱이 인계합니다.

파일을 편집하여 모든 것이 어떻게 작동하는지 감을 잡으십시오.

## Editor setup

[Svelte 확장](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)과 함께 [Visual Studio Code(일명 VS Code)](https://code.visualstudio.com/download)를 사용하는 것이 좋지만 [수많은 다른 편집기도 지원합니다](https://sveltesociety.dev/tools#editor-support).
