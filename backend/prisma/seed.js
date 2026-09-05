import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const users = [
  ['Aarav Sharma System Administrator', 'admin@ratehub.local', '12 Platform Avenue, Pune, Maharashtra', 'ADMIN', 'Admin@1234'],
  ['Store Rating Platform Administrator', 'admin@storerating.com', 'Pune', 'ADMIN', 'Admin@1234'],
  ['Meera Kulkarni Verified Customer', 'user@ratehub.local', '8 Residency Road, Bengaluru, Karnataka', 'USER', 'User@1234'],
  ['Store Rating Platform User Account', 'user@storerating.com', 'Pune', 'USER', 'User@1234'],
  ['Kabir Joshi Frequent Reviewer', 'kabir@ratehub.local', '17 Law Garden, Ahmedabad, Gujarat', 'USER', 'User@1234'],
  ['Ananya Desai Community Member', 'ananya@ratehub.local', '42 Banjara Hills, Hyderabad, Telangana', 'USER', 'User@1234'],
  ['Vikram Rao Local Explorer', 'vikram@ratehub.local', '9 Anna Nagar, Chennai, Tamil Nadu', 'USER', 'User@1234'],
  ['Ishita Mehta Verified Customer', 'ishita@ratehub.local', '28 Salt Lake, Kolkata, West Bengal', 'USER', 'User@1234'],
  ['Rohan Deshmukh Store Owner', 'rohan@ratehub.local', '31 Camp Road, Pune, Maharashtra', 'OWNER', 'Owner@1234'],
  ['Store Rating Platform Shopkeeper', 'owner@storerating.com', 'Pune', 'OWNER', 'Owner@1234'],
  ['Nisha Patil Store Owner', 'nisha@ratehub.local', '44 MG Road, Nagpur, Maharashtra', 'OWNER', 'Owner@1234'],
  ['Arjun Malhotra Store Owner', 'arjun@ratehub.local', '6 Sector 17, Chandigarh', 'OWNER', 'Owner@1234'],
  ['Priya Menon Store Owner', 'priya@ratehub.local', '15 Panampilly Nagar, Kochi, Kerala', 'OWNER', 'Owner@1234'],
  ['Siddharth Shah Store Owner', 'siddharth@ratehub.local', '21 Navrangpura, Ahmedabad, Gujarat', 'OWNER', 'Owner@1234'],
];

