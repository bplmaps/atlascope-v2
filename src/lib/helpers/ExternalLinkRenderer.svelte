
<script>
    import { onMount } from 'svelte'
    export let href = "";
    export let text = "";
    export let title = undefined;
    let external;
    onMount(() => {
      external = (href.charAt(0) === "/" ? false :
      (new URL(href).origin !== location.origin ? true : false));
    });
  </script>
  
  <a
    {href}
    title={title ? title : undefined}
    target={external ? "_blank" : undefined}
    rel={external ? "nofollow noopener noreferrer" : undefined}
  >
    {text}
  </a>