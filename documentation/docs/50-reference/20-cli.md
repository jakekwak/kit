---
title: Command Line Interface
---

SvelteKit 프로젝트는 [Vite](https://vitejs.dev)를 사용합니다. 즉, 대부분 해당 CLI를 사용하게 됩니다(`npm run dev/build/preview` 스크립트를 통해).

- `vite dev` — 개발 서버 시작
- `vite build` — 앱의 프로덕션 버전 빌드
- `vite preview` — 프로덕션 버전을 로컬에서 실행

그러나 SvelteKit에는 프로젝트 초기화를 위한 자체 CLI가 포함되어 있습니다.

## svelte-kit sync

`svelte-kit sync`는 유형 및 `tsconfig.json`과 같은 프로젝트에 대해 생성된 파일을 생성합니다. 새 프로젝트를 생성하면 `prepare` 스크립트로 나열되고 npm 수명 주기의 일부로 자동으로 실행되므로 일반적으로 이 명령을 실행할 필요가 없습니다.