const storeNames = [
  ['Northstar Home Electronics', 'Electronics', 'Pune', 'Maharashtra'], ['Mango Leaf Lifestyle Market', 'Grocery', 'Nagpur', 'Maharashtra'], ['Harbor Street Books Cafe', 'Book Stores', 'Pune', 'Maharashtra'], ['TechWorld Electronics', 'Electronics', 'Aurangabad', 'Maharashtra'], ['FreshMart Supermarket', 'Supermarkets', 'Mumbai', 'Maharashtra'], ['UrbanStyle Clothing', 'Clothing', 'Bengaluru', 'Karnataka'], ['Cafe Aroma', 'Cafes', 'Bengaluru', 'Karnataka'], ['HomeCraft Furniture', 'Furniture', 'Hyderabad', 'Telangana'], ['WellCare Pharmacy', 'Pharmacy', 'Chennai', 'Tamil Nadu'], ['MobilePoint Hub', 'Mobile Stores', 'Ahmedabad', 'Gujarat'], ['GreenBasket Organics', 'Grocery', 'Kochi', 'Kerala'], ['The Running Room', 'Sports', 'Chandigarh', 'Chandigarh'], ['Glow Beauty Studio', 'Beauty', 'Kolkata', 'West Bengal'], ['DriveSure Automotives', 'Automotive', 'Delhi', 'Delhi'], ['StepUp Footwear', 'Footwear', 'Jaipur', 'Rajasthan'], ['Curry Leaf Kitchen', 'Restaurants', 'Pune', 'Maharashtra'], ['The Reading Room', 'Book Stores', 'Bengaluru', 'Karnataka'], ['Silverline Appliances', 'Home Appliances', 'Mumbai', 'Maharashtra'], ['Daily Harvest Market', 'Supermarkets', 'Hyderabad', 'Telangana'], ['Blue Door Cafe', 'Cafes', 'Chennai', 'Tamil Nadu'], ['Metro Gadget Gallery', 'Electronics', 'Delhi', 'Delhi'], ['Cotton Route Apparel', 'Clothing', 'Ahmedabad', 'Gujarat'], ['Oak and Olive Furniture', 'Furniture', 'Kochi', 'Kerala'], ['CityMed Pharmacy', 'Pharmacy', 'Kolkata', 'West Bengal'], ['Sprint Sports Arena', 'Sports', 'Jaipur', 'Rajasthan'], ['Lotus Beauty Lounge', 'Beauty', 'Nagpur', 'Maharashtra'], ['AutoNest Service Centre', 'Automotive', 'Chandigarh', 'Chandigarh'], ['Walkway Shoes', 'Footwear', 'Mumbai', 'Maharashtra'], ['Spice Route Restaurant', 'Restaurants', 'Hyderabad', 'Telangana'], ['Paper Trails Books', 'Book Stores', 'Delhi', 'Delhi'], ['Nova Home Appliances', 'Home Appliances', 'Pune', 'Maharashtra'], ['Harvest Hub Grocers', 'Grocery', 'Chennai', 'Tamil Nadu'], ['Cobalt Mobile Store', 'Mobile Stores', 'Bengaluru', 'Karnataka'], ['Kindred Clothing Co', 'Clothing', 'Kolkata', 'West Bengal'], ['Terracotta Home Studio', 'Furniture', 'Ahmedabad', 'Gujarat'], ['Wellness First Pharmacy', 'Pharmacy', 'Kochi', 'Kerala'], ['Morning Dew Cafe', 'Cafes', 'Jaipur', 'Rajasthan'], ['The Local Table', 'Restaurants', 'Nagpur', 'Maharashtra'], ['Peak Performance Sports', 'Sports', 'Delhi', 'Delhi'], ['Radiant Beauty Collective', 'Beauty', 'Mumbai', 'Maharashtra'],
];
const owners = ['rohan@ratehub.local', 'nisha@ratehub.local', 'arjun@ratehub.local', 'priya@ratehub.local', 'siddharth@ratehub.local'];
const reviewers = ['user@ratehub.local', 'kabir@ratehub.local', 'ananya@ratehub.local', 'vikram@ratehub.local', 'ishita@ratehub.local'];
const comments = ['Excellent service and a thoughtful team.', 'Good quality and a smooth experience.', 'Helpful staff, though the wait was longer than expected.', 'A reliable neighborhood option.', 'Great value for the price.'];

async function main() {
  const createdUsers = {};
  for (const [name, email, address, role, password] of users) {
    createdUsers[email] = await prisma.user.upsert({ where: { email }, update: { name, address, role, password: await bcrypt.hash(password, 12) }, create: { name, email, address, role, password: await bcrypt.hash(password, 12) } });
  }
  const createdStores = {};
  for (const [index, [name, category, city, state]] of storeNames.entries()) {
    const email = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@ratehub.local`;
    const ownerEmail = index < 35 ? owners[index % owners.length] : null;
    const data = { name, email, category, address: `${index + 4} ${city} Market Road, ${city}, ${state}`, description: `${name} is a trusted local destination for quality ${category.toLowerCase()} and friendly service.`, ownerId: ownerEmail ? createdUsers[ownerEmail].id : null };
    createdStores[email] = await prisma.store.upsert({ where: { email }, update: data, create: data });
  }
  for (const [index, store] of Object.values(createdStores).entries()) {
    const reviewCount = index % 7 === 0 ? 0 : 3 + (index % 4);
    for (let offset = 0; offset < reviewCount; offset += 1) {
      const reviewer = createdUsers[reviewers[(index + offset) % reviewers.length]];
      const data = { rating: ((index + offset * 2) % 5) + 1, comment: comments[(index + offset) % comments.length] };
      await prisma.rating.upsert({ where: { userId_storeId: { userId: reviewer.id, storeId: store.id } }, update: data, create: { ...data, userId: reviewer.id, storeId: store.id } });
    }
    if (index % 3 === 0) { const user = createdUsers[reviewers[index % reviewers.length]]; await prisma.favorite.upsert({ where: { userId_storeId: { userId: user.id, storeId: store.id } }, update: {}, create: { userId: user.id, storeId: store.id } }); }
  }
  console.log(`TrustMark seed completed: ${Object.keys(createdUsers).length} users, ${Object.keys(createdStores).length} stores.`);
}

main().catch((error) => { console.error('TrustMark seed failed:', error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
