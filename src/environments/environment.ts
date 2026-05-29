const port: string = '8000'
const host: string = 'localhost'

export const environment = {
  production: false,
  githubRawAboutUrl: 'https://raw.githubusercontent.com/umunevich/visual-odometry/main/ABOUT.md',
  voBackendWsUrl: `ws://${host}:${port}/ws`,
  voBackendApiUrl: `http://${host}:${port}/api`
};

