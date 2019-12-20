/*eslint-disable */
import { fabric } from "fabric";

let drawRect = rectParams => {
  return new fabric.Rect({
    _rectState: {
      selected: false,
      selectable: false,
      isSelected: false,
      position: rectParams.rectIndex
    },
    lockMovementX: true,
    lockMovementY: true,
    hasControls: false,
    left: rectParams.position.x,
    top: rectParams.position.y,
    width: canvas.width / rectParams.rows.length || 20,
    height: canvas.height / rectParams.rows.length || 20,
    fill: "#004578",
    stroke: "#005a9e"
  });
};
export default drawRect;
