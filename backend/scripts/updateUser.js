const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://abdulfatahabdol2003_db_user:Abdol2020@cluster0.b2njjq5.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("dbname"); // 👈 replace

    await db.collection("users").updateOne(
      { email: "abdulfatahabdol2003@gmail.com" },
      {
        $set: {
          telegramChatId: "7116009360",
          telegramUsername:"@Mxterbee",
          isPremium: true,
          premiumUntil: null
        }
      }
    );

    console.log("✅ User updated");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

run();
