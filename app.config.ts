export default ({ config }: {config: any}) => ({
  ...config,
  extra: {
    API_URL: process.env.API_URL || 'http://192.168.1.23:8000/api',
    // ajoute d'autres variables ici si besoin
  },
});