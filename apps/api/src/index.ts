import { buildApp } from './app';

async function main() {
  const app = await buildApp();
  const address = await app.listen({ port: Number(process.env.PORT || 4000), host: '0.0.0.0' });
  console.log(`API listening on ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
