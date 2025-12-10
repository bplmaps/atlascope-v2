<script>
  import { onMount } from 'svelte';

  let { gaPropertyId } = $props();

  onMount(() => {
    if (!gaPropertyId) {
      console.warn('Google Analytics property ID not provided');
      return;
    }

    // Load the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaPropertyId}`;
    document.head.appendChild(script);

    // Initialize the dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    // Configure GA4
    gtag('js', new Date());
    gtag('config', gaPropertyId);

    // console.log('Google Analytics 4 initialized with ID:', gaPropertyId);
  });
</script>
