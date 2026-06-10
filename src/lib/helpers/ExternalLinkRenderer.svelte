<script>
  const { href = "", title = undefined, children } = $props();

  // Treat any absolute URL pointing off-origin as external
  const external = $derived(
    href.charAt(0) !== "/" &&
      new URL(href, location.origin).origin !== location.origin,
  );
</script>

<a
  {href}
  title={title ? title : undefined}
  target={external ? "_blank" : undefined}
  rel={external ? "nofollow noopener noreferrer" : undefined}
>
  {@render children?.()}
</a>
