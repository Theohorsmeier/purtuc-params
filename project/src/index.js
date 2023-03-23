import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as helper from "@liamegan1/fxhash-helpers"
import vertex from './Shaders/particles-vertex.glsl'
import fragment from './Shaders/particles-fragment.glsl'

/**
 * Palettes
 */
const palettes = [  
  {    
    name: "Kerk",
    colors: [ 0xaaaaaa, 0x0059ff, 0xff5000, 0xffffff, 0x000000 ]
  },
  {    
    name: "Findus",
    colors: [0x49270b, 0xf7e0c0, 0xa57439, 0xb1e8ed, 0xbb6937]
  },
  {    
    name: "Bos",
    colors: [0xf6e756, 0xc0da39, 0x528504, 0xf75608, 0x6a530f]
  },
  {    
    name: "HuKerk",
    colors: [0xf2e3c6, 0x655139, 0x1bb8fb, 0xff513e, 0xbcd728]
  },
  {    
    name: "Paars",
    colors: [0x7659ab, 0xc755c4, 0xff6e73, 0xfe734a, 0xffc245]
  },
  {    
    name: "Koffie",
    colors: [0x4bb18f, 0xc5342f, 0xd9c8a7, 0x3d230d, 0x93bfa4]
  },
  {
    name: "Zondag",
    colors: [ 0xaaaaaa, 0x00ffea, 0xce00ff, 0xffffff, 0x000000 ]
  },
  {
    name: "Ontvreemd",
    colors: [ 0x00adff, 0xff001a, 0xaaaaaa, 0xffffff, 0x000000 ]
  },
  {
    name: "Analogous",
    colors: [ 0xFFC300, 0xFF5733, 0xC70039, 0x900C3F, 0x581845 ]
  },
  {
    name: "Complementary",
    colors: [ 0xFF4136, 0x0074D9, 0xFFDC00, 0x001f3f, 0x3D9970 ]
  },
  {
    name: "Monochromatic",
    colors: [ 0xF7F7F7, 0xD9D9D9, 0xA7A7A7, 0x737373, 0x404040 ]
  }
];

const paletteNames = palettes.map(p => p.name)
const rotation_axes = ['x','y','z','none']

$fx.params([
  {
    id: "particleCount",
    name: "Particles per Curve ⚠",
    type: "number",
    default: 10000,
    options: { min: 1000,max: 10000,step: 1000 },
  },
  {
    id: "particleSize",
    name: "ParticleSize",
    type: "number",
    default: 30,
    options: { min: 1,max: 100,step: 1 },
  },
  {
    id: "curveCount",
    name: "Curves",
    type: "number",
    default: 100,
    options: { min: 20,max: 200,step: 1 },
  },
  {
    id: "wrapMinStart",
    name: "wrapMinStart",
    type: "number",
    default: 0,
    options: { min: -20,max: 20,step: 0.1 },
  },
  {
    id: "wrapMinEnd",
    name: "wrapMinEnd",
    type: "number",
    default: 0,
    options: { min: -20,max: 20,step: 0.1 },
  },
  {
    id: "wrapMaxStart",
    name: "wrapMaxStart",
    type: "number",
    default: 10,
    options: { min: -20,max: 50,step: 0.1 },
  },
  {
    id: "wrapMaxEnd",
    name: "wrapMaxEnd",
    type: "number",
    default: 20,
    options: { min: -20,max: 50,step: 0.1 },
  },
  {
    id: "wrapFactor",
    name: "wrapFactor",
    type: "number",
    default: 1.0,
    options: { min: 0.0,max: 1.0,step: 0.01 },
  },
  {
    id: "lineFactor",
    name: "lineFactor",
    type: "number",
    default: 1.0,
    options: { min: 0.0,max: 1.0,step: 0.01 },
  },
  {
    id: "spreadFactor",
    name: "spread",
    type: "number",
    default: 1.0,
    options: { min: 0.0,max: 1.0,step: 0.01 },
  },
  {
    id: "rotationFactor",
    name: "rotationFactor",
    type: "number",
    default: 1.0,
    options: { min: 0.01,max: 5.0,step: 0.01 },
  },
  {
    id: "palette_id",
    name: "Palette",
    type: "select",
    options: {
      options: paletteNames,
    }
  },
  {
    id: "axis_id",
    name: "Rotation_axis",
    type: "select",
    options: {
      options: rotation_axes,
    }
  },

  {
    id: "shuffle",
    name: "Shuffle palette",
    type: "boolean",
    default: true
  },
])



