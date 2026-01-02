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

const postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                error: "Email or password fields cannot be empty"
            })
        }

        const { rows } = await db.query(
            `SELECT email, password FROM users
             WHERE email = $1`,
             [email.toLowerCase()]
        )

        const user = rows[0]

        const DUMMY_HASH = '$2b$12$0yFCIvOyFvaLLI0QG4vpxOdW3WDJ1hg6BoGJgAT65xWJC8L/6B.36'
        const hash = user ? user.password : DUMMY_HASH
        const isMatch = await bcrypt.compare(password, hash)

        if (!user || !isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' })
        }

        res.status(200).json({
            message: 'Logged in successfully',
            user: user.email
        })
    } catch (err) {
        console.error('Login err:', err)
        next(err)
    }
}

module.exports = {
    postRegister,
    postLogin
}