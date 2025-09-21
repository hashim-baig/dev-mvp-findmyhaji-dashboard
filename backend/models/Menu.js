import dbPool from '../db.js';

class Menu {
  constructor({ id, name, role_id, order_by }) {
    this.id = id;
    this.name = name;
    this.role_id = role_id;
    this.order_by = order_by;
  }

  static async findAllMenuSubmenu(role_id) {
    const values = [role_id];
    const query = `
      SELECT 
        m.id as menu_id,
        m.name as menu_name,
        m.order_by,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'route', s.route,
              'icon', s.icon
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as submenus
      FROM menus m
      LEFT JOIN submenus s ON s.menu_id = m.id AND s.role_id = $1 AND s.status = 1
      WHERE m.role_id = $1
      GROUP BY m.id, m.name, m.order_by
      ORDER BY m.order_by;
    `;

    const { rows } = await dbPool.query(query, values);
    return rows;
  }

}

export default Menu;