$fx.features({
  "Palette": $fx.getParam("palette_id"),
})

/**
 * Other Parameters for scene
 */

console.log($fx.getParams())

const particleSmallSpread = 0.1
const particleLargeSpread = 5
const bezierRadius = 10
const bezierControlRadius = 10
const particleSmallPower = 5
const particleLargePower = 1.6

const wrapMinStart = $fx.getParam("wrapMinStart")            
const wrapMinEnd   = $fx.getParam("wrapMinEnd")          
const wrapMaxStart = $fx.getParam("wrapMaxStart")            
const wrapMaxEnd   = $fx.getParam("wrapMaxEnd")          

const offsetLerpFactor = $fx.getParam("spreadFactor")
const lineLerpFactor = $fx.getParam("lineFactor")

/**
 * Start end, and control points for bezier
 */

const bezierStartQuadrant = [
  helper.FXRandomBool(0.5),
  helper.FXRandomBool(0.5),
  helper.FXRandomBool(0.5)
]

const bezierEndQuadrant = [
    !bezierStartQuadrant[0],
    !bezierStartQuadrant[1],
    !bezierStartQuadrant[2]
]

const bezierStartPoint = [
    (bezierStartQuadrant[0] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
    (bezierStartQuadrant[1] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
    (bezierStartQuadrant[2] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
]

const bezierEndPoint = [
    (bezierEndQuadrant[0] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
    (bezierEndQuadrant[1] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
    (bezierEndQuadrant[2] ? 1 : -1 ) * helper.FXRandomBetween(0,1) * bezierRadius,
]

const bezierControl1 = [
    helper.FXRandomBetween(-1,1) * bezierControlRadius,
    helper.FXRandomBetween(-1,1) * bezierControlRadius,
    helper.FXRandomBetween(-1,1) * bezierControlRadius
]

const bezierControl2 = [
    helper.FXRandomBetween(-1,1) * bezierControlRadius,
    helper.FXRandomBetween(-1,1) * bezierControlRadius,
    helper.FXRandomBetween(-1,1) * bezierControlRadius
]

/**
 * Arrays for point info
 */

const palette_index = paletteNames.indexOf($fx.getParam("palette_id"))

const palettePick = palettes[palette_index].colors


const shuffledPalette = [...palettePick].sort((a, b) => 0.5 - fxrand())

const palette = $fx.getParam("shuffle") ? shuffledPalette : palettePick

const wrapMin = []
const wrapMax = []
const color1 = []
const color2 = []

const wrapAngle = []



const wrapBool = helper.FXRandomBool(0.5)
const curveCount = $fx.getParam("curveCount")

const countPerCurve = $fx.getParam("particleCount")


for (let index = 0; index < curveCount; index++) {
  if (index < curveCount / 4){
      wrapMin[index] = wrapMinStart + (wrapMinEnd-wrapMinStart)*(index/curveCount)
      wrapMax[index] = wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*(index/curveCount)
      color1[index] =  new THREE.Color( palette[1] )
      color2[index] =  new THREE.Color( palette[2] )
      wrapAngle[index] = 1.0 * wrapBool
      
  } else if(index < 2 * curveCount / 4) {
      wrapMin[index] = -1 * (wrapMinStart + (wrapMinEnd-wrapMinStart)*((index-curveCount/4)/curveCount))
      wrapMax[index] = -1 * (wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index-curveCount/4)/curveCount))
      color1[index] = new THREE.Color( palette[3] )
      color2[index] = new THREE.Color( palette[1] )
      wrapAngle[index] = 1.0 * wrapBool
  } else if (index < 3 * curveCount / 4){
      wrapMin[index] = wrapMinStart + (wrapMinEnd-wrapMinStart)*((index - curveCount/2)/curveCount)
      wrapMax[index] = wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index - curveCount/2)/curveCount)
      color1[index] = new THREE.Color( palette[4] )
      color2[index] = new THREE.Color( palette[2] )
      wrapAngle[index] = -1.0 * wrapBool
      
  } else  {
      wrapMin[index] = -1 * (wrapMinStart + (wrapMinEnd-wrapMinStart)*((index-3 * curveCount/4)/curveCount))
      wrapMax[index] = -1 * (wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index-3 * curveCount/4)/curveCount))
      color1[index] = new THREE.Color( palette[3] )
      color2[index] = new THREE.Color( palette[4] )
      wrapAngle[index] = -1.0 * wrapBool
  }
}

