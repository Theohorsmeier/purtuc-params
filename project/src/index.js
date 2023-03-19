import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as helper from "@liamegan1/fxhash-helpers"

/**
 * Palettes
 */
const palettes = [  
  {    
    name: "Kerk",
    colors: [ 0xaaaaaa, 0x0059ff, 0xff5000, 0xffffff, 0x000000 ]
  },
  {    
    name: "Koffie",
    colors: ['#4bb18f', '#c5342f', '#d9c8a7', '#3d230d', '#93bfa4']
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

console.log("colors",
[
  $fx.getParam("color1").hex.rgb,
  $fx.getParam("color2").hex.rgb,
  $fx.getParam("color3").hex.rgb,
  $fx.getParam("color4").hex.rgb,
  $fx.getParam("color5").hex.rgb,
]);

$fx.features({
  "Palette": $fx.getParam("palette_id"),
})

/**
 * Do I want these to be params too????
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
 * Setup the scene
*/
const pallette_index = paletteNames.indexOf($fx.getParam("palette_id"))

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const geometry = new THREE.BoxGeometry(5,5,5)
const meshes = []
for (let index = 0; index < palettes[pallette_index].colors.length; index++) {
  const color = new THREE.Color($fx.getParam("colorPick") ? $fx.getParam("color"+(index+1)).hex.rgb : palettes[pallette_index].colors[index])
  const material = new THREE.MeshBasicMaterial(
    {
      color:color
    })
  const mesh = new THREE.Mesh(geometry,material)
  mesh.position.x = index*5
  meshes.push(mesh)

  scene.add(mesh)
  
}




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

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // mesh.rotation.z += 0.01



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

