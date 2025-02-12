import { PageProps} from "$fresh/server.ts"

export default function Layout({Component, state}: PageProps) {
  return (
    <div class="container mx-auto p-4 pt-6">
      <Component />
    </div>
  )
}

