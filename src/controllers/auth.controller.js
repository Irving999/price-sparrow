const db = require('../../db')
const bcrypt = require('bcrypt')

const postRegister = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email && !password) {
            return res.status(400).json({
                error: "Email and password fields cannot be empty"
            })
        }

        if (!email) return res.status(400).json({ error: 'Email cannot be empty '})
        if (!password) return res.status(400).json({ error: 'Password cannot be empty '})
        
        if (password.length < 10) return res.status(400).json({error: 'Password must be at least 10 characters long' })

        // Hash password
        const password_hash = await bcrypt.hash(password, 10)

        // Insert user
        const result = await db.query(
            `INSERT INTO users (email, password)
             VALUES ($1, $2)
             RETURNING id, email`, [email, password_hash]
        )

        const newUser = result.rows[0]
        
        res.status(201).json({
            message: 'User successfully created',
            user: {
                email: newUser.email,
            }
        })
    } catch (err) {
        console.error(err)

        // Email already exists (unique constraint violation)
        if (err.code === '23505') {
            return res.status(400).json({
                error: 'Email already in use'
            })
        }
        next(err)
    }
}

module.exports = {
    postRegister
}