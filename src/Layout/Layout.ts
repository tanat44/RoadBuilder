import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Road, EdgeSaveData, RoadType } from "./Road";
import { Node, NodeSaveData, NodeType } from "./Node";
import { Segment } from "./Segment";
import { SwitchPoint } from "../NavigationMap/SwitchPoint";

export class Layout {
  manager: Manager;
  nodes: Node[];
  roads: Road[];
  segments: Segment[];

  constructor(manager: Manager) {
    this.manager = manager;
    this.nodes = [];
    this.roads = [];
    this.segments = [];
  }

  createNode(type: NodeType, position: Vector3): Node {
    const node = new Node(type, position);
    this.nodes.push(node);
    return node;
  }

  createEdge(fromNode: Node, toNode: Node): Road {
    if (this.isNeighbor(fromNode, toNode)) {
      this.manager.ui.setInfoText("Duplicate edge");
      return null;
    }

    const edge = new Road(fromNode, toNode);
    fromNode.roads.push(edge);
    toNode.roads.push(edge);
    this.roads.push(edge);
    return edge;
  }

  findNodeGameObject(gameObject: Object3D): Node {
    return this.nodes.find((n) => n.gameObject === gameObject);
  }

  findNode(name: string): Node {
    return this.nodes.find((n) => n.gameObject.name === name);
  }

  isNeighbor(node1: Node, node2: Node): boolean {
    for (let i = 0; i < node1.roads.length; ++i) {
      const e = node1.roads[i];
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
    this.roads.forEach((e, idx) => {
      if (e.from !== node && e.to !== node) return;
      if (e.from === node) e.from.removeEdge(e);
      if (e.to === node) e.to.removeEdge(e);
      edgeIndexToRemove.push(idx);
      this.manager.removeObject(e.gameObject);
    });

    for (let i = edgeIndexToRemove.length - 1; i >= 0; --i) {
      this.roads.splice(edgeIndexToRemove[i], 1);
    }
  }

  recalculateEdge(node: Node) {
    node.roads.forEach((r) => {
      r.recalculate();
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

    // road <> road segment
    this.nodes.forEach((n) => {
      const roadPairs = n.getRoadPairs();
      roadPairs.forEach((roadPair) => {
        const r1 = roadPair.road1;
        const r2 = roadPair.road2;
        const sps1 = r1.getSwitchPointAt(n);
        const sps2 = r2.getSwitchPointAt(n);
        const pairs = SwitchPoint.pairSwitchPoint(sps1, sps2);
        const newSegments = Segment.createSegmentFromPairSwitchPoints(
          pairs,
          false
        );
        this.segments = this.segments.concat(newSegments);
      });
    });

    // road <> station segment
    const localRoads = this.getRoadByType(RoadType.LocalRoad);
    localRoads.forEach((r) => {
      const stationNode = r.getNodeByType(NodeType.Station);
      const sp1 = r.getSwitchPointAt(stationNode);
      const intersectionNode = r.getNodeByType(NodeType.Intersection);
      const sp2 = r.getSwitchPointAt(intersectionNode);
      const pairs = SwitchPoint.pairSwitchPoint(sp1, sp2);
      const newSegments = Segment.createSegmentFromPairSwitchPoints(
        pairs,
        true
      );
      this.segments = this.segments.concat(newSegments);
    });

    // inside road segment
    const highway = this.getRoadByType(RoadType.Highway);
    highway.forEach((r) => {
      const sp1 = r.getSwitchPointAt(r.from);
      const sp2 = r.getSwitchPointAt(r.to);
      const pairs = SwitchPoint.pairSwitchPoint(sp1, sp2);
      const newSegments = Segment.createSegmentFromPairSwitchPoints(
        pairs,
        true
      );
      this.segments = this.segments.concat(newSegments);
    });
  }

  getRoadByType(type: RoadType): Road[] {
    return this.roads.filter((e) => e.getRoadType() === type);
  }

  clear() {
    this.nodes = [];
    this.roads = [];
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
    Road.lastId = data.lastEdgeId;
  }
}

export class MapSaveData {
  nodes: NodeSaveData[];
  edges: EdgeSaveData[];

  lastNodeId: number;
  lastEdgeId: number;

  constructor(map: Layout) {
    this.nodes = [];
    map.nodes.forEach((n) => this.nodes.push(n.getSaveData()));

    this.edges = [];
    map.roads.forEach((e) => this.edges.push(e.getSaveData()));

    this.lastNodeId = Node.lastId;
    this.lastEdgeId = Road.lastId;
  }
}
