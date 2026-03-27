import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { resolvers } from './resolvers.js'
import { seedIfEmpty } from './seed.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8')

const schema = createSchema({ typeDefs, resolvers })

const yoga = createYoga({ schema, graphqlEndpoint: '/graphql' , logging: true })

const server = createServer(yoga)

async function main() {
    await seedIfEmpty()
    server.listen(4000, () => {
        console.log('Server is running on http://localhost:4000/graphql')
    })
}

main().catch
(error => {
    console.error('Error starting the server:', error)
    process.exit(1)
})


