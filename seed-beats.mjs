#!/usr/bin/env node
/**
 * Seed script to populate the Beats table with initial data
 * Usage: node seed-beats.mjs
 * 
 * Make sure you have AWS credentials configured (default profile/region)
 */

import AWS from "aws-sdk";
import { randomUUID } from "crypto";

const TABLE_NAME = "Beats";
const REGION = process.env.AWS_REGION || "ap-south-2";

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: REGION });

// Beat data from user requirements
const beatsData = [
  // Indranil Ghosh beats
  { beatname: "Malda", code: "MAL" },
  { beatname: "Coochbehar", code: "COO" },
  { beatname: "Siliguri", code: "SIL" },
  { beatname: "Raiganj", code: "RAI" },
  { beatname: "Sikkim", code: "SIK" },
  { beatname: "Laketown", code: "LAK" },
  { beatname: "Newtown", code: "NEW" },
  { beatname: "Garia", code: "GAR" },
  { beatname: "Bhowanipore", code: "BHO" },
  { beatname: "Shapoorji", code: "SHA" },
  { beatname: "Rajarhat", code: "RAJ" },
  { beatname: "Park st", code: "PAR" },

  // Saradindu Sarkar beats
  { beatname: "Dhanbad", code: "DHA" },
  { beatname: "Burdwan", code: "BUR" },
  { beatname: "City center", code: "CIT" },
  { beatname: "Bidhannagar", code: "BID" },
  { beatname: "Niamatpur", code: "NIA" },
  { beatname: "Barakar", code: "BAR" },
  { beatname: "Chirkunda", code: "CHI" },
  { beatname: "Chittaranjan", code: "CHT" },
  { beatname: "Bankura", code: "BAN" },
  { beatname: "Siuri", code: "SIU" },
  { beatname: "Bolpur", code: "BOL" },
  { beatname: "Purulaia", code: "PUR" },

  // Kastav Guha Thakurta beats
  { beatname: "Sonarpur", code: "SON" },
  { beatname: "NSC Bose road", code: "NSC" },
  { beatname: "Behala", code: "BEH" },
  { beatname: "Tollygunge", code: "TOL" },
  { beatname: "Goal park", code: "GOA" },
  { beatname: "Jadavpur", code: "JAD" },
  { beatname: "Kalikapur", code: "KAL" },
  { beatname: "Mukundapur", code: "MUK" },
  { beatname: "Park Street", code: "PKS" },
  { beatname: "Kasba", code: "KAS" },
  { beatname: "Ballygunge", code: "BAL" },
  { beatname: "Hazra", code: "HAZ" },

  // Deepak Mishra beats
  { beatname: "Kancharapara", code: "KAN" },
  { beatname: "Barrackpore", code: "BRP" },
  { beatname: "Dunlop", code: "DUN" },
  { beatname: "Bongaon", code: "BON" },
  { beatname: "Basirhat", code: "BAS" },
  { beatname: "Krishnanagar", code: "KRI" },
  { beatname: "Ranaghat", code: "RAN" },
  { beatname: "Barasat", code: "BRA" },
  { beatname: "Jharkhand", code: "JHA" },
  { beatname: "South Bengal", code: "SOU" },
  { beatname: "Murshidabad", code: "MUR" },
  { beatname: "Birati", code: "BIR" },

  // Jharna Naskar Dutta beats
  { beatname: "Bandel", code: "BND" },
  { beatname: "Chinchura", code: "CHN" },
  { beatname: "Chandannagar", code: "CHA" },
  { beatname: "Srirampur", code: "SRI" },
  { beatname: "Konnagar", code: "KON" },
  { beatname: "Bali", code: "BLI" },
  { beatname: "Liluah", code: "LIL" },
  { beatname: "Arambagh", code: "ARA" },
  { beatname: "Maidan", code: "MAI" },
  { beatname: "Howrah AC", code: "HOW" },
  { beatname: "Kestopur", code: "KES" },
  { beatname: "Ulluberia", code: "ULL" },

  // Subrata Ghosh beats
  { beatname: "Bagdogra", code: "BAG" },
  { beatname: "Shivmandir", code: "SHI" },
  { beatname: "Pradhannagar", code: "PRA" },
  { beatname: "Champasari", code: "CHM" },
  { beatname: "Hakimpara", code: "HAK" },
  { beatname: "Hyderpara", code: "HYD" },
  { beatname: "Bhanunagar", code: "BHN" },
  { beatname: "Naxalbari", code: "NAX" },
  { beatname: "Sevoke road", code: "SEV" },
  { beatname: "Punjabi para", code: "PUN" },
  { beatname: "Salbari", code: "SAL" },
  { beatname: "Jalpai More", code: "JAL" },

  // Poltu Saha beats
  { beatname: "Barrackpur", code: "BRK" },
  { beatname: "Shyamnagar", code: "SHY" },
  { beatname: "Naihati", code: "NAI" },
  { beatname: "Kachrapara", code: "KAC" },
  { beatname: "Gobordanga", code: "GOB" },
  { beatname: "Habra", code: "HAB" },
  { beatname: "Dutta pukur", code: "DUT" },
  { beatname: "New Barackpur", code: "NBR" },
  { beatname: "Dumdum cantonment", code: "DUM" },
  { beatname: "Birati", code: "BIT" },
  { beatname: "Chakdaha", code: "CHK" },
];

async function seedBeats() {
  console.log(`Starting to seed ${beatsData.length} beats into ${TABLE_NAME} table...`);
  console.log(`Region: ${REGION}\n`);

  const now = new Date().toISOString();
  let successCount = 0;
  let errorCount = 0;

  for (const beat of beatsData) {
    try {
      const id = randomUUID();
      const item = {
        id,
        beatname: beat.beatname,
        code: beat.code || undefined,
        type: "BEAT",
        createdAt: now,
        updatedAt: now,
      };

      await dynamoDB
        .put({
          TableName: TABLE_NAME,
          Item: item,
          ConditionExpression: "attribute_not_exists(id)",
        })
        .promise();

      console.log(`✓ Created: ${beat.beatname} (${beat.code || "no code"})`);
      successCount++;
    } catch (error) {
      if (error.name === "ConditionalCheckFailedException") {
        console.log(`⚠ Skipped (already exists): ${beat.beatname}`);
      } else {
        console.error(`✗ Error creating ${beat.beatname}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${beatsData.length}`);
}

// Run the seed
seedBeats()
  .then(() => {
    console.log("\n✓ Seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Seeding failed:", error);
    process.exit(1);
  });
