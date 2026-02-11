console.log('Script started!');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
	console.log('Connecting to database...');
	await prisma.$connect();
	console.log('Connected!');
	
	const count = await prisma.nutrition.count();
	console.log('Current nutrition count:', count);
	
	await prisma.$disconnect();
}

test().catch(console.error);
