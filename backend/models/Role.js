import dbPool from '../db.js';

class Role {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }

  static async findOne(id) {
    const result = await dbPool.query(
      'SELECT * FROM roles WHERE id = $1 LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return new Role(result.rows[0]);
  }

 static async findAll() {
    const result = await dbPool.query(
      'SELECT id,name FROM roles'
    );
    return result.rows;
  }
}

export default Role;