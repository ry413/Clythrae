let local = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('./config.local');
  local = mod && (mod.default || mod);
} catch (e) {
  local = {};
}

const config = {
  baseUrl: '',
  assetBaseUrl: '',
  ...local,
};

export { config };
export default config;
