import { NativeModule, requireNativeModule } from 'expo';

// import { MyModuleEvents } from './MyModule.types';
 type MyModuleEvents = {
  onOrientationChange: (params: SensorEvent) => void;
};
export type SensorEvent  = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}
declare class MyModule extends NativeModule<MyModuleEvents> {
  // SENSOR_DELAY_NORMAL:string;
  // SENSOR_DELAY_UI: string;
  // SENSOR_DELAY_GAME:string;
  // SENSOR_DELAY_FASTEST:string;
  //hello(): string;
  startGravitySensor(): Promise<null>;
  stopGravitySensor(): Promise<null>;
  isOrientationAvailable():boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyModule>('MyModule');

// clean up
// permission
//rate