<script>
	import Section from '@sveltejs/site-kit/components/Section.svelte';
	import Video from './Video.svelte';
</script>

<Section --background="var(--background-1)">
	<p class="definition">
		<em>/ˈsvɛlt/</em> <span class="adjective">형용사</span>
		<span class="description"><strong>스벨트</strong> 매력적으로 날씬하고, 우아하며 세련된</span>
	</p>

	<div class="grid" style="--columns: 3">
		<div class="video-container">
			<Video />

			<p>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://www.offerzen.com/community/svelte-origins-documentary"
				>
					전체 Svelte Origins 다큐멘터리를 시청
				</a>
			</p>
		</div>

		<div>
			<p>
				SvelteKit은 HTML, CSS 및 JavaScript와 같은 이미 알고 있는 언어를 사용하여 브라우저에서
				최소한의 작업을 수행하는 놀랍도록 간결한 구성 요소를 작성할 수 있도록 컴파일러를 사용하는
				UI 프레임워크인 Svelte를 기반으로 합니다. <strong>웹 개발에 대한 러브레터입니다.</strong>
			</p>

			<p>
				그러나 우리의 말을 믿지 마십시오. 개발자들은 지속적으로 Svelte를 가장 사용하고 싶은 프레임워크
				<a
					target="_blank"
					rel="noreferrer"
					href="https://insights.stackoverflow.com/survey/2021#section-most-loved-dreaded-and-wanted-web-frameworks"
				>
					가장
				</a>
				<a
				target="_blank"
				rel="noreferrer"
				href="https://twitter.com/Rich_Harris/status/1589675637195042817"
				>
					사용하고
				</a>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://tsh.io/state-of-frontend/#which-of-the-following-frameworks-would-you-like-to-learn-in-the-future"
				>
					싶은
				</a>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://2021.stateofjs.com/en-US/libraries/front-end-frameworks/"
				>
					프레임워크
				</a>
				로 꼽습니다.

			</p>
		</div>
	</div>
</Section>

<style>
	p {
		font-size: var(--sk-text-s);
	}

	.definition {
		font-size: var(--sk-text-l);
	}

	.definition em {
		font-style: normal;
		font-size: var(--sk-text-xxl);
		color: var(--sk-theme-1);
	}

	.definition .adjective {
		position: relative;
		top: -0.15em;
		padding: 0.25em 0.5em 0.1em;
		line-height: 1;
		margin: 0 1em;
		text-transform: uppercase;
		font-size: var(--sk-text-s);
		background: var(--sk-text-2);
		border-radius: var(--sk-border-radius);
		color: var(--sk-back-2);
	}

	.definition .description {
		display: block;
	}

	@media (min-width: 900px) {
		.definition .description {
			display: inline;
		}

		.video-container {
			order: 2;
			grid-column: 2 / 4;
		}
	}
</style>
