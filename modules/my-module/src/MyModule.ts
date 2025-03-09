import { NativeModule, requireNativeModule } from 'expo';

// import { MyModuleEvents } from './MyModule.types';
 type MyModuleEvents = {
  onOrientationChange: (params: SensorEvent) => void;
  onMovementDetected: (params: MovementEvent) => void;
  onStepCountChange: (params: StepEvent) => void;
  onLinearMovementDetected: (params: SensorEvent) => void;
};
export type MovementEvent = {
  distanceX :number;
  distanceY :number;
  distanceZ :number;
  timestamp :number;
}
export type SensorEvent  = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}
export type StepEvent = {
  steps:number;
  timestamp: number;
}
declare class MyModule extends NativeModule<MyModuleEvents> {
  // SENSOR_DELAY_NORMAL:string;
  // SENSOR_DELAY_UI: string;
  // SENSOR_DELAY_GAME:string;
  // SENSOR_DELAY_FASTEST:string;
  //hello(): string;
  startOrientation(): Promise<null>;
  stopOrientation(): Promise<null>;
  isOrientationAvailable():boolean;

  selectionAsync(): Promise<void>;
  warningAsync(): Promise<void>;
  errorAsync(): Promise<void>;
  //cancelVibration(): Promise<null>;
  //hasVibrator(): Promise<null>;
  startMovementDetection(): Promise<void>;
  stopMovementDetection(): Promise<void>;
  isMovementDetectionAvailable(): boolean;

  startStepDetection(): Promise<void>;
  stopStepDetection(): Promise<void>;
  isStepDetectionAvailable(): boolean;
  requestStepPermissions():void;

  startLinearMovementDetection(): Promise<void>;
  stopLinearMovementDetection(): Promise<void>;
  isLinearMovementDetectionAvailable(): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<MyModule>('MyModule');

// clean up
// permission
//rate