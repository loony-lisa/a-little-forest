//import * as THREE from 'three';
import * as THREE from 'three'
import {getRandomInt, getRandomFloat, randomColorAround, createCoodAxis, addLight, addPlain } from './tools.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import circleImgUrl from '/assets/circle.png'; // 将图片加之public目录下, 是不需要经过模块处理或hash处理的静态资源


//import * as dat from "dat.gui";

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x999999 );
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias:true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

/*
var gui = new dat.GUI();  
var thickness = 0.8;
gui.add({ trunkThickness: thickness }, 'trunkThickness').min(0.1).max(2).step(0.1).onChange(function(value) {  
    thickness = value;
    // 遍历场景中的所有子物体，并将它们从场景中移除  
    while (scene.children.length > 0) {  
        scene.remove(scene.children[0]);  
    }  
    init();
    render();
});

*/

// MeshLambertMaterial
//MeshBasicMaterial
//MeshPhongMaterial
const branchMaterial = new THREE.MeshPhongMaterial({ color: 0x3d3d29 });

// 地图相机控件
const controls = new MapControls( camera, renderer.domElement );

function initControls() {
    //controls.enableDamping = true;
    //controls.enablePan = false;
    controls.enaleZoom = false;
    controls.listenToKeyEvents (window);
    controls.addEventListener( 'change', render );

    controls.screenSpacePanning = false;

    // How far you can orbit vertically
    controls.maxPolarAngle = Math.PI/2 - 0.2;
    controls.minPolarAngle = Math.PI/2 - 0.2;
    // How far you can orbit horizontally
    controls.minAzimuthAngle = Math.PI/2;
    controls.maxAzimuthAngle = Math.PI/2;

    // same value, can not zoom
    controls.minDistance = 100;
    controls.maxDistance = 100;

    // 平移速度
    controls.panSpeed = 1.2; 

    controls.update();
}



var verticeArray = [];

