/*
* Info per particle: position (bezier), position (line), random offset 1/2, factor, 
* Info per line: offset lerpfactor, line lerpfactor, color 1/2, wrap max/min, wrap direction (angle?), size, time
*/


attribute vec3 aLinePosition;
attribute vec3 aSmallOffset;
attribute vec3 aLargeOffset;
attribute float aFactor;

uniform float uOffsetLerpFactor;
uniform float uLineLerpFactor;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uSize;
uniform float uMinSize;
uniform float uWrapMin;
uniform float uWrapMax;
uniform float uWrapAngle;

uniform float uWrapFactor;

varying float vFactor;
varying float vRandom;


float wrapBetween(float value, float min, float max){
        return mod(value-min,max-min)+min;
}

// float random(vec2 st)
// {
//     return fract(sin(dot(st.xy, vec2(12.9898,78.233))+ uTime) * 43758.5453123);
// }


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main(){

        vec3 mixedPosition = mix(position, aLinePosition, uLineLerpFactor);
        vec3 offset = mix(aSmallOffset,aLargeOffset,uOffsetLerpFactor);
        // vec3 offset = mix(aSmallOffset,aLargeOffset,1.0-aFactor);
        vec3 offsetPosition = mixedPosition + offset;

        vec4 modelPosition = modelMatrix * vec4(offsetPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;
        gl_PointSize = max(uSize,uMinSize);
        
        gl_PointSize *= (1.0 / - viewPosition.z);
        // gl_Position.x -= 0.001 * uTime ;//* 1000.0;


        vec4 wrappedHorizontal = vec4(gl_Position.x,wrapBetween(gl_Position.y,uWrapMin, uWrapMax),gl_Position.zw);
        vec4 wrappedVertical = vec4(wrapBetween(gl_Position.x,uWrapMin, uWrapMax),gl_Position.yzw);

        gl_Position = mix(gl_Position,mix(wrappedHorizontal,wrappedVertical,uWrapAngle),uWrapFactor);
        

        vFactor = aFactor;
        vRandom = random(projectedPosition.xy + sin(uTime * 0.0001));


        
}