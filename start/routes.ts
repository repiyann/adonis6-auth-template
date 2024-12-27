/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth.controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async ({ response }) => {
  return response.json({
    message: 'This is the first endpoint of the API',
    version: 'v1.0',
  })
})

router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login'])
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
        router.get('/profile', [AuthController, 'profile']).use(middleware.auth())
      })
      .prefix('/auth')
  })
  .prefix('/api/v1')

router.any('*', async ({ response }) => {
  return response.status(401).json({
    status: 'error',
    errors: [
      {
        message: 'Route not found',
      },
    ],
  })
})