// 创建Points
function createLeavesPoints() {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( verticeArray );

    const leavesNumber = verticeArray.length / 3;

    var sizes = new Float32Array( leavesNumber );
    for (let i = 0; i < leavesNumber; i++) {
        sizes[i] = 18;
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

    //const loader = new THREE.TextureLoader();
    //var ylj = require('../assets/imgs/img.webp')
    // const sprite = loader.load( '../textures/disc.png');
    //2kiloapple.net/wp-content/uploads/2024/01/circle.png

    const texture = new THREE.TextureLoader().load( circleImgUrl );
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.wrapT = THREE.RepeatWrapping;

    const pointMaterial = new THREE.PointsMaterial({ 
        size: 5,
        sizeAttenuation: true, // 近大远小
        transparent: true,
        color: 0x32cd32,
        map: texture });
    /*
    const pointMaterial = new THREE.ShaderMaterial( {
        uniforms: {
        
            time: { value: 1.0 },
            color: { value: new THREE.Color( 0x00ee00 ) },
            pointTexture: { value: texture }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

        //blending: THREE.AdditiveBlending,
        //depthTest: true,
    	side: THREE.DoubleSide,
		transparent: true
    } );
    */

    const particles = new THREE.Points(geometry, pointMaterial);
    
    scene.add(particles, camera);

}


/**
 * 创建树
 *
 * @param {number} options.x - 树的x坐标
 * @param {number} options.y - 树的y坐标
 * @param {number} options.z - 树的z坐标
 * @param {number} branchLength - 树枝长度
 */
function createTree({x, y, z}, branchLength) {
    const maxSubBranchNum = 3;
    // 使底层树干长度随机
    const randomBranchLength = branchLength * getRandomFloat(0.9, 1.1);
    const thickness = 0.5;
    // 创建最底层树干
    const ny = y + randomBranchLength;
    const cube = new THREE.Mesh(new THREE.CylinderGeometry(thickness, thickness, ny, 5), branchMaterial);
    cube.castShadow = true;
    cube.position.set(x, ny/2, z);
    scene.add(cube);

    // 分支层可参考的轴
    const parentAxis = new THREE.Vector3(0, 1, 0)
    // 创建分支层
    createBranchLayer({x: x, y: ny, z: z}, maxSubBranchNum, parentAxis, 3, thickness, branchLength * 0.8);
    createLeavesPoints();
}


/**
 * 创建分支层
 *
 * @param {THREE.Vector3} rootPoint - 根节点位置
 * @param {number} maxSubBranchNum - 最大子分支数量
 * @param {THREE.Vector3} parentAxis - 父节点轴
 * @param {number} leftLayers - 剩余层数
 * @param {number} thickness - 厚度
 * @param {number} length - 长度
 */
function createBranchLayer(rootPoint, maxSubBranchNum, parentAxis, leftLayers, thickness, length) {

    // 单节点分支的数量：[maxSubBranchNum - 1, maxSubBranchNum]
    const anctualSubBranchNum = getRandomInt(maxSubBranchNum - 1, maxSubBranchNum);
    //const anctualSubBranchNum = maxSubBranchNum;
    // 分支的初始旋转角度 TODO 让它变成一个随机数
    var subBranchAngle = getRandomFloat(0, 2 * Math.PI/anctualSubBranchNum);

    // 当前层依次生成树枝
    for (let i = 0; i < anctualSubBranchNum; i++) {

        // 随机生成树枝长度
        var randomBranchLength = length * getRandomFloat(0.9, 1.1);
        //var randomBranchLength = 12;

        const geometry = new THREE.CylinderGeometry(thickness, thickness, randomBranchLength, 6);
        const cube = new THREE.Mesh(geometry, branchMaterial);
        cube.castShadow = true;
        // 向外倾斜角度
        const angleX = getRandomFloat(0.1 * Math.PI, 0.2 * Math.PI);
        //console.log("angle", angleX);
        //const angleX = Math.PI / 6;
        cube.rotation.x = angleX;

        // 旋转角度
        const angleY = subBranchAngle + getRandomFloat(0, 0.5);
        //const angleY = Math.PI / 4;
        cube.rotateOnWorldAxis(parentAxis, angleY);

        cube.position.y = rootPoint.y + randomBranchLength * Math.cos(angleX) * 0.5;
        cube.position.x = rootPoint.x + randomBranchLength * Math.sin(angleX) * Math.sin(angleY) * 0.5;
        cube.position.z = rootPoint.z + randomBranchLength * Math.sin(angleX) * Math.cos(angleY) * 0.5;
        //console.log(cube.position.x, cube.position.y, cube.position.z);

        // 下一层的树干的起始位置
        const leafX = rootPoint.x + randomBranchLength * Math.sin(angleX) * Math.sin(angleY);
        const leafY = rootPoint.y + randomBranchLength * Math.cos(angleX);
        const leafZ = rootPoint.z + randomBranchLength * Math.sin(angleX) * Math.cos(angleY);
        const branchLeafPoint = {x: leafX, y: leafY, z: leafZ};

        scene.add(cube);

        // 生成树叶
        addLeaves(rootPoint, branchLeafPoint, 5);
    
        // 生成下一层
        if (leftLayers > 1) {
            createBranchLayer(branchLeafPoint, maxSubBranchNum, cube.up, leftLayers-1, thickness*0.5, length*0.8);
            //console.log(new THREE.Vector3(cube.rotation.x, cube.rotation.y, cube.rotation.z));
        }

        subBranchAngle += 2 * Math.PI / anctualSubBranchNum;
    }
}

/**
 * 在给定的两个点之间添加叶子
 *
 * @param rootPoint 根点
 * @param branchLeafPoint 分支叶点
 * @param density 密度
 */
function addLeaves(rootPoint, branchLeafPoint, density){

    const geometry = new THREE.CircleGeometry(0.5, 4);
    const fromBranch = 1;

    var material = new THREE.MeshBasicMaterial( { color: 0x33ba33 } );

    for (let i = 0; i < density; i++) {
        const prop = Math.random();
        // 计算叶子位置, 使叶子生长在枝干附近
        const meanX = rootPoint.x + (branchLeafPoint.x - rootPoint.x) * prop;
        const meanY = rootPoint.y + (branchLeafPoint.y - rootPoint.y) * prop;
        const meanZ = rootPoint.z + (branchLeafPoint.z - rootPoint.z) * prop;
        const x = getRandomFloat(meanX - fromBranch, meanX + fromBranch);
        const y = getRandomFloat(meanY - fromBranch, meanY + fromBranch);
        const z = getRandomFloat(meanZ - fromBranch, meanZ + fromBranch);

        //material.color = randomColorAround(0x33aa33, 60);
        //const circle = new THREE.Mesh(geometry, material);
        //circle.position.set(x, y, z);
        //circle.rotation.y = getRandomFloat(0, Math.PI);
        verticeArray.push(x, y, z);
        //scene.add( circle );
    }
}


// 用于调试，旋转看景
//animate();
initControls();

init();

render();

function init() {

    // 创建平面
    addPlain(scene);

    // 创建坐标轴
    createCoodAxis(scene);

    // 创建两排树
    var baseBranchLength = 15; //最底下树干长度
    for (let i = -30; i < 50; i+=20) {
        createTree({x: i, y: 0, z: -15}, baseBranchLength);
        createTree({x: i, y: 0, z: 15}, baseBranchLength);
    }

    // 创建灯光
    addLight(scene);
/*
    camera.position.x = 60;
    camera.position.y = 10;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0, 20, 0)); 
    */
}

/**
 * 动画函数 
 *
 * @returns {void}
 */
function animate() {
    requestAnimationFrame(animate);

    console.log("Azimuthal", controls.getAzimuthalAngle());
    console.log("Polar", controls.getPolarAngle());

    renderer.render(scene, camera);
}

function render() {
/*
    camera.position.x = 60;
    camera.position.y = 10;
    camera.position.z = 0;
    camera.lookAt(new THREE.Vector3(0, 20, 0)); 
*/
    renderer.render(scene, camera);
}
