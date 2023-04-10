import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

import * as three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab2Page implements AfterViewInit {
  @ViewChild('rendererCanvas', { static: true }) rendererCanvas: any;
  private renderer: three.WebGLRenderer;
  private scene: three.Scene;
  private camera: three.PerspectiveCamera;
  private directionalLight: three.DirectionalLight;
  private orbitcontrols: OrbitControls;

  constructor() {
    this.renderer = new three.WebGLRenderer();
    this.scene = new three.Scene();
    this.camera = new three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight / 2,
      0.1,
      1000
    );
    this.directionalLight = new three.DirectionalLight(0xeeeffee, 0.8);

    this.orbitcontrols = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
  }

  ngAfterViewInit(): void {
    this.buildScene();
    this.loadGLTFModel();
  }

  buildScene(): void {
    this.renderer.shadowMap.enabled = true;
    console.log(this.rendererCanvas.nativeElement.offsetWidth);
    console.log(this.rendererCanvas.nativeElement.offsetHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight / 2);
    this.rendererCanvas.nativeElement.appendChild(this.renderer.domElement);

    // const boxgeo = new three.BoxGeometry();
    // const boxmat = new three.MeshStandardMaterial({
    //   color: 0x00ff00,
    // });
    // const box = new three.Mesh(boxgeo, boxmat);
    // this.scene.add(box);
    // box.receiveShadow = true;
    // box.castShadow = true;

    this.directionalLight.position.set(-3, 10, 0);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.bottom = -12;
    const dlighthelper = new three.DirectionalLightHelper(
      this.directionalLight,
      10
    );
    this.scene.add(dlighthelper);
    this.scene.add(this.directionalLight);

    const axes = new three.AxesHelper(20);
    this.scene.add(axes);

    this.camera.position.set(0, 2, 0);
    this.orbitcontrols.update();

    this.renderer.render(this.scene, this.camera);
    this.renderer.setAnimationLoop(this.animate);
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
  }

  loadGLTFModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/assets/harness.glb',
      (gltf) => {
        console.log(gltf);
        gltf.scene.position.set(1, 1, 1);
        gltf.scene.traverse((c) => {
          c.castShadow = true;
        });
        this.scene?.add(gltf.scene);

        this.renderer?.render(this.scene, this.camera);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.log('An error happened');
      }
    );
  }
}
