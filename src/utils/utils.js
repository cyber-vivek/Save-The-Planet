export const getCorrectedCoordinates = (event) => {
  return {
    x: event.clientX,
    y: window.innerHeight - event.clientY,
  };
};

export const getAngle = (position, midPoint) => {
  const tanTheta = (position.y - midPoint.y) / (position.x - midPoint.x);
  let angle = Math.atan(tanTheta);
  if (tanTheta > 0) {
    if (position.x < midPoint.x) {
      angle = Math.PI + angle;
    }
  }
  if (tanTheta < 0) {
    if (position.x < midPoint.x) {
      angle = Math.PI + angle;
    } else {
      angle = 2 * Math.PI + angle;
    }
  }
  return angle;
};
