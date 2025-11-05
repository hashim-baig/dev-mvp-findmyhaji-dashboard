import dbPool from '../db.js';

class Menu {
  constructor({ id, name, role_id, list_permission, add_permission, update_permission, delete_permission, order_by }) {
    this.id = id;
    this.name = name;
    this.role_id = role_id;
    this.add_permission = add_permission;
    this.list_permission = list_permission;
    this.update_permission = update_permission;
    this.delete_permission = delete_permission;
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
  static async checkMenuForRole(role_id) {
    const values = [role_id];
    const query = 'SELECT id,name,list_permission, add_permission, update_permission, delete_permission FROM menus WHERE role_id = $1 order by order_by';
    const result = await dbPool.query(query, values);
    return result.rows;
  }
  static async findAll(role_id) {
    const values = [role_id];
    const query = 'SELECT id,name,list_permission, add_permission, update_permission, delete_permission FROM menus WHERE role_id = $1 order by order_by';
    const result = await dbPool.query(query, values);
    return result.rows;
  }
  static async deleteMenuPermission(role_id) {
    const query = 'DELETE FROM menus WHERE role_id = $1';
    const values = [role_id];
    await dbPool.query(query, values);
    return true;
  }
  static async save(parsedData,role_id){
    let order_by = 1;
    // Insert each item in `data`
    const insertQuery = `
      INSERT INTO menus (name, role_id, list_permission, add_permission, update_permission, delete_permission, order_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const results = [];

    for (const item of parsedData.data) {
      const values = [
        item.name,
        role_id,
        item.list_permission,
        item.add_permission,
        item.update_permission,
        item.delete_permission,
        order_by
      ];
      order_by++;
      const result = await dbPool.query(insertQuery, values);
      results.push(result.rows[0]);
    }
    return results.length > 0 ? results.length : null;
  }

}

export default Menu;