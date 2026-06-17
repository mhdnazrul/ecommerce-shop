export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger')
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', {}, reason)
    })
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {}, error)
    })
  }
}