/**
 * Offsets
 */
const randomVecMiddle = (mul = 1) => 
{
  return [
    mul * helper.FXRandomBetween(-1,1),
    mul * helper.FXRandomBetween(-1,1),
    mul * helper.FXRandomBetween(-1,1)
  ]
}

const offsets = [
  randomVecMiddle(),
  randomVecMiddle(),
  randomVecMiddle(0.01),
  randomVecMiddle(0.01)
]

const linePoint = (start,end,factor) => 
{
  let vector = new THREE.Vector3()
        
  return vector.lerpVectors(start, end, factor)
}

const particlePointSpray = ( factor , spread, power) =>
{
    
    const s = helper.FXRandomBetween(0,2*Math.PI)
    const t = helper.FXRandomBetween(0,Math.PI)
    const radius = spread *  Math.pow(helper.FXRandomBetween(0,1),power)

    const spray = new THREE.Vector3(
        radius * Math.cos(s) * Math.sin(t) ,
        radius * Math.sin(s) * Math.sin(t),
        radius * Math.cos(t) 
    )

    return spray
}

const center = new THREE.Vector3()

const pointsArray = []
const bezierPoints = []
const starts = []
const ends = []




const generateBezierPoints = (i) => {
  starts[i] = new THREE.Vector3(
    bezierStartPoint[0] + i * offsets[0][0],
    bezierStartPoint[1] + i * offsets[0][1],
    bezierStartPoint[2] + i * offsets[0][2]
  )



  ends[i] = new THREE.Vector3(
    bezierEndPoint[0] + i * offsets[1][0],
    bezierEndPoint[1] + i * offsets[1][1],
    bezierEndPoint[2] + i * offsets[1][2]
  )

  const bezierCurve = new THREE.CubicBezierCurve3(
    starts[i],
    new THREE.Vector3(
      bezierControl1[0] + i * offsets[2][0],
      bezierControl1[1] + i * offsets[2][1],
      bezierControl1[2] + i * offsets[2][2]
    ),

    new THREE.Vector3(
      bezierControl2[0] + i * offsets[3][0],
      bezierControl2[1] + i * offsets[3][1],
      bezierControl2[2] + i * offsets[3][2]
    ),
    ends[i]
  )

  bezierPoints[i] = bezierCurve.getPoints( countPerCurve )

}
const generateParticles = (index) => {
  const bezierPositions = new Float32Array(countPerCurve * 3)
  const linePositions = new Float32Array(countPerCurve * 3)
  const smallOffsets = new Float32Array(countPerCurve * 3)
  const largeOffsets = new Float32Array(countPerCurve * 3)
  const factors = new Float32Array(countPerCurve * 1)



  const geometry = new THREE.BufferGeometry()
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms:
    {
        uSize: { value: $fx.getParam("particleSize")  },
        uTime: {value: 0},
        uWrapMin: {value: wrapMin[index]},
        uWrapMax: {value: wrapMax[index]},
        uWrapAngle: {value: wrapAngle[index]},
        uWrapFactor:  {value: $fx.getParam("wrapFactor")},
        uColor1: {value: color1[index]},
        uColor2: {value: color2[index]},
        uOffsetLerpFactor: {value: offsetLerpFactor},
        uLineLerpFactor: {value: lineLerpFactor},
        
    },
    depthWrite: false,
    // blending: THREE.AdditiveBlending,
    vertexColors: true
  })


  for(let i = 0; i < countPerCurve; i++)
  {
    const i3 = i * 3
    const factor = i / countPerCurve


    factors[i] = factor
    const bPoints =     bezierPoints[index]
    const bezierPoint = bPoints[i]

    const line =        linePoint(starts[index],ends[index], factor)
    const spraySmall =  particlePointSpray( factor, particleSmallSpread,particleSmallPower )
    const sprayLarge =  particlePointSpray( factor, particleLargeSpread,particleLargePower )

    bezierPositions[i3    ] = bezierPoint.x
    bezierPositions[i3 + 1] = bezierPoint.y
    bezierPositions[i3 + 2] = bezierPoint.z
      
    linePositions[i3    ] = line.x
    linePositions[i3 + 1] = line.y
    linePositions[i3 + 2] = line.z
      
    smallOffsets[i3    ] = spraySmall.x
    smallOffsets[i3 + 1] = spraySmall.y
    smallOffsets[i3 + 2] = spraySmall.z
    
    largeOffsets[i3    ] = sprayLarge.x
    largeOffsets[i3 + 1] = sprayLarge.y
    largeOffsets[i3 + 2] = sprayLarge.z

  }

        

        geometry.setAttribute('position', new THREE.BufferAttribute(bezierPositions, 3))
        geometry.setAttribute('aFactor', new THREE.BufferAttribute(factors, 1))
        geometry.setAttribute('aLinePosition', new THREE.BufferAttribute(linePositions, 3))
        geometry.setAttribute('aSmallOffset', new THREE.BufferAttribute(smallOffsets, 3))
        geometry.setAttribute('aLargeOffset', new THREE.BufferAttribute(largeOffsets, 3))
  

        const points = new THREE.Points(geometry, material)
        pointsArray.push(points)
        scene.add(points)
}





