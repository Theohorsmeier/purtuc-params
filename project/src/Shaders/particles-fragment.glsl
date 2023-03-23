uniform vec3 uColor1;
uniform vec3 uColor2;
varying float vFactor;
varying float vRandom;




void main(){

    float isColor1 = step(vFactor, vRandom);
    float isColor2 = step(vFactor, 1.0 - vRandom);

    gl_FragColor = isColor1 * vec4(uColor1,1.0) + isColor2 * vec4(uColor2,1.0) ;


    // gl_FragColor = vec4(0.0,0.0,0.0,1.0) ;
}