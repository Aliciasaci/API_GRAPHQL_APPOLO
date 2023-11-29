import pool from '../database/db.mjs';

export const resolvers = {
    Query: {
        users: async () => {
            try {
                const result = await pool.query('SELECT * FROM "users"');
                return result.rows;
            } catch (error) {
                console.error('Error querying users:', error);
                throw error; // Rethrow the error for proper handling in your application
            }
        },
    },
};