export function createEventHandlers (events, logger) {
  return {
  createUser: (message) => logger.info(message),
  linkAccount: (message) => logger.info(message),
  session: (message) => {
    console.log("session event")
    logger.info(message)
    }
    ,
  signIn: (message) => null,
  signOut: (message) => logger.info(message),
  updateUser: (message) => logger.info(message)
};
}