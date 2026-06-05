const sequelize = require('./App/Connection/db.config');

async function migrate() {
  try {
    console.log("Starting migration...");
    await sequelize.query('ALTER TABLE schedules ADD COLUMN generated_content TEXT;');
    await sequelize.query('ALTER TABLE schedules ADD COLUMN image_url VARCHAR(500);');
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    process.exit(0);
  }
}

migrate();
