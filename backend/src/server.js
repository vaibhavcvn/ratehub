import app from './app.js';
import prisma from './utils/prisma.js';

const port = Number(process.env.PORT ?? 5000);

app.listen(port, () => {
  console.log(`RateHub API listening on port ${port}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
