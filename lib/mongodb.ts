const { MongoClient } = require('mongodb')

const username = encodeURIComponent('daybreakashe_db_user')
const password = encodeURIComponent('Huang190730@')
const cluster = 'cluster0'
const authSource = 'comments'
const authMechanism = 'SCRAM-SHA-1'

let uri = `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`

const client = new MongoClient(uri)

async function run() {
  try {
    await client.connect()

    const database = client.db('daybreakashe_db')
    const users = database.collection('users')

    const cursor = users.find()

    console.log('cursor###', cursor)

    await cursor.forEach((doc: any) => console.dir(doc))
  } finally {
    await client.close()
  }
}
run().catch(console.dir)
