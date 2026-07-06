import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const instance = JSON.parse(
  readFileSync(new URL('./src/config/instance.json', import.meta.url), 'utf8'),
)

// Injects the instance's SEO/social meta tags into index.html at dev and
// build time, so instance.json is the single source of truth for them.
// Social scrapers don't execute JS, which is why these must land in the
// static HTML rather than <svelte:head>.
function instanceMetaTags() {
  const m = instance.metaTags
  const meta = (attrs) => ({ tag: 'meta', attrs, injectTo: 'head' })
  return {
    name: 'atlascope-instance-meta-tags',
    transformIndexHtml(html) {
      if (!m) return html
      const og = m.openGraph
      const img = og.images?.[0]
      const tw = m.twitter
      return {
        html: html.replace(/<title>.*?<\/title>/, `<title>${m.title}</title>`),
        tags: [
          meta({ name: 'description', content: m.description }),
          { tag: 'link', attrs: { rel: 'canonical', href: m.canonical }, injectTo: 'head' },
          meta({ name: 'twitter:card', content: tw.cardType }),
          meta({ name: 'twitter:site', content: tw.site }),
          meta({ name: 'twitter:creator', content: tw.handle }),
          meta({ name: 'twitter:title', content: tw.title }),
          meta({ name: 'twitter:description', content: tw.description }),
          meta({ name: 'twitter:image', content: tw.image }),
          meta({ name: 'twitter:image:alt', content: tw.imageAlt }),
          meta({ property: 'og:url', content: og.url }),
          meta({ property: 'og:title', content: og.title }),
          meta({ property: 'og:description', content: og.description }),
          ...(img
            ? [
                meta({ property: 'og:image', content: img.url }),
                meta({ property: 'og:image:alt', content: img.alt }),
                meta({ property: 'og:image:width', content: String(img.width) }),
                meta({ property: 'og:image:height', content: String(img.height) }),
              ]
            : []),
          meta({ property: 'og:site_name', content: og.site_name }),
        ],
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), instanceMetaTags()],
})
