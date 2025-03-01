import React, { useImperativeHandle, useState } from 'react'
import {  StyleSheet, View } from 'react-native'
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
    componentA:React.ReactNode;
    componentB:React.ReactNode;
    controlRef:  React.RefObject<AnimatedSwapHandlerRef>;
}
export const AnimatedSwapHandler = ({
    componentA,
    componentB,
    controlRef,
}:Props) => {
    //state
    const [show,setShow] = useState<boolean>(false);
    //hooks
    useImperativeHandle(controlRef, ()=>({
        swap: () => setShow(p => !p),
        hide: () => setShow(false),
        show: () => setShow(true),
    }))
    //jsx
  return (
    <View style={StyleSheet.absoluteFill}>
        {componentA}
       {show && (
        <Animated.View
        style={StyleSheet.absoluteFill}
        entering={FadeIn
            .duration(300)
            .easing(Easing.inOut(Easing.quad))}
        exiting={FadeOut
            .duration(300)
            .easing(Easing.inOut(Easing.quad))
       }
        >
            {componentB}
        </Animated.View>)}
    </View>
  )
}
export type AnimatedSwapHandlerRef = {
    swap: () => void;
    show: () => void;
    hide: () => void;
}