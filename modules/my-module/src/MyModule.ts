import { NativeModule, requireNativeModule } from 'expo';

// import { MyModuleEvents } from './MyModule.types';
 type MyModuleEvents = {
  onGyroscopeChange: (params: GyroscopeEvent) => void;
};
export type GyroscopeEvent  = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}
declare class MyModule extends NativeModule<MyModuleEvents> {
  PI: number;
  SENSOR_DELAY_NORMAL:string;
  SENSOR_DELAY_UI: string;
  SENSOR_DELAY_GAME:string;
  SENSOR_DELAY_FASTEST:string;
  //hello(): string;
  startGyroscope(): Promise<null>;
  stopGyroscope(): Promise<null>;
  isGyroscopeAvailable():boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyModule>('MyModule');

// clean up
// permission
//rate