<script lang="ts">
	import { onMount } from 'svelte';

	let { gaPropertyId, gaTMContainerId } = $props();

	// Utility function to track custom events
	function trackEvent(eventName: string, parameters?: Record<string, any>) {
		if ((window as any).gtag) {
			(window as any).gtag('event', eventName, parameters);
		} else {
			console.warn('GoogleAnalytics: gtag not initialized yet');
		}
	}

	// Utility function to track page views
	function trackPageView(pageTitle?: string, pageLocation?: string) {
		if ((window as any).gtag) {
			(window as any).gtag('config', gaPropertyId, {
				page_title: pageTitle,
				page_location: pageLocation
			});
		} else {
			console.warn('GoogleAnalytics: gtag not initialized yet');
		}
	}

	onMount(() => {
		if (!gaPropertyId) {
			console.warn('GoogleAnalytics: No GA property ID provided');
			return;
		}

		// Load Google Analytics script
		const scriptGA = document.createElement('script');
		scriptGA.async = true;
		scriptGA.src = `https://www.googletagmanager.com/gtag/js?id=${gaPropertyId}`;
		document.head.appendChild(scriptGA);

		// Load GA TM script
		const scriptGATM = document.createElement('script');
		scriptGATM.async = true;
		scriptGATM.innerHTML = (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',`${gaTMContainerId}`);
		document.head.appendChild(scriptGATM);

		// Initialize gtag
		(window as any).dataLayer = (window as any).dataLayer || [];
		function gtag(...args: any[]) {
			(window as any).dataLayer.push(args);
		}
		gtag('js', new Date());
		gtag('config', gaPropertyId);

		// Make gtag available globally
		(window as any).gtag = gtag;

		// Make utility functions available globally
		(window as any).trackEvent = trackEvent;
		(window as any).trackPageView = trackPageView;
	});
</script>

<!-- This component doesn't render anything visible -->