/**
 * Setup the scene
*/


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color( palette[0] )



for (let i = 0; i < $fx.getParam("curveCount"); i++) {

  generateBezierPoints(i)
  generateParticles(i)

  pointsArray[i].geometry.computeBoundingSphere()
  const centerLoc = pointsArray[i].geometry.boundingSphere.center
  center.addScaledVector(centerLoc,1/$fx.getParam("curveCount"))
}


/**
 * Sizes, Camera, Render
 */
const sizes = {
  width       : window.innerWidth,
  height      : window.innerHeight,
  pixelRatio : Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const camera = new THREE.PerspectiveCamera(
  30, 
  sizes.width / sizes.height, 
  0.1, 
  1000
)

camera.position.set(50, 50, 50)
camera.lookAt(new THREE.Vector3(0,0,0))
scene.add(camera)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.2 * ( helper.FXRandomBool ? 1 : -1)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animation
 */
const clock = new THREE.Clock()


const rotationSpeed = 0.0001 * ( helper.FXRandomBool()?1:-1) * $fx.getParam("rotationFactor")
const axis_id = $fx.getParam("axis_id")





const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if( axis_id !== "none"){
      for (let i = 0; i < curveCount; i++) {
        pointsArray[i].rotation[axis_id] += rotationSpeed * i 
        pointsArray[i].material.uniforms.uTime = elapsedTime
      }
    }


    controls.update()
    renderer.render(scene, camera)
    if ($fx.isPreview) {
      $fx.preview()
    } else {
      window.requestAnimationFrame(tick)
    }
    
}

tick()

