import { Object3D, Vector3 } from "three"
import { Manager } from "../Manager"
import { Edge } from "./Edge"
import { Node, NodeSaveData, NodeType } from "./Node"

export class Map {

  manager: Manager
  nodes: Node[]
  edges: Edge[]

  constructor(manager: Manager){
    this.manager = manager
    this.nodes = []
    this.edges = []
  }

  createNode(type: NodeType, position: Vector3) {
    let material = type === NodeType.Intersection ? this.manager.assets.intersectionMaterial : this.manager.assets.stationMaterial
    const gameObject = this.manager.assets.createCube(position, material)
    const node = new Node(type, gameObject)
    this.nodes.push(node)
  }

  addEdge(edge: Edge){
    this.edges.push(edge)
  }

  findNodeGameObject(gameObject: Object3D): Node {
    return this.nodes.find(n => n.gameObject = gameObject)
  }

  removeNode(node: Node){
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
      this.manager.removeObject(node.gameObject)
    }
  }

  clear(){
    this.nodes = []
    this.edges = []
  }

  getSaveData(): MapSaveData {
    return new MapSaveData(this)
  }

  load(data: MapSaveData) {
    this.clear()
    data.nodes.forEach(n => this.createNode(n.type, n.position));
  }
}

export class MapSaveData{
  nodes: NodeSaveData[]

  constructor(map: Map){
    this.nodes = []
    map.nodes.forEach(n => this.nodes.push(n.getSaveData()))
  }
}