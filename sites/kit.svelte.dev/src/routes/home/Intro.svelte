<script>
	import Section from '@sveltejs/site-kit/components/Section.svelte';
</script>

<Section --background="var(--sk-back-1)">
	<div class="grid" style="--columns: 3">
		<div>
			<h2>빠른</h2>
			<p>
				<a target="_blank" rel="noreferrer" href="https://svelte.dev">Svelte</a> 및
				<a target="_blank" rel="noreferrer" href="https://vitejs.dev">Vite</a>로 구동되는 속도는
				빠른 설정, 빠른 개발, 빠른 빌드, 빠른 페이지 로드, 빠른 탐색 등 모든 부분에 적용됩니다.
				우리가 빠르다고 언급했었나요?
			</p>
		</div>

		<div>
			<h2>재미있는</h2>
			<p>
				번들러 구성, 라우팅, SSR, CSP, TypeScript, 배포 설정 및 기타 모든 지루한 작업을 파악하느라
				더 이상 시간을 낭비하지 않아도 됩니다. 기쁘게 코딩하세요.
			</p>
		</div>

		<div>
			<h2>유연한</h2>
			<p>
				SPA? MPA? SSG? SSG? 확인해보세요. SvelteKit은 무엇을 구축하든 성공할 수 있는 도구를 제공합니다.
				그리고 그것은 자바스크립트가 있는 모든 곳에서 실행된다.
			</p>
		</div>
	</div>
</Section>

<style>
	p {
		font-size: var(--sk-text-m);
	}
</style>
