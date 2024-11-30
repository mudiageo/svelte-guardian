export function createLogger () {
  return{
    info : (info, log) => {
      console.log(info)
      console.log(log)
    }
  }
}


export interface LoggerConfig {
  loggger: string
}