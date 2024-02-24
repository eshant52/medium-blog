import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/signup', (c) => {
  return c.text('bla');
})

app.get('/api/v1/signin', (c) => {
  return c.text('bla');
})

app.post('/api/v1/blog', (c) => {
  return c.text('bla');
})

app.put('/api/v1/blog', (c) => {
  return c.text('bla');
})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('bla');
})


export default app
