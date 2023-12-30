export interface IFrogcordAPI {
  sayHello: () => void;
}

declare global {
  interface Window {
    frogcordAPI: IFrogcordAPI;
  }
}
