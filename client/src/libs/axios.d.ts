// Minimal declaration for the JS axios wrapper used in the project.
// This silences TypeScript "Could not find a declaration file" errors.
declare module "../libs/axios" {
  const axios: any;
  export default axios;
}
