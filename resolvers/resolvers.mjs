import pool from '../database/db.mjs';

const getFilmsByDirectorId = async (directorId) => {
    try {
        const result = await pool.query('SELECT * FROM "films" WHERE director_id = $1', [directorId]);
        return result.rows;
    } catch (error) {
        console.error('Error querying films by director ID:', error);
        throw error;
    }
};

const getUserById = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM "users" WHERE id = $1', [userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error querying user by ID:', error);
        throw error;
    }
};

export const resolvers = {
    Query: {
        users: async () => {
            try {
                const result = await pool.query('SELECT * FROM "users"');
                return result.rows;
            } catch (error) {
                console.error('Error querying users:', error);
                throw error;
            }
        },
        films: async () => {
            try {
                const result = await pool.query('SELECT * FROM "films"');
                return result.rows;
            } catch (error) {
                console.error('Error querying films:', error);
                throw error;
            }
        },
    },
    User: {
        films: (user) => getFilmsByDirectorId(user.id),
    },
    Film: {
        director: (film) => getUserById(film.director_id),
    },
};
