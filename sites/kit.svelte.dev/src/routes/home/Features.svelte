<script>
	import Section from '@sveltejs/site-kit/components/Section.svelte';
</script>

<Section --background="var(--sk-back-1)">
	<div class="container">
		<div class="features">
			<h2><span>기능? 갖추어져 있습니다.</span></h2>
			<p class="wall">
				유연성을 극대화하기 위해 동적 <strong>서버측 렌더링</strong>과 함께 최대 성능을 위해
				<strong>사전 렌더링된</strong> 페이지를 혼합하고 일치시킵니다.
				전체 또는 한 페이지에 대해 한 줄의 코드를 사용하여 앱을 클라이언트 렌더링 <strong>PWA</strong>로 전환합니다.
				전체 페이지(및 분석 및 기타 정크)를 다시 로드하지 않는 매끄럽고 즉각적인 탐색을 위해 자동 <strong>사전 로드</strong>와 함께
				액세스 가능한 <strong>클라이언트측 라우팅</strong>을 사용합니다. 자동 <strong>CSRF 보호</strong> 및
				사용하기 쉬운 <strong>콘텐츠 보안 정책</strong> 구성으로 사용자를 보호하십시오.
				고급 <strong>환경 변수</strong> 처리를 통해 <strong>비밀</strong>을 유지하십시오.
				오류를 우아하고 안전하게 처리합니다. 데이터베이스에서 <strong>직접 데이터를 로드</strong>하고
				JavaScript를 사용하거나 사용하지 않고 작동하는 <strong>형식이 안전한</strong> 데이터 로드 및
				기본 제공 <strong>양식 작업</strong>을 사용하여 백엔드를 프런트 엔드에 연결합니다.
				동일한 페이지에서 다른 클라이언트 측 라우팅 프레임워크와 <strong>공존</strong>합니다.
				<strong>오프라인</strong> 지원을 위해 서비스 워커를 추가합니다.
				꼭 필요한 경우 <strong>AMP 호환</strong> 페이지를 생성하세요.
				매우 강력한 <strong>파일 시스템 기반 경로</strong>로 복잡한 UI를 구축합니다.
				중첩 레이아웃? 이런, 여러 환경에서 작동하는 <strong>웹 표준</strong>을 배웁니다.
				<strong>Tailwind</strong>, <strong>Playwright</strong>, <strong>Vitest</strong> 및
				<strong>Storybook</strong>과 통합하고 무엇이든 원하는 대로 통합하세요.
				<strong>라이브러리</strong>와 앱을 빌드합니다. 어댑터를 사용하여 <strong>어디에나 배포하십시오</strong>.
			</p>

			<p>
				SvelteKit은 무엇을 구축하든 <strong>함께 성장하는</strong> 프레임워크입니다.
			</p>
		</div>
	</div>
</Section>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}

	.features {
		order: 1;
		text-align: justify;
	}

	h2 {
		float: right;
		width: 5.5em;
	}

	h2 span {
		display: block;
		text-align: right;
		width: 5em;
		margin: 0 0 0 auto;
	}

	.wall {
		margin: 0;
		font-size: var(--sk-text-xs);
	}

	p + p {
		margin-top: 1em;
	}

	p,
	strong {
		color: var(--sk-text-3);
	}

	@media (min-width: 600px) {
		h2 {
			margin-top: 0.5em;
			width: 10em;
		}

		h2 span {
			width: auto;
		}

		/* TODO remove the 62.5% hack so we can use rems in media queries */
		.container {
			--size: 40rem;
			display: block;
		}

		.features {
			padding: 2rem 0 2rem calc(0 * var(--size));
		}
	}

	@media (min-width: 900px) {
		.container {
			--size: 45rem;
		}

		h2 {
			margin-top: 0.1em;
		}

		p {
			font-size: var(--sk-text-s);
		}

		.features {
			padding-top: clamp(0px, calc(23.333vw - 210px), 70px);
		}
	}
</style>
