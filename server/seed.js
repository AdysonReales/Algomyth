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
          description: "Write a program that takes an array of integers as input and returns the sum of all its elements.",
          constraints: ["OP:+", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: The Divisor Check", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 50, xp: 100 },
        phases: [{
          questionTitle: "Divisible by 3 and 5",
          description: "Write a program that asks the user to enter a number and tells the user whether the number is divisible by both 3 and 5.",
          constraints: ["OP:%", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Algebraic Compute", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 60, xp: 120 },
        phases: [{
          questionTitle: "Difference and Multiply",
          description: "Ask the user to input three integer values, a, b, and c. Then, print the difference of a and b multiplied by the value of c.",
          constraints: ["OP:-", "OP:*", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Grade Switcher", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 150, xp: 300 },
        phases: [{
          questionTitle: "Switching Grades",
          description: "Ask the user to input a character which represents their grade. Using a switch statement, print the appropriate message (A/B: Good Job, C: Okay, D/F: Study harder, else: Stop lying).",
          constraints: ["TYPE:switch", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Odd While Loop", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 80, xp: 150 },
        phases: [{
          questionTitle: "While Odds",
          description: "Write a program that takes an integer input from the user and prints all the odd numbers between 1 and the given number (inclusive) using a while loop.",
          constraints: ["TYPE:while", "OP:%", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Modulo Assignment", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 50, xp: 100 },
        phases: [{
          questionTitle: "Using %=",
          description: "Write a program that finds the remainder of a variable divided by a certain amount using the %= operator.",
          constraints: ["OP:%=", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Test Scores", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 200, xp: 400 },
        phases: [{
          questionTitle: "Test Scores",
          description: "Write a program that reads in 5 test scores and outputs the average score in two decimal places and corresponding letter grade.",
          constraints: ["TYPE:if", "OP:/", "PRINT"],
          starterCode: `#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Pascal's Triangle", difficulty: "Boss", requiredStreak: 1, source: "daily", reward: { gold: 250, xp: 500 },
        phases: [{
          questionTitle: "For Loop Triangle",
          description: "Write a program that asks the user for a positive integer, n, and then prints the first n rows of Pascal's triangle.",
          constraints: ["TYPE:for", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Nested Multiplication", difficulty: "Medium", requiredStreak: 1, source: "daily", reward: { gold: 100, xp: 200 },
        phases: [{
          questionTitle: "Nested Loops",
          description: "Create a program that takes an integer n and prints the multiplication table of n up to n x n.",
          constraints: ["TYPE:for", "OP:*", "PRINT"],
          starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      },
      {
        nodeTitle: "Daily: Echo String", difficulty: "Easy", requiredStreak: 1, source: "daily", reward: { gold: 30, xp: 60 },
        phases: [{
          questionTitle: "String Display",
          description: "Write a program to take a string as input from the user and display it on the screen.",
          constraints: ["TYPE:string", "PRINT"],
          starterCode: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n  // Code here\n  return 0;\n}`
        }]
      }
    ];

    const shopQuests = [
      {
        _id: shopIds[0], nodeTitle: "Bounty: While Loop Table", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 300, xp: 500 },
        phases: [{ questionTitle: "Multiplication Table", description: "Multiplication table using a while loop.", constraints: ["TYPE:while", "OP:*", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[1], nodeTitle: "Bounty: Array Sum", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 300, xp: 500 },
        phases: [{ questionTitle: "Index Access", description: "Prints the sum of all elements in an array.", constraints: ["OP:+", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[2], nodeTitle: "Bounty: Tabbed Output", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 200, xp: 400 },
        phases: [{ questionTitle: "Format String", description: "Print string in staggered tab format.", constraints: ["TYPE:string", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[3], nodeTitle: "Bounty: Day Switcher", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 500, xp: 800 },
        phases: [{ questionTitle: "Switch Statement", description: "Convert number 1-7 to day of the week.", constraints: ["TYPE:switch", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[4], nodeTitle: "Bounty: Cylinder Volume", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 600, xp: 1000 },
        phases: [{ questionTitle: "Geometry Compute", description: "Compute cylinder volume from radius and height.", constraints: ["OP:*", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[5], nodeTitle: "Bounty: Currency Converter", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 550, xp: 900 },
        phases: [{ questionTitle: "USD Conversion", description: "Convert USD to another currency.", constraints: ["TYPE:double", "OP:*", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[6], nodeTitle: "Bounty: Square Root", difficulty: "Medium", requiredStreak: 1, source: "shop", reward: { gold: 350, xp: 600 },
        phases: [{ questionTitle: "Math Functions", description: "Output square root of a positive integer.", constraints: ["PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[7], nodeTitle: "Bounty: BMI Calculator", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 700, xp: 1200 },
        phases: [{ questionTitle: "If-Else Categories", description: "Calculate BMI and output category.", constraints: ["TYPE:if", "OP:/", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[8], nodeTitle: "Bounty: Even Digits Sum", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 650, xp: 1100 },
        phases: [{ questionTitle: "For Loop Sum", description: "Sum even digits in n using a for loop.", constraints: ["TYPE:for", "OP:%", "PRINT"], starterCode: `// Code here` }]
      },
      {
        _id: shopIds[9], nodeTitle: "Bounty: Leap Years", difficulty: "Boss", requiredStreak: 1, source: "shop", reward: { gold: 800, xp: 1500 },
        phases: [{ questionTitle: "For Loop Timeline", description: "Print all leap years between input and 2020.", constraints: ["TYPE:for", "PRINT"], starterCode: `// Code here` }]
      }
    ];

    const cppCampaign = [
      { nodeTitle: "Whispering Gate", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 10, xp: 50 }, phases: [{ questionTitle: "Say the Greeting", description: 'Print "Hello Traveler" using cout.', constraints: ["PRINT:Hello Traveler"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  // print Hello Traveler\n  return 0;\n}` }] },
      { nodeTitle: "Crystal Arch", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 12, xp: 55 }, phases: [{ questionTitle: "Echo the Call", description: 'Print "I am here".', constraints: ["PRINT:I am here"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Mossy Door", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 15, xp: 60 }, phases: [{ questionTitle: "Ancient Greeting", description: 'Print "Greetings".', constraints: ["PRINT:Greetings"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Iron Keyhole", difficulty: "Easy", requiredStreak: 1, source: "solo", reward: { gold: 18, xp: 70 }, phases: [{ questionTitle: "Unlock the Phrase", description: 'Print "Open Sesame".', constraints: ["PRINT:Open Sesame"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}` }] },
      { nodeTitle: "Alchemist Lab", difficulty: "Medium", requiredStreak: 2, source: "solo", reward: { gold: 120, xp: 250 }, phases: [{ questionTitle: "Potion Mix", description: `int red = 12, blue = 8. Create int purple = red + blue. Print purple.`, constraints: ["VAR:red", "VAR:blue", "VAR:purple", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\nint red = 12;\nint blue = 8;\nreturn 0;\n}` }, { questionTitle: "Temperature Rise", description: `double temp = 98.5. Add 1.5. Print result`, constraints: ["VAR:temp", "NUM:1.5", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\ndouble temp = 98.5;\nreturn 0;\n}` }] },
      { nodeTitle: "Clockwork Tower", difficulty: "Medium", requiredStreak: 2, source: "solo", reward: { gold: 150, xp: 300 }, phases: [{ questionTitle: "Gear Alignment", description: `int gears = 3. Add 4. Print result`, constraints: ["VAR:gears", "NUM:4", "OP:+", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\nint gears = 3;\nreturn 0;\n}` }] },
      { nodeTitle: "Syntax Sentinel", difficulty: "Boss", requiredStreak: 3, source: "solo", reward: { gold: 500, xp: 1000 }, phases: [{ questionTitle: "Access Control", description: `Create bool access_granted = true. Print it.`, constraints: ["TYPE:bool", "VAR:access_granted", "VALUE:true", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\nreturn 0;\n}` }, { questionTitle: "Key Override", description: `char key = 'A'. Change to 'Z'. Print key`, constraints: ["TYPE:char", "VAR:key", "VALUE:'Z'", "PRINT"], starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\nchar key = 'A';\nreturn 0;\n}` }] }
    ];

    await TaskPool.insertMany([...cppCampaign, ...dailyQuests, ...shopQuests]);
    console.log("✅ Task Pool and Bounties Seeded");

    /* =================================================
        4. ITEMS: PETS, WINGS, ARMOR, CONSUMABLES, SCROLLS
    ================================================= */
    
    const itemData = [
      // Flyte
      ...['Black', 'Blue', 'Cool', 'Green', 'Pink', 'Rainbow', 'Red', 'Spicy', 'Yellow'].map(v => ({ name: `Flyte (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Flyte', variant: v, image: `/src/assets/accessory/Flyte/${v}.png` })),
      // Gryfon
      ...['Black', 'Brown', 'Gray', 'Green', 'Rainbow', 'Red', 'Spicy', 'White'].map(v => ({ name: `Gryfon (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Gryfon', variant: v, image: `/src/assets/accessory/Gryfon/${v}.png` })),
      // Igalyph
      ...['Black', 'Cool', 'Neutral', 'Rainbow', 'Spicy', 'White'].map(v => ({ name: `Igalyph (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Igalyph', variant: v, image: `/src/assets/accessory/Igalyph/${v}.png` })),
      // Laguna
      ...['Orange', 'Pink', 'Purple', 'Rainbow', 'Red', 'White'].map(v => ({ name: `Laguna (${v})`, category: 'Accessory', price: v === 'Rainbow' ? 7500 : 4000, folder: 'Laguna', variant: v, image: `/src/assets/accessory/Laguna/${v}.png` })),
      // Nimblithe
      ...['Black', 'Blue', 'Brown', 'Rainbow', 'White'].map(v => ({ name: `Nimblithe (${v})`, category: 'Accessory', price: v === 'Rainbow' ? 7500 : 4000, folder: 'Nimblithe', variant: v, image: `/src/assets/accessory/Nimblithe/${v}.png` })),
      // Wolfren
      ...['Brown', 'Cool', 'Neutral', 'Pink', 'Rainbow', 'Red', 'Sketchy', 'Spicy'].map(v => ({ name: `Wolfren (${v})`, category: 'Accessory', price: (v === 'Rainbow' || v === 'Spicy') ? 7500 : 4000, folder: 'Wolfren', variant: v, image: `/src/assets/accessory/Wolfren/${v}.png` })),
      // Body (Wings)
      ...['Aqua', 'Black', 'BPshift', 'BGshift', 'CBlue', 'Dgreen', 'DWshift', 'Gshift', 'Purple', 'SBlue', 'SWhite', 'Wshift'].map(v => ({ name: `${v.replace('shift', ' Shift')} Wings`, category: 'Body', price: v.includes('shift') ? 4500 : 3000, variant: v, image: `/src/assets/body/${v}.png` })),
      // Armor (Head)
      ...['knight', 'mage', 'rogue'].flatMap(cls => ['V1', 'V2', 'V3', 'V4', 'V5'].map((v, i) => ({ name: `${cls.charAt(0).toUpperCase() + cls.slice(1)} Armor ${v}`, category: 'Head', price: 1000 + (i * 1000), classReq: cls, variant: `${cls}${v}`, image: `/src/assets/items/${cls}${v}.png` }))),
      // Quest Scrolls
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
    console.log(`✅ SUCCESS: ${itemData.length} Items and Quest Scrolls Seeded`);

    console.log("⚔️ DATABASE READY! HAPPY CODING");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seed Failed", err);
    process.exit(1);
  });