/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth/auth.controller')
const PasswordResetsController = () => import('#controllers/auth/password_reset.controller')

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
        router
          .get('/profile', [AuthController, 'profile'])
          .use([middleware.auth(), middleware.verifyEmail()])
        router
          .post('/logout', [AuthController, 'logout'])
          .use([middleware.auth(), middleware.verifyEmail()])

        router.get('/verify/email/:token', [AuthController, 'verify']).use(middleware.auth())
        router.post('/verify/email/request', [AuthController, 'request']).use(middleware.auth())

        router.post('/password/forgot', [PasswordResetsController, 'forgot'])
        router.get('/password/reset/:token', [PasswordResetsController, 'verify'])
        router.post('/password/reset', [PasswordResetsController, 'store'])
      })
      .prefix('/auth')
  })
  .prefix('/api/v1')

router.any('*', async ({ response }) => {
  return response.status(401).json({
    status: 'error',
    error: {
      message: 'Route not found',
    },
  })
})
