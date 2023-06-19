// ensure .env is merged with process.env
require('dotenv').config()
const path = require('path')
const jwt = require('jsonwebtoken')

const getIndexedArgPlusOne = (args, index) => index === -1 ? null : args[index+1]
const getNamedArg = (args, name) => getIndexedArgPlusOne(args, args.indexOf(name))

/** Parse commandline and echo a JWT token to stdout */
const main = () => {
    const sharedSecret = process.env.JWT_SHARED_SECRET

    if (!sharedSecret) {
        console.error('Environment variable JWT_SHARED_SECRET is missing. Aborting.')
        process.exit(1)
    }

    const id = getNamedArg(process.argv, '--id')
    if (!id) {
        console.log(`Usage: node ${path.basename(__filename)} --id <person to impersonate>`)
        process.exit(2)
    }
    const token = jwt.sign({id}, sharedSecret)
    console.log(token)
}

main()