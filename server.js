import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const URL =
  'mongodb+srv://admin:admin12345678@cluster0.lvmuoha.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(URL)

const Database = 'TodoDatabase'

client.connect().then(() => {
  console.log('Connected!')
  app.listen(9000, () => {
    console.log('listening port 9000')
  })
})

app.get('/todos', async (req, res) => {
  res.json(await getTodos())
})

app.post('/addTodo', async (req, res) => {
  const { title, category, description, deadline, color, location } = req.body
  console.log(deadline)
  if (deadline == undefined) {
    const result = await client.db(Database).collection('todos').insertOne({
      title: title,
      category: category,
      description: description,
      color: color,
      location: location,
    })
    return res.json(result)
  } else {
    return res.json(
      addTodo(title, category, description, deadline, color, location)
    )
  }
})

app.get('/categories', async (req, res) => {
  const allCategories = await client
    .db(Database)
    .collection('todos')
    .find()
    .project({ category: 1 })
    .toArray()
  const uniqueCategories = Array.from(
    new Set(allCategories.map((todo) => todo.category))
  )
  res.json(uniqueCategories)
})

app.get('/oneCategory/:category', async (req, res) => {
  const { category } = req.params
  const result = await client
    .db(Database)
    .collection('todos')
    .find({ category: category })
    .toArray()
  return res.json(result)
})

app.get('/colorFromCategory/:category', async (req, res) => {
  const { category } = req.params
  const result = await client
    .db(Database)
    .collection('todos')
    .find({ category: category })
    .project({ color: 1, _id: 0 })
    .toArray()
  return res.json(result)
})

async function addTodo(
  title,
  category,
  description,
  deadline,
  color,
  location
) {
  const result = await client.db(Database).collection('todos').insertOne({
    title: title,
    category: category,
    description: description,
    deadline: deadline,
    color: color,
    location: location,
  })
  return result
}

async function getTodos() {
  const result = await client
    .db(Database)
    .collection('todos')
    .find({})
    .toArray()
  return result
}
