import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

import * as three from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, CommonModule],
})
export class Tab2Page implements AfterViewInit {
  @ViewChild('rendererCanvas', { static: false }) rendererCanvas: any;
  private renderer: three.WebGLRenderer;
  private scene: three.Scene;
  private camera!: three.PerspectiveCamera;
  private directionalLight!: three.DirectionalLight;
  private orbitcontrols!: OrbitControls;
  private ambientLight!: three.AmbientLight;
  private glbModel!: GLTF;
  cw!: number;
  ch!: number;
  sceneReady: boolean;
  modelLoadProgress: number;
  sensors: any[];

  constructor() {
    this.renderer = new three.WebGLRenderer({ antialias: true });
    this.scene = new three.Scene();
    this.sceneReady = false;
    this.modelLoadProgress = 0;
    this.sensors = [
      { name: 'Heartrate', status: 'OK', statusCode: 1, icon: 'heart-pulse' },
      {
        name: 'Temperature',
        status: 'OK',
        statusCode: 1,
        icon: 'temperature-sun',
      },
      {
        name: 'Microphone',
        status: 'OK',
        statusCode: 1,
        icon: 'circle-microphone',
      },
      { name: 'Camera', status: 'OK', statusCode: 1, icon: 'camera-security' },
      {
        name: '3D Safety Vision',
        status: 'OK',
        statusCode: 1,
        icon: 'chart-network',
      },
      { name: 'Alarm Speaker', status: 'OK', statusCode: 1, icon: 'siren-off' },
      {
        name: 'Battery',
        status: 'OK',
        statusCode: 1,
        value: 87,
        icon: 'battery-bolt',
      },
      { name: 'Wifi', status: 'OK', statusCode: 1, icon: 'wifi' },
      { name: 'Bluetooth', status: 'OK', statusCode: 1, icon: 'bluetooth' },
      { name: 'GPS', status: 'OK', statusCode: 1, icon: 'location-dot' },
    ];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cw = this.rendererCanvas.nativeElement.offsetWidth;
      this.ch = this.rendererCanvas.nativeElement.offsetHeight;
      this.buildScene();
      this.loadGLTFModel();
    }, 500);
  }

  buildScene(): void {
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(this.cw, this.ch);
    this.rendererCanvas.nativeElement.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.setupCamera();
    this.setupOrbitControls();

    this.renderer.render(this.scene, this.camera);
  }

  setupLighting() {
    this.directionalLight = new three.DirectionalLight(0xeeeffee, 10);
    this.ambientLight = new three.AmbientLight(0x404040, 10);
    this.directionalLight.position.set(-3, 10, 0);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.bottom = -12;
    this.scene.add(this.directionalLight);
    this.scene.add(this.ambientLight);
  }

  setupCamera() {
    this.camera = new three.PerspectiveCamera(75, this.cw / this.ch, 0.1, 1000);
    this.camera.position.set(-0.88, -0.07, -0.81);
  }

  setupOrbitControls() {
    this.orbitcontrols = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitcontrols.update();
  }

  animate(self: Tab2Page) {
    return () => {
      // self.glbModel.scene.rotation.x += 0.01;
      self.glbModel.scene.rotation.y += 0.001;
      self.renderer.render(self.scene, self.camera);
      // console.log(self.camera.position);
    };
  }

  loadGLTFModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/DogHarness.glb',
      (gltf: GLTF) => {
        this.sceneReady = true;
        this.glbModel = gltf;
        // console.log(gltf);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.traverse((c) => {
          c.castShadow = true;
        });
        this.scene.add(gltf.scene);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setAnimationLoop(this.animate(this));
      },
      (xhr) => {
        this.modelLoadProgress = (xhr.loaded / xhr.total) * 100;
      },
      (error) => {
        console.log('An error happened');
      }
    );
  }
}
