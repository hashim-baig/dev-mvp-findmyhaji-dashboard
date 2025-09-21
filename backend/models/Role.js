import dbPool from '../db.js';

class Role {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }

  static async findOne({ id, name }) {
    let whereClause = [];
    let values = [];
    let idx = 1;

    if (id) {
      whereClause.push(`id = $${idx++}`);
      values.push(id);
    }
    if (name) {
      whereClause.push(`name = $${idx++}`);
      values.push(name);
    }
    
    if (whereClause.length === 0) {
      throw new Error('At least one identifier (id or name) must be provided');
    }

    const query = `SELECT * FROM roles WHERE ${whereClause.join(' OR ')} LIMIT 1`;
    const result = await dbPool.query(query, values);

    if (result.rows.length === 0) return null;
    return new Role(result.rows[0]);
  }

  static async findAll(search) {
    let whereClause = "WHERE id != 1";
    let values = [];
    if (search) {
      whereClause += ` AND (name ILIKE $1)`;
      values.push(search);
    }
    const result = await dbPool.query(
      `SELECT id,name FROM roles ${whereClause}`, values
    );
    return result.rows;
  }
  static async save({ name }) {
    const query = `
      INSERT INTO roles (name)
      VALUES ($1)
      RETURNING id, name
    `;
    const values = [
      name
    ];
    const result = await dbPool.query(query, values);
    return result.rows[0];
  }
  static async roleExistWithSameName({ name, id }) {
    const query = 'SELECT * FROM roles WHERE name = $1 AND id != $2 LIMIT 1';
    const values = [name, id];
    const result = await dbPool.query(query, values);
    if (result.rows.length === 0) return null;
    return new Role(result.rows[0]);
  }
  static async update({where, updateData}) {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const values = Object.values(updateData);
    values.push(where.id);

    const query = `UPDATE roles SET ${setClause} WHERE id = $${values.length} RETURNING name`;
    const result = await dbPool.query(query, values);
    return result.rows[0];
  }
  static async isRoleAssignedToAnyUser(roleId) {
    const query = 'SELECT id FROM users WHERE role = $1 LIMIT 1';
    const values = [roleId];
    const result = await dbPool.query(query, values);
    return result.rows.length > 0;
  }
  static async deleteOne(id) {
    const query = 'DELETE FROM roles WHERE id = $1';
    const values = [id];
    await dbPool.query(query, values);
    return true;
  }
}

export default Role;