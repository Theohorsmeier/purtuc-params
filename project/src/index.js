import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as helper from "@liamegan1/fxhash-helpers"

/**
 * Palettes
 */
const palettes = [  
  {    
    name: "Kerk",
    colors: [ "#aaaaaa", "#0059ff", "#ff5000", "#ffffff", "#000000" ]
  },
  {    
    name: "Findus",
    colors: ['#49270b', '#f7e0c0', '#a57439', '#b1e8ed', '#bb6937']
  },
  {    
    name: "Bos",
    colors: ['#f6e756', '#c0da39', '#528504', '#f75608', '#6a530f']
  },
  {    
    name: "HuKerk",
    colors: ['#f2e3c6', '#655139', '#1bb8fb', '#ff513e', '#bcd728']
  },
  {    
    name: "Paars",
    colors: ['#7659ab', '#c755c4', '#ff6e73', '#fe734a', '#ffc245']
  },
  {    
    name: "Koffie",
    colors: ['#4bb18f', '#c5342f', '#d9c8a7', '#3d230d', '#93bfa4']
  },
  {
    name: "Zondag",
    colors: [ "#aaaaaa", "#00ffea", "#ce00ff", "#ffffff", "#000000" ]
  },
  {
    name: "Ontvreemd",
    colors: [ "#00adff", "#ff001a", "#aaaaaa", "#ffffff", "#000000" ]
  },
  {
    name: "Analogous",
    colors: [ "#0xFFC300", "#0xFF5733", "#0xC70039", "#0x900C3F", "#0x581845" ]
  },
  {
    name: "Complementary",
    colors: [ "#0xFF4136", "#0x0074D9", "#0xFFDC00", "#0x001f3f", "#0x3D9970" ]
  },
  {
    name: "Monochromatic",
    colors: [ "#0xF7F7F7", "#0xD9D9D9", "#0xA7A7A7", "#0x737373", "#0x404040" ]
  }
];

const paletteNames = palettes.map(p => p.name)

/**
 * Params
 * - Palette
 * - Wrap ranges
 * - Total Lines
 * - Total Particles (max 100.000)
 * - Sections (min 2, max 8?)
 * - Sprayfactor
 * - Linefactor
 *  
 * Features not params:
 * - rotation direction?(xyz increments)
 */

$fx.params([
  {
    id: "particleCount",
    name: "Particles",
    type: "number",
    default: 1000000,
    options: { min: 1000,max: 10000000,step: 1000 },
  },
  {
    id: "curveCount",
    name: "Curves",
    type: "number",
    default: 100,
    options: { min: 20,max: 1000,step: 1 },
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
    options: { min: 0.2,max: 1.0,step: 0.01 },
  },
  {
    id: "palette_id",
    name: "Palette",
    type: "select",
    options: {
      options: paletteNames,
    }
  },
  //FOR TESTING AND GENERATING PALETTES ONLY
  {id: "color1",name: "Color 1",type: "color"},
  {id: "color2",name: "Color 2",type: "color"},
  {id: "color3",name: "Color 3",type: "color"},
  {id: "color4",name: "Color 4",type: "color"},
  {id: "color5",name: "Color 5",type: "color"},
  {
    id: "colorPick",
    name: "Use custom colors",
    type: "boolean",
  },
])



$fx.features({
  "Palette": $fx.getParam("palette_id"),
})

/**
 * Other Parameters for scene
 */

const particleSmallSpread = 0.1
const particleLargeSpread = 1.5
const bezierRadius = 10
const bezierControlRadius = 10
const particleSmallPower = 5
const particleLargePower = 2

const offsetLerpFactor = helper.FXRandomBetween(0,1) 
const lineLerpFactor = helper.FXRandomBetween(0,1)

/**
 * Start end, and control points for start and end
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

const palettePicks = palettes[palette_index].colors
const colorPicks = [
  $fx.getParam("color1").hex.rgb,
  $fx.getParam("color2").hex.rgb,
  $fx.getParam("color3").hex.rgb,
  $fx.getParam("color4").hex.rgb,
  $fx.getParam("color5").hex.rgb,
]

console.log("colors",colorPicks)
console.log("palette",palettePicks)
const palettePick = $fx.getParam("colorPick") ? colorPicks : palettePicks

const shuffledPalette = palettePick.sort((a, b) => 0.5 - fxrand());

const wrapMin = []
const wrapMax = []
const color1 = []
const color2 = []

const wrapAngle = []



const wrapBool = helper.FXRandomBool(0.5)
const numBez = $fx.getParam("numberOfBezierCurves")
for (let index = 0; index < $fx.getParam("numberOfBezierCurves"); index++) {
  if (index < this.numBez / 4){
      wrapMin[index] = wrapMinStart + (wrapMinEnd-wrapMinStart)*(index/numBez)
      wrapMax[index] = wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*(index/numBez)
      color1[index] =  shuffledPalette[1]
      color2[index] =  shuffledPalette[2]
      wrapAngle[index] = 1.0 * wrapBool
      
  } else if(index < 2 * numBez / 4) {
      wrapMin[index] = -1 * (wrapMinStart + (wrapMinEnd-wrapMinStart)*((index-numBez/4)/numBez))
      wrapMax[index] = -1 * (wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index-numBez/4)/numBez))
      color1[index] = shuffledPalette[3]
      color2[index] = shuffledPalette[1]
      wrapAngle[index] = 1.0 * wrapBool
  } else if (index < 3 * this.numBez / 4){
      wrapMin[index] = wrapMinStart + (wrapMinEnd-wrapMinStart)*((index - numBez/2)/numBez)
      wrapMax[index] = wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index - numBez/2)/numBez)
      color1[index] = shuffledPalette[4]
      color2[index] = shuffledPalette[2]
      wrapAngle[index] = -1.0 * wrapBool
      
  } else  {
      wrapMin[index] = -1 * (wrapMinStart + (wrapMinEnd-wrapMinStart)*((index-3 * numBez/4)/this.numBez))
      wrapMax[index] = -1 * (wrapMaxStart + (wrapMaxEnd-wrapMaxStart)*((index-3 * numBez/4)/this.numBez))
      color1[index] = shuffledPalette[3]
      color2[index] = shuffledPalette[4]
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

const center = new THREE.Vector3()

const geometries = []
const beziers = []
const lines = []
const smallOffsets = []
const largeOffsets = []
const factors = []
const points = [] 

for (let i = 0; i < $fx.getParam("curveCount"); i++) {
  addBezierParticles(i)
  geometries[i].computeBoundingSphere()
  const centerLoc = geometries[i].boundingSphere.center
  center.addScaledVector(centerLoc,1/$fx.getParam("curveCount"))
}
/**
 * Setup the scene
*/


const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color( shuffledPalette[0] )

const geometry = new THREE.BoxGeometry(5,5,5)
const meshes = []
for (let index = 0; index < palettes[palette_index].colors.length; index++) {
  const color = new THREE.Color(shuffledPalette[index])
  const material = new THREE.MeshBasicMaterial(
    {
      color:color
    })
  const mesh = new THREE.Mesh(geometry,material)
  mesh.position.x = index*5
  meshes.push(mesh)

  scene.add(mesh)
  
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

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()




    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

