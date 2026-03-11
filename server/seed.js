require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const TaskPool = require('./models/TaskPool');
const Achievement = require('./models/Achievement');
const DailyRotation = require('./models/DailyRotation');

// DNS Fix for some networks
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("🌱 Starting Full Database Seed...");

    /* =================================================
        CLEAR DATABASE
    ================================================= */
    await Item.deleteMany({});
    await TaskPool.deleteMany({});
    await Achievement.deleteMany({});
    await DailyRotation.deleteMany({});
    console.log("🧹 Database Cleared");

    /* =================================================
        1. ACHIEVEMENTS (15 Total)
    ================================================= */
    await Achievement.insertMany([
      { key: 'SHOP_BUY', title: 'First Coin Spent', description: 'Buy an item in the Shop', requirementType: 'SHOP_BUY', requirementValue: 1 },
      { key: 'EQUIP_ARMOR', title: 'Suit Up', description: 'Equip an armor in your Inventory', requirementType: 'INVENTORY_EQUIP', requirementValue: 1 },
      { key: 'FIRST_DAILY', title: 'Daily Grind', description: 'Do your first Daily Quest', requirementType: 'QUEST_DAILY', requirementValue: 1 },
      { key: 'BEAT_MEDIUM', title: 'Warming Up', description: 'Defeat a Medium node.', requirementType: 'NODE_MEDIUM', requirementValue: 1 },
      { key: 'LVL_5', title: 'Rising Star', description: 'Level up to 5', requirementType: 'LEVEL_REACH', requirementValue: 5 },
      { key: 'JOIN_GUILD', title: 'Team Player', description: 'Join a Guild', requirementType: 'SOCIAL_GUILD', requirementValue: 1 },
      { key: 'ADD_GFRIEND', title: 'Making Connections', description: 'Add someone as a GFriend', requirementType: 'SOCIAL_FRIEND', requirementValue: 1 },
      { key: 'BEAT_HARD', title: 'Boss Slayer', description: 'Defeat a Hard node', requirementType: 'NODE_BOSS', requirementValue: 1 },
      { key: 'OBTAIN_5_ITEMS', title: 'Hoarder', description: 'Obtain 5 different items', requirementType: 'INVENTORY_UNIQUE', requirementValue: 5 },
      { key: 'REARRANGE_50', title: 'Bored Organizer', description: 'Rearrange items in your inventory 50 Times', requirementType: 'INVENTORY_MOVE', requirementValue: 50 },
      { key: 'EQUIP_ALL', title: 'Fully Geared', description: 'Equip items in all armor slots.', requirementType: 'INVENTORY_FULL_EQUIP', requirementValue: 3 },
      { key: 'LVL_10', title: 'Code Veteran', description: 'Level up to 10', requirementType: 'LEVEL_REACH', requirementValue: 10 },
      { key: 'BUY_ALL_SCROLLS', title: 'Knowledge Seeker', description: 'Buy all the Scrolls in the Shop', requirementType: 'SHOP_BUY_SCROLLS', requirementValue: 10 },
      { key: 'COMPLETE_SOLO', title: 'The Algorithm Myth', description: 'Complete Solo Area', requirementType: 'NODE_SOLO_ALL', requirementValue: 12 },
      { key: 'COMPLETE_ALL_SCROLLS', title: 'Master of Scrolls', description: 'Complete all the scrolls in the shop', requirementType: 'QUEST_SCROLLS_ALL', requirementValue: 10 },
    ]);
    console.log("✅ Achievements Seeded");

    /* =================================================
        2. DEFINE SHOP BOUNTY IDs (For Scroll Linking)
    ================================================= */
    const shopIds = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId());

    /* =================================================
        3. TASK POOL: SOLO, DAILY, AND SHOP
    ================================================= */
    
    const dailyQuests = [
      {
        nodeTitle: "Daily: Array Summation", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 50, xp: 100 },
        phases: [{
          questionTitle: "Sum of Elements",
          description: "Write a program that prints the sum of two integers (5 and 10).",
          constraints: ["OP:+", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int a = 5, b = 10;\n  // cout your result here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: The Divisor Check", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 50, xp: 100 },
        phases: [{
          questionTitle: "Divisible by 3 and 5",
          description: "Check if the variable 'n' is divisible by both 3 and 5 using the % operator.",
          constraints: ["OP:%", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int n = 15;\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Algebraic Compute", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 60, xp: 120 },
        phases: [{
          questionTitle: "Difference and Multiply",
          description: "Print the difference of a and b multiplied by the value of c.",
          constraints: ["OP:-", "OP:*", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int a=10, b=5, c=2;\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Grade Switcher", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 150, xp: 300 },
        phases: [{
          questionTitle: "Switching Grades",
          description: "Use a switch statement on the char 'grade'.",
          constraints: ["TYPE:switch", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  char grade = 'A';\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Odd While Loop", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 80, xp: 150 },
        phases: [{
          questionTitle: "While Odds",
          description: "Print numbers using a while loop.",
          constraints: ["TYPE:while", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int i = 0;\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Modulo Assignment", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 50, xp: 100 },
        phases: [{
          questionTitle: "Using %=",
          description: "Update the variable 'rem' using the %= operator with 2.",
          constraints: ["OP:%=", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int rem = 10;\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Test Scores", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 200, xp: 400 },
        phases: [{
          questionTitle: "Average Scores",
          description: "Calculate the average of 3 scores.",
          constraints: ["TYPE:if", "OP:/", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int s1=90, s2=80, s3=70;\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Multiplication Logic", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 250, xp: 500 },
        phases: [{
          questionTitle: "For Loop Logic",
          description: "Use a for loop to print 'Algomyth' 3 times.",
          constraints: ["TYPE:for", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: String Echo", difficulty: "Easy", requiredStreak: 1, source: "daily", reward: { gold: 30, xp: 60 },
        phases: [{
          questionTitle: "String Display",
          description: "Create a string variable 'name' and print it.",
          constraints: ["TYPE:string", "PRINT"],
          starterCode: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n  return 0;\n}`
        }]
      }
    ];

    const shopQuests = [
      {
        _id: shopIds[0], nodeTitle: "Bounty: While Loop Table", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 300, xp: 500 },
        phases: [{ questionTitle: "Multiplication Table", description: "Use a while loop and * operator.", constraints: ["TYPE:while", "OP:*", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[1], nodeTitle: "Bounty: Array Sum", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 300, xp: 500 },
        phases: [{ questionTitle: "Index Access", description: "Add array elements together.", constraints: ["OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int arr[2] = {5, 5};\n  return 0;\n}` }]
      },
      {
        _id: shopIds[2], nodeTitle: "Bounty: Tabbed Output", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 200, xp: 400 },
        phases: [{ questionTitle: "Format String", description: "Print a string using tabs.", constraints: ["TYPE:string", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[3], nodeTitle: "Bounty: Day Switcher", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 500, xp: 800 },
        phases: [{ questionTitle: "Switch Statement", description: "Map numbers to days.", constraints: ["TYPE:switch", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int day = 1;\n  return 0;\n}` }]
      },
      {
        _id: shopIds[4], nodeTitle: "Bounty: Cylinder Volume", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 600, xp: 1000 },
        phases: [{ questionTitle: "Geometry Compute", description: "Multiply variables to find volume.", constraints: ["OP:*", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[5], nodeTitle: "Bounty: Currency Converter", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 550, xp: 900 },
        phases: [{ questionTitle: "USD Conversion", description: "Use double and * operator.", constraints: ["TYPE:double", "OP:*", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[6], nodeTitle: "Bounty: Square Root", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 350, xp: 600 },
        phases: [{ questionTitle: "Math Functions", description: "Print the result of a square root.", constraints: ["PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[7], nodeTitle: "Bounty: BMI Calculator", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 700, xp: 1200 },
        phases: [{ questionTitle: "If-Else Categories", description: "Use if-else and / operator.", constraints: ["TYPE:if", "OP:/", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[8], nodeTitle: "Bounty: Even Digits Sum", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 650, xp: 1100 },
        phases: [{ questionTitle: "For Loop Sum", description: "Use for and % operator.", constraints: ["TYPE:for", "OP:%", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      },
      {
        _id: shopIds[9], nodeTitle: "Bounty: Leap Years", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 800, xp: 1500 },
        phases: [{ questionTitle: "Timeline Logic", description: "Use a for loop.", constraints: ["TYPE:for", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }]
      }
    ];

    const cppCampaign = [
      { nodeTitle: "Whispering Gate", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 10, xp: 50 }, phases: [{ questionTitle: "Say the Greeting", description: 'Print "Hello Traveler" using cout.', constraints: ["PRINT:Hello Traveler"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // print Hello Traveler\n  return 0;\n}` }] },
      { nodeTitle: "Crystal Arch", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 12, xp: 55 }, phases: [{ questionTitle: "Echo the Call", description: 'Print "I am here".', constraints: ["PRINT:I am here"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Mossy Door", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 15, xp: 60 }, phases: [{ questionTitle: "Ancient Greeting", description: 'Print "Greetings".', constraints: ["PRINT:Greetings"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Iron Keyhole", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 18, xp: 70 }, phases: [{ questionTitle: "Unlock the Phrase", description: 'Print "Open Sesame".', constraints: ["PRINT:Open Sesame"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Alchemist Lab", difficulty: "Medium", requiredStreak: 2, source: "solo", reward: { gold: 120, xp: 250 }, phases: [{ questionTitle: "Potion Mix", description: `Add red (12) and blue (8) to create purple.`, constraints: ["VAR:red", "VAR:blue", "VAR:purple", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int red = 12;\n  int blue = 8;\n  return 0;\n}` }, { questionTitle: "Temperature Rise", description: `Add 1.5 to temp.`, constraints: ["VAR:temp", "NUM:1.5", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  double temp = 98.5;\n  return 0;\n}` }] },
      { nodeTitle: "Clockwork Tower", difficulty: "Medium", requiredStreak: 2, source: "solo", reward: { gold: 150, xp: 300 }, phases: [{ questionTitle: "Gear Alignment", description: `Add 4 to gears.`, constraints: ["VAR:gears", "NUM:4", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  int gears = 3;\n  return 0;\n}` }] },
      { nodeTitle: "Syntax Sentinel", difficulty: "Boss", requiredStreak: 2, source: "solo", reward: { gold: 500, xp: 1000 }, phases: [{ questionTitle: "Access Control", description: `Create bool access_granted = true.`, constraints: ["TYPE:bool", "VAR:access_granted", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }, { questionTitle: "Key Override", description: `Change char key to 'Z'.`, constraints: ["TYPE:char", "VAR:key", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  char key = 'A';\n  return 0;\n}` }] }
    ];

    await TaskPool.insertMany([...cppCampaign, ...dailyQuests, ...shopQuests]);
    console.log("✅ Task Pool and Bounties Seeded");

    /* =================================================
        4. ITEMS: ACCESSORIES, WINGS, ARMOR, SCROLLS
    ================================================= */
    const specializedArmor = [
  // Mage Sets
  ...['V1', 'V2', 'V3', 'V4', 'V5'].map((v, i) => ({
    name: `Mage Robes ${v}`,
    category: 'Head', // Matches your existing armor slot convention
    price: 1200 + (i * 1200), // V1: 1200, V5: 6000
    classReq: 'mage',
    variant: `mage${v}`,
    image: `/src/assets/items/mage${v}.png`,
    description: `High-resonance silk woven for Tier ${i + 1} spellcasting.`
  })),

  // Rogue Sets
  ...['V1', 'V2', 'V3', 'V4', 'V5'].map((v, i) => ({
    name: `Rogue Leathers ${v}`,
    category: 'Head',
    price: 1100 + (i * 1100), // V1: 1100, V5: 5500
    classReq: 'rogue',
    variant: `rogue${v}`,
    image: `/src/assets/items/rogue${v}.png`,
    description: `Shadow-stitched hide providing Tier ${i + 1} agility.`
  }))
];
    
    const itemData = [
      // Accessories (Flyte, Gryfon, etc)
      ...['Black', 'Blue', 'Cool', 'Green', 'Pink', 'Rainbow', 'Red', 'Spicy', 'Yellow'].map(v => ({ name: `Flyte (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Flyte', variant: v, image: `/src/assets/accessory/Flyte/${v}.png` })),
      ...['Black', 'Brown', 'Gray', 'Green', 'Rainbow', 'Red', 'Spicy', 'White'].map(v => ({ name: `Gryfon (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Gryfon', variant: v, image: `/src/assets/accessory/Gryfon/${v}.png` })),
      ...['Black', 'Cool', 'Neutral', 'Rainbow', 'Spicy', 'White'].map(v => ({ name: `Igalyph (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Igalyph', variant: v, image: `/src/assets/accessory/Igalyph/${v}.png` })),
      // Wings
      ...['Aqua', 'Black', 'BPshift', 'BGshift', 'CBlue', 'Dgreen', 'DWshift', 'Gshift', 'Purple', 'SBlue', 'SWhite', 'Wshift'].map(v => ({ name: `${v.replace('shift', ' Shift')} Wings`, category: 'Body', price: v.includes('shift') ? 4500 : 3000, variant: v, image: `/src/assets/body/${v}.png` })),
      // Head Armor
      ...['knight', 'mage', 'rogue'].flatMap(cls => 
    ['V1', 'V2', 'V3', 'V4', 'V5'].map((v, i) => ({
      name: `${cls.toUpperCase()} Helm ${v}`,
      category: 'Head',
      price: 1000 + (i * 1000),
      classReq: cls,
      variant: `${cls}${v}`,
      image: `/src/assets/items/${cls}${v}.png`,
      description: `Tier ${i + 1} gear for the ${cls} class.`
    }))
  ),
      ...specializedArmor,
      // QUEST SCROLLS (Linked to Task IDs)
      { name: "Scroll of Multiplication", description: "Unlocks While Loop bounty.", price: 150, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[0] },
      { name: "Scroll of Arrays", description: "Unlocks Array Sum bounty.", price: 150, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[1] },
      { name: "Scroll of Formatting", description: "Unlocks Tabbed Output bounty.", price: 100, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[2] },
      { name: "Scroll of the Calendar", description: "Unlocks Day Switcher bounty.", price: 250, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[3] },
      { name: "Scroll of Geometry", description: "Unlocks Cylinder Volume bounty.", price: 300, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[4] },
      { name: "Scroll of Commerce", description: "Unlocks Currency Converter bounty.", price: 275, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[5] },
      { name: "Scroll of Roots", description: "Unlocks Square Root bounty.", price: 175, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[6] },
      { name: "Scroll of Health", description: "Unlocks BMI Calculator bounty.", price: 350, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[7] },
      { name: "Scroll of Evens", description: "Unlocks Even Digits Sum bounty.", price: 325, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[8] },
      { name: "Scroll of Time", description: "Unlocks Leap Years bounty.", price: 400, category: "Quest", image: "/src/assets/items/scroll.png", unlocksTaskId: shopIds[9] }
    ];

    await Item.insertMany(itemData);
    console.log(`✅ SUCCESS: ${itemData.length} Items Seeded`);

    console.log("⚔️ DATABASE READY!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seed Failed", err);
    process.exit(1);
  });