import { Intersection } from 'three';
import { Node, NodeType } from '../Map/Node';
import { Manager } from './../Manager';
import { ToolHandlerBase } from './ToolHandlerBase';
import { Tools } from './ToolState';

export class ToolHandlerStation extends ToolHandlerBase {

  constructor(manager: Manager){
    super(manager);
    this.tool = Tools.Station;
  }

  onPointerDown(event: PointerEvent, intersect: Intersection){
    if (event.button !== 0 || !intersect)
      return;

      const pos = intersect.point.add(intersect.face.normal);
      this.manager.map.createNode(NodeType.Station, pos)
  }
}