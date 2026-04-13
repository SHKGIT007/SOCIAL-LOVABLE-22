const { Subscription, Plan } = require("../app/models");
const sequelize = require("../app/config/db.config");

async function migrate() {
  try {
    const subscriptions = await Subscription.findAll({
      include: [{ model: Plan, as: "Plan" }],
    });

    console.log(`Found ${subscriptions.length} total subscriptions.`);

    for (const sub of subscriptions) {
        console.log(`Checking subscription ${sub.id}: plan_id=${sub.plan_id}, current monthly_posts=${sub.monthly_posts}, current ai_posts=${sub.ai_posts}`);
      if (sub.Plan) {
        await sub.update({
          monthly_posts: sub.Plan.monthly_posts,
          ai_posts: sub.Plan.ai_posts,
          linked_accounts: sub.Plan.linked_accounts,
        });
        console.log(`Updated subscription ${sub.id} with plan ${sub.Plan.name} limits: ${sub.Plan.monthly_posts}, ${sub.Plan.ai_posts}, ${sub.Plan.linked_accounts}`);
      } else {
          console.log(`Subscription ${sub.id} has no associated plan.`);
      }
    }

    console.log("Migration completed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
