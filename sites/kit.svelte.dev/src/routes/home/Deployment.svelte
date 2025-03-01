<script>
	import Section from '@sveltejs/site-kit/components/Section.svelte';
	import html5 from './logos/html5.svg';
	import node from './logos/node.svg';
	import vercel from './logos/vercel.svg';
	import netlify from './logos/netlify.svg';
	import cloudflare from './logos/cloudflare.svg';
	import firebase from './logos/firebase.svg';
	import deno from './logos/deno.svg';
	import lambda from './logos/lambda.svg';
	import azure from './logos/azure.svg';
	import plus from '$lib/icons/plus.svg';
</script>

<Section --background="var(--background-1)">
	<div class="grid" style="--columns: 3">
		<h2>어디에나 배포하십시오</h2>
		<div class="blurb">
			<p>
				정적 HTML 파일을 내보냅니다. 자신의 노드 서버를 실행하십시오.
				세계의 에지에 코드를 배포합니다.
				플랫폼이 JavaScript를 실행하는 경우 경우에 따라
				<strong>제로 구성</strong>으로 SvelteKit을 실행합니다.
			</p>
			<p>다른 곳에 배포하고 싶습니까? 한 줄의 코드로 어댑터를 교체하십시오.</p>
		</div>
	</div>

	<div class="grid" style="--columns: 3">
		<div class="platforms left">
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/sveltejs/kit/tree/master/packages/adapter-static"
				class="invert"
			>
				<img src={html5} alt="" />
				<span><span class="large">Static</span> HTML</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/sveltejs/kit/tree/master/packages/adapter-node"
				class="invert"
			>
				<img src={node} alt="" />
				<span>Node.js</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://vercel.com/templates/svelte/sveltekit-boilerplate"
				class="invert invert-hover"
			>
				<img src={vercel} alt="" style="transform: translate(0,-0.2rem)" />
				<span>Vercel</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/sveltejs/kit/tree/master/packages/adapter-netlify"
			>
				<img src={netlify} alt="" />
				<span>Netlify</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/sveltejs/kit/tree/master/packages/adapter-cloudflare"
			>
				<img src={cloudflare} alt="" />
				<span>Cloudflare</span>
			</a>
		</div>

		<div class="platforms right">
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/jthegedus/svelte-adapter-firebase"
			>
				<img src={firebase} alt="" />
				<span>Firebase</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/pluvial/svelte-adapter-deno"
				class="invert invert-hover"
			>
				<img src={deno} alt="" />
				<span>Deno</span>
			</a>
			<a target="_blank" rel="noreferrer" href="https://github.com/MikeBild/sveltekit-adapter-aws">
				<img src={lambda} alt="" />
				<span>AWS</span>
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://github.com/geoffrich/svelte-adapter-azure-swa"
			>
				<img src={azure} alt="" />
				<span>Azure</span>
			</a>
			<a target="_blank" rel="noreferrer" href="https://kit.svelte.dev/docs/adapters">
				<img src={plus} alt="" />
				<span>More...</span>
			</a>
		</div>

		<div class="globe">
			<img
				src="/edge.svg"
				width="100%"
				height="100%"
				alt="Dynamically rendered map of the world, centered on the user's location"
			/>
			<span> 에지에 렌더링, 당신을 위해서 </span>
		</div>
	</div>
</Section>

<style>
	.globe {
		--max-size: 40rem;
		position: relative;
		width: 100%;
		max-height: var(--max-size);
		text-align: center;
		aspect-ratio: 1;
	}

	.globe img {
		max-width: var(--max-size);
		max-height: var(--max-size);
	}

	.globe span {
		position: absolute;
		bottom: -4rem;
		left: 0;
		width: 100%;
		color: var(--sk-text-3);
		font-size: var(--sk-text-xs);
	}

	.globe span::before {
		--size: 2rem;
		content: '';
		position: absolute;
		width: var(--size);
		height: var(--size);
		background: url($lib/icons/up-small.svg) no-repeat center;
		left: calc(50% - 0.5 * var(--size));
		top: -3rem;
	}

	.platforms {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 1rem;
		align-items: center;
	}

	.platforms a {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		color: inherit;
	}

	.platforms.left {
		justify-content: flex-end;
		flex-direction: column-reverse;
	}

	.platforms a span {
		font-size: var(--sk-text-xs);
		color: var(--sk-text-3);
		text-align: center;
	}

	.platforms img {
		--size: 4rem;
		--invert: 0;
		--invert-hover: 0;
		width: var(--size);
		height: var(--size);
		object-fit: contain;
		filter: invert(var(--invert)) opacity(0.5) grayscale(100%);
		transition: filter 0.2s;
	}

	.platforms a:hover img,
	.platforms a:focus-visible img {
		filter: invert(var(--invert-hover));
		transition: none;
	}

	.platforms a:hover span,
	.platforms a:focus-visible span {
		color: var(--sk-text-1);
	}

	p {
		margin-top: 0;
	}

	.large {
		display: none;
	}

	@media (min-width: 600px) {
		.large {
			display: initial;
		}
	}

	@media (min-width: 900px) {
		.blurb {
			grid-column: 2 / 4;
		}

		.platforms {
			display: grid;
			grid-template-columns: none;
			grid-template-rows: repeat(4, 1fr);
			align-items: center;
		}

		.platforms a {
			--direction: -1;
			flex-direction: row;
			align-items: center;
			gap: 2rem;
			height: 100%;
		}

		.platforms.left {
			order: 1;
		}

		.globe {
			order: 2;
		}

		.platforms.right {
			order: 3;
		}

		.platforms a:first-child,
		.platforms a:last-child {
			transform: translate(calc(var(--direction) * 5rem), 0);
		}

		.platforms a:nth-child(2) {
			transform: translate(calc(var(--direction) * 1rem), -0.2rem);
		}

		.platforms a:nth-child(4) {
			transform: translate(calc(var(--direction) * 1rem), 0.2rem);
		}

		.platforms.left {
			justify-content: flex-end;
			flex-direction: row-reverse;
		}

		.platforms.left a {
			--direction: 1;
			flex-direction: row-reverse;
		}
	}

	@media (prefers-color-scheme: dark) {
		.invert img {
			--invert: 1;
		}

		.invert-hover img {
			--invert-hover: 1;
		}
	}
</style>
