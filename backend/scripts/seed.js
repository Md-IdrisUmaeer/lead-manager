// Clears the leads collection and inserts 30 sample leads
// spread across every source and status.
require('dotenv').config();

const mongoose = require('mongoose');
const Lead = require('../src/models/Lead');
const { LEAD_SOURCES, LEAD_STATUSES } = require('../src/constants/lead.constants');

const FIRST = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Rahul', 'Meera',
  'Karan', 'Divya', 'Aditya', 'Pooja', 'Nikhil', 'Isha', 'Siddharth', 'Riya', 'Manish', 'Neha',
  'Varun', 'Tanvi', 'Harsh', 'Shreya', 'Kunal', 'Aisha', 'Dev', 'Nisha', 'Yash', 'Lakshmi'];
const LAST = ['Sharma', 'Iyer', 'Mehta', 'Reddy', 'Nair', 'Gupta', 'Rao', 'Menon', 'Patel', 'Kapoor'];
const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Ltd', 'Stark Industries', 'Wayne Enterprises',
  'Hooli', 'Pied Piper', 'Vandelay Imports', 'Soylent Co', ''];

function buildLeads() {
  const now = Date.now();
  return FIRST.map((first, i) => {
    const last = LAST[i % LAST.length];
    // Spread createdAt over the last 30 days so sorting by date is meaningful.
    const createdAt = new Date(now - i * 24 * 60 * 60 * 1000 - i * 37 * 60 * 1000);
    return {
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      phone: i % 4 === 3 ? undefined : `+91 98${String(76543210 + i * 1111).slice(0, 3)} ${String(10000 + i * 317).slice(0, 5)}`,
      company: COMPANIES[i % COMPANIES.length] || undefined,
      source: LEAD_SOURCES[i % LEAD_SOURCES.length],
      status: LEAD_STATUSES[(i * 3 + Math.floor(i / 4)) % LEAD_STATUSES.length],
      createdAt,
      updatedAt: createdAt,
    };
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Lead.syncIndexes();
  await Lead.deleteMany({});
  // timestamps: false keeps the spread-out createdAt values above.
  const docs = await Lead.insertMany(buildLeads(), { timestamps: false });
  console.log(`Seeded ${docs.length} leads`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
