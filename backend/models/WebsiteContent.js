import dbPool from '../db.js';

class WebsiteContent {
  constructor({ id, title, subtitle, greeting, p_button_text, s_button_text, page_type, mission, vision }) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.greeting = greeting;
    this.p_button_text = p_button_text;
    this.s_button_text = s_button_text;
    this.page_type = page_type;
    this.mission = mission;
    this.vision = vision;
  }

  static async findOne({ id, page_type }) {
    let whereClause = [];
    let values = [];
    let idx = 1;

    if (id) {
      whereClause.push(`id = $${idx++}`);
      values.push(id);
    }
    if (page_type) {
      whereClause.push(`page_type = $${idx++}`);
      values.push(page_type);
    }

    if (whereClause.length === 0) {
      throw new Error('At least one identifier (id, page_type) must be provided');
    }

    const query = `SELECT title, subtitle, greeting, p_button_text, s_button_text, mission, vision FROM cms WHERE ${whereClause.join(' OR ')} LIMIT 1`;
    const result = await dbPool.query(query, values);

    if (result.rows.length === 0) return null;
    return new WebsiteContent(result.rows[0]);
  }
  static async findOneAndUpdate({contentData}) {
    const client = await dbPool.connect();

    try {
      await client.query('BEGIN');

      // Truncate tables
      await client.query('TRUNCATE cms_pricing_plan, cms_plan_feature, cms RESTART IDENTITY CASCADE');

      // Insert Hero Section
      const hero = contentData.hero;
      await client.query(
        `INSERT INTO cms (title, subtitle, greeting, p_button_text, s_button_text, page_type)
        VALUES ($1, $2, $3, $4, $5, 'hero')`,
        [hero.title, hero.subtitle, hero.content, hero.p_button_text, hero.s_button_text]
      );

      // 3️⃣ Insert About Section
      const about = contentData.about;
      await client.query(
        `INSERT INTO cms (title, subtitle, greeting, p_button_text, s_button_text, page_type)
        VALUES ($1, $2, $3, $4, $5, 'about')`,
        [about.title, about.subtitle, about.content, about.p_button_text, about.s_button_text]
      );

      // 4️⃣ Insert Mission Section
      const mission = contentData.mission;
      await client.query(
        `INSERT INTO cms (title, subtitle, mission, vision, page_type)
        VALUES ($1, $2, $3, $4, 'mission')`,
        [mission.title, mission.subtitle, mission.mission, mission.vision]
      );

      // 5️⃣ Insert Pricing Section
      const pricing = contentData.pricing;
      const pricingResult = await client.query(
        `INSERT INTO cms (title, subtitle, page_type)
        VALUES ($1, $2, 'pricing') RETURNING id`,
        [pricing.title, pricing.subtitle]
      );

      const pricingCmsId = pricingResult.rows[0].id;

      // Insert Plans
      for (const plan of pricing.plans) {
        const planResult = await client.query(
          `INSERT INTO cms_pricing_plan (name, price, period, cms_id)
          VALUES ($1, $2, $3, $4) RETURNING id`,
          [plan.name, plan.price, plan.period, pricingCmsId]
        );

        const planId = planResult.rows[0].id;

        // Insert Features
        for (const feature of plan.features) {
          await client.query(
            `INSERT INTO cms_plan_feature (name, cms_pricing_plan_id)
            VALUES ($1, $2)`,
            [feature, planId]
          );
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error resetting CMS data:', error.message);
      return error;
    } finally {
      client.release();
    }
  }
  static async findAll() {
    const query = `SELECT * FROM cms where page_type != 'pricing'`;
    const result = await dbPool.query(query);
    const result_without_pricing = result.rows.map(row => new WebsiteContent(row)); 
    const result_with_pricing = await this.findAllPricing();
    result_without_pricing.push({page_type: 'pricing', plans: result_with_pricing});
    return result_without_pricing;
  }
  static async findAllPricing() {
    const query = `SELECT 
        c.title,
        c.subtitle,
        cpp.id AS plan_id,
        cpp.name AS plan_name,
        cpp.price,
        cpp.period,
        cpf.name AS feature_name
      FROM cms c
      JOIN cms_pricing_plan cpp ON cpp.cms_id = c.id
      LEFT JOIN cms_plan_feature cpf ON cpp.id = cpf.cms_pricing_plan_id
      WHERE c.page_type = 'pricing'
      ORDER BY cpp.id, cpf.id`;
    const result = await dbPool.query(query);

    const cmsInfo = {
      title: result.rows[0].title,
      subtitle: result.rows[0].subtitle,
      content: { plans: [] }
    };

    const plansMap = {};

    result.rows.forEach(row => {
      if (!plansMap[row.plan_id]) {
        plansMap[row.plan_id] = {
          name: row.plan_name,
          price: row.price,
          period: row.period,
          features: []
        };
      }

      if (row.feature_name) {
        plansMap[row.plan_id].features.push(row.feature_name);
      }
    });

    cmsInfo.content.plans = Object.values(plansMap);

    return cmsInfo;
  }
}
export default WebsiteContent;