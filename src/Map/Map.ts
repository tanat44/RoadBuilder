import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Edge, EdgeSaveData } from "./Edge";
import { Node, NodeSaveData, NodeType } from "./Node";
import { Segment } from "./Segment";

export class Map {
  manager: Manager;
  nodes: Node[];
  edges: Edge[];
  segments: Segment[];

  constructor(manager: Manager) {
    this.manager = manager;
    this.nodes = [];
    this.edges = [];
    this.segments = [];
  }

  createNode(type: NodeType, position: Vector3): Node {
    const node = new Node(type, position);
    this.nodes.push(node);
    return node;
  }

  createEdge(fromNode: Node, toNode: Node): Edge {
    if (this.isNeighbor(fromNode, toNode)) {
      this.manager.ui.setInfoText("Duplicate edge");
      return null;
    }

    const edge = new Edge(fromNode, toNode);
    fromNode.edges.push(edge);
    toNode.edges.push(edge);
    this.edges.push(edge);
    return edge;
  }

  findNodeGameObject(gameObject: Object3D): Node {
    return this.nodes.find((n) => n.gameObject === gameObject);
  }

  findNode(name: string): Node {
    return this.nodes.find((n) => n.gameObject.name === name);
  }

  isNeighbor(node1: Node, node2: Node): boolean {
    for (let i = 0; i < node1.edges.length; ++i) {
      const e = node1.edges[i];
      if (
        e.from.getName() === node2.getName() ||
        e.to.getName() === node2.getName()
      ) {
        return true;
      }
    }
    return false;
  }

  removeNode(node: Node) {
    // remove node
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
      this.manager.removeObject(node.gameObject);
    }

    // remove edge
    let edgeIndexToRemove: number[] = [];
    this.edges.forEach((e, idx) => {
      if (e.from !== node && e.to !== node) return;
      if (e.from === node) e.from.removeEdge(e);
      if (e.to === node) e.to.removeEdge(e);
      edgeIndexToRemove.push(idx);
      this.manager.removeObject(e.gameObject);
    });

    for (let i = edgeIndexToRemove.length - 1; i >= 0; --i) {
      this.edges.splice(edgeIndexToRemove[i], 1);
    }
  }

  recalculateEdge(node: Node) {
    node.edges.forEach((e) => {
      e.updateEdgeTransform(e.gameObject);
    });
  }

  deleteSegment() {
    this.segments.forEach((s) => {
      this.manager.removeObject(s.gameObject);
    });
    this.segments = [];
  }

  calculateSegment() {
    this.deleteSegment();

    const laneGap = 10;
    const d1 = 30; // distance between node and closer control point
    const d2 = 120; // distance between node and further control point
    this.nodes.forEach((n) => {
      const edgePairs = n.getEdgePairs();
      edgePairs.forEach((pair) => {
        // make sure direction pointing out from this node
        const dir1 = pair.edge1.getDirection(n);
        const dir2 = pair.edge2.getDirection(n);

        // [[ p0 <-- dir1 --- p1 <-- dir1 --- ]] n [[ --- dir2 ---> p2 --- dir2 ---> p3 ]]
        const p0 = n.getPosition().add(dir1.clone().multiplyScalar(d2));
        const p1 = n.getPosition().add(dir1.clone().multiplyScalar(d1));
        const p2 = n.getPosition().add(dir2.clone().multiplyScalar(d1));
        const p3 = n.getPosition().add(dir2.clone().multiplyScalar(d2));
        this.segments.push(new Segment([p0, p1, p2, p3]));
      });
    });
  }

  clear() {
    this.nodes = [];
    this.edges = [];
    this.segments = [];
  }

  getSaveData(): MapSaveData {
    return new MapSaveData(this);
  }

  load(data: MapSaveData) {
    this.clear();
    if (data.nodes)
      data.nodes.forEach((n) => {
        const node = this.createNode(n.type, n.position);
        node.gameObject.name = n.name;
      });
    if (data.edges)
      data.edges.forEach((e) => {
        const fromNode = this.findNode(e.from);
        const toNode = this.findNode(e.to);
        if (!fromNode || !toNode) {
          console.error(`Cannot find Node from/to ${e.from}/${e.to}`);
          return;
        }
        const edge = this.createEdge(fromNode, toNode);
        edge.gameObject.name = e.name;
      });
    Node.lastId = data.lastNodeId;
    Edge.lastId = data.lastEdgeId;
  }
}

export class MapSaveData {
  nodes: NodeSaveData[];
  edges: EdgeSaveData[];

  lastNodeId: number;
  lastEdgeId: number;

  constructor(map: Map) {
    this.nodes = [];
    map.nodes.forEach((n) => this.nodes.push(n.getSaveData()));

    this.edges = [];
    map.edges.forEach((e) => this.edges.push(e.getSaveData()));

    this.lastNodeId = Node.lastId;
    this.lastEdgeId = Edge.lastId;
  }
}
