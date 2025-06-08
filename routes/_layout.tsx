import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state: _state }: PageProps) {
  return (
    <>
      <head>
        <title>sample_idp</title>
      </head>
      <div class="container mx-auto p-4 pt-6">
        <Component />
      </div>
    </>
  );
}
