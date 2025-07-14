<script lang="ts">
	import { onMount } from 'svelte';

	let { gaPropertyId } = $props();

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
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaPropertyId}`;
		document.head.appendChild(script);

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
