//import * as THREE from 'three';
import * as THREE from '../node_modules/three/build/three.module.js'
import brickImgUrl from '/assets/Bricks.jpg';

/**
 * 获取一个在 [a, b] 区间内的随机整数。
 *
 * @param a 整数a
 * @param b 整数b
 * @returns 返回一个在 [a, b] 区间内的随机整数
 */
function getRandomInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

/**
 * 生成一个介于[a, b]之间的随机浮点数
 *
 * @param a 最小值
 * @param b 最大值
 * @returns 返回介于[a, b]之间的随机浮点数
 */
function getRandomFloat(a, b) {
    return Math.random() * (b - a) + a;
}

function randomColorAround(meanColor, delta) {
    const r = Math.min(getRandomFloat((meanColor >> 16) - delta, (meanColor >> 16) + delta) / 255, 1);
    const g = Math.min(getRandomFloat((meanColor >> 8 & 0xff) - delta, (meanColor >> 8 & 0xff) + delta) / 255, 1);
    const b = Math.min(getRandomFloat((meanColor & 0xff) - delta, (meanColor & 0xff) + delta) / 255, 1);

    //console.log("color", r, g, b);
    return new THREE.Color(r, g, b);
}

/*
const geometry2 = new THREE.BufferGeometry().setFromPoints(points);
const material1 = new THREE.LineBasicMaterial( {
	color: 0xffffff,
	linewidth: 10,
	linecap: 'round', //ignored by WebGLRenderer
	linejoin:  'round' //ignored by WebGLRenderer
} );

const line = new THREE.LineSegments(geometry2, material1);
scene.add(line);
*/



/**
 * 创建坐标轴
 */
function createCoodAxis(scene) {
    const side = 10;
    const width = 0.3;

    // 创建坐标轴
    const geometry = new THREE.BoxGeometry(side, width, width);
    const material = new THREE.MeshBasicMaterial({ color: 0x11ff11 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 10, 0);
    scene.add(cube);

    // 创建立方体
    const cube2 = new THREE.Mesh(new THREE.BoxGeometry(width, side, width), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    cube2.position.set(0, 10, 0);
    scene.add(cube2);

    // 创建立方体
    const cube3 = new THREE.Mesh(new THREE.BoxGeometry(width, width, side), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    cube3.position.set(0, 10, 0);
    scene.add(cube3);
}



/**
 * 向场景中添加光源
 *
 * @param scene THREE.Scene - 要添加光源的场景
 */
function addLight(scene) {
    const color = 0xFFFFFF;
    const intensity = 1;
    //const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // PointLight
    const light = new THREE.AmbientLight(color, intensity);
    light.power = 8000;
    light.distance = Infinity;
    light.position.set(0, 20, 0);
    //light.castShadow = true;
    scene.add(light);

    const helper = new THREE.PointLightHelper(light);
    scene.add(helper);
}

function addPlain(scene){
    const geometry = new THREE.PlaneGeometry(200, 200);
    const plainTexture = new THREE.TextureLoader().load( brickImgUrl );
    const plainMaterial = new THREE.MeshBasicMaterial({ map: plainTexture });
    const plane = new THREE.Mesh(geometry, plainMaterial);
    plane.receiveShadow = true;
    plane.position.set( 0, 0, 0 );
    plane.rotation.x = - Math.PI /2;
    scene.add(plane);

}

export { getRandomInt, getRandomFloat, randomColorAround, createCoodAxis, addLight, addPlain };