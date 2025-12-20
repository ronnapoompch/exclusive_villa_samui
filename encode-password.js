// URL encode password helper
const password = "R+hLcsK_@4L&tSC";
const encoded = encodeURIComponent(password);
console.log("Encoded password:", encoded);

const dbUrl = `postgresql://postgres:${encoded}@db.apyrnttbxpountnopuoq.supabase.co:5432/postgres`;
console.log("\nFull DATABASE_URL:");
console.log(dbUrl);
