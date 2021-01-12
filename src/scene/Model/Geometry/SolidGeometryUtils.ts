class SolidGeometryUtils {
  translateGeo(geo: any, offsetV: any) {
    const solids = geo.solids;
    for (const solid of solids) {
      this.translateSolid(solid, offsetV);
    }
  }
  translateSolid(solid: any, offsetV: any) {
    const faces = solid.faces;
    for (const faceElement of faces) {
      this.translateFace(faceElement, offsetV);
    }
  }
  translateFace(face: any, offsetV: any) {
    const innerLoops = face.innerLoop;
    for (const loop of innerLoops) {
      this.translateLoop(loop, offsetV);
    }
    const outLoops = face.outLoop;
    for (const loop of outLoops) {
      this.translateLoop(loop, offsetV);
    }
  }

  public translateLoop(loop: any, offsetV: any) {
    for (const vertex of loop) {
      this.translateVertex(vertex, offsetV);
    }
  }

  public translateVertex(vertex: any, offsetV: any) {
    vertex.x = vertex.x + offsetV.x;
    vertex.y = vertex.y + offsetV.y;
    vertex.z = vertex.z + offsetV.z;
  }
}
export default new SolidGeometryUtils();
