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

  /**
   * @author lianbo
   * @date 2021-01-15 11:08:45
   * @Description: 一天到晚就是大写小写，真他妈的傻逼
   */
  public translateVertex(vertex: any, offsetV: any) {
    if (vertex.X !== undefined && vertex.X !== null) {
      vertex.X = vertex.X + offsetV.x;
      vertex.Y = vertex.Y + offsetV.y;
      vertex.Z = vertex.Z + offsetV.z;
    } else {
      vertex.x = vertex.x + offsetV.x;
      vertex.y = vertex.y + offsetV.y;
      vertex.z = vertex.z + offsetV.z;
    }
  }
}
export default new SolidGeometryUtils();